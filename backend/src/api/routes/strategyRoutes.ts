import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validateBody } from '../middleware/requestValidator.js';
import { strategyEngine } from '../../engine/strategyEngine.js';
import { unwindEngine } from '../../engine/unwindEngine.js';
import { marketEligibilityEngine } from '../../engine/marketEligibility.js';
import { db } from '../../db/database.js';
import { spotExecutors } from '../../engine/spotExecutor.js';

/**
 * On Monad testnet, API secrets may be shorter than 32 bytes.
 * We accept any non-empty hex string (with or without 0x prefix) for testnet compatibility.
 */
const hexSecretRegex = /^(0x)?[0-9a-fA-F]{1,128}$/;
function padSecretToBytes(hex: string): Buffer {
  const clean = hex.replace(/^0x/, '');
  // Right-pad with zeros to 64 hex chars (32 bytes) if needed — testnet safe
  const padded = clean.padEnd(64, '0').slice(0, 64);
  return Buffer.from(padded, 'hex');
}

const enterSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  marketId: z.string().default('MON'),
  depositAmount: z.number().positive(),
  leverage: z.number().min(1).max(2).default(1),
  maxSlippageBps: z.number().default(50),
  apiKey: z.string().min(1),
  apiSecretHex: z.string().regex(hexSecretRegex, 'Must be a hex string (any length)'),
  // Client-signed Kuru spot execution — provided by mobile app
  spotTxHash: z.string().optional(),
  filledBaseQty: z.number().optional(),
});

const unwindSchema = z.object({
  positionId: z.string(),
  reason: z.string().default('USER_REQUESTED'),
  apiKey: z.string().min(1),
  apiSecretHex: z.string().regex(hexSecretRegex, 'Must be a hex string (any length)'),
  // Client-signed Kuru spot sell — provided by mobile app
  spotSellTxHash: z.string().optional(),
  filledSellQty: z.number().optional(),
});

const rebalanceSchema = z.object({
  positionId: z.string(),
  reason: z.string().default('MANUAL_USER_REBALANCE'),
  targetMarginRatio: z.number().optional().default(1.0),
  spotTxHash: z.string().optional(),
  filledBaseQty: z.number().optional(),
});

const eligibilitySchema = z.object({
  marketId: z.string().default('MON'),
  intendedNotionalUsd: z.number().positive().default(1000),
  kuruMidPrice: z.number().positive().default(2666),
  kuruDepthWithinHalfPctUsd: z.number().positive().default(50000),
  perplTrailingAvgFundingRate: z.number().default(0.0002),
  fundingVolatility: z.number().default(0.01),
  perplOpenInterestUsd: z.number().default(250000),
  perplSpreadBps: z.number().default(5),
  ausdCurrentPrice: z.number().default(1.0002),
});

export async function strategyRoutes(fastify: FastifyInstance) {
  // 1. Evaluate Pre-trade Market Eligibility
  fastify.post(
    '/api/v1/strategy/check-eligibility',
    { preHandler: validateBody(eligibilitySchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof eligibilitySchema>;
      const evaluation = marketEligibilityEngine.evaluate(body);

      return {
        success: true,
        data: evaluation,
        timestamp: Date.now(),
      };
    }
  );

  // 2. Execute Coordinated Dual-Leg Entry
  // The mobile app should:
  //   a) Call GET /api/v1/market/quote to get sizing
  //   b) Sign and submit the Kuru spot buy directly (user's Mera wallet)
  //   c) Pass spotTxHash + filledBaseQty to this endpoint
  //   d) This endpoint handles the Perpl short leg
  fastify.post(
    '/api/v1/strategy/enter',
    { preHandler: validateBody(enterSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof enterSchema>;
      const secretBytes = padSecretToBytes(body.apiSecretHex);

      // Register the client-signed Kuru spot fill if provided
      if (body.spotTxHash && body.filledBaseQty) {
        spotExecutors.registerClientSignedFill(body.spotTxHash, body.filledBaseQty);
      }

      try {
        const position = await strategyEngine.executeEntry({
          ownerAddress: body.ownerAddress as `0x${string}`,
          marketId: body.marketId,
          depositAmount: body.depositAmount,
          leverage: body.leverage,
          maxSlippageBps: body.maxSlippageBps,
          perplApiKey: body.apiKey,
          perplSecretBytes: secretBytes,
        });

        // Save to persistent database
        db.savePosition(position);

        // Deduct deposited capital from available user balance
        db.deductBalance(body.ownerAddress, body.depositAmount);

        return {
          success: true,
          data: position,
          timestamp: Date.now(),
        };
      } finally {
        spotExecutors.clear(); // Always clear one-shot executor after use
      }
    }
  );

  // 3. Manual "Rebalance Now" — requires pre-submitted Kuru tx from mobile
  fastify.post(
    '/api/v1/strategy/rebalance',
    { preHandler: validateBody(rebalanceSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof rebalanceSchema>;
      const position = db.getPosition(body.positionId);

      if (!position) {
        throw new Error(`Position ${body.positionId} not found`);
      }

      if (position.state !== 'ACTIVE') {
        throw new Error(`Position ${body.positionId} is not active (state: ${position.state})`);
      }

      const oldSpot = parseFloat(position.spotLeg.quantity);
      const oldPerp = parseFloat(position.perpLeg.quantity);
      const driftRatio = oldPerp > 0 ? Math.abs(oldSpot - oldPerp) / oldPerp : 0;

      if (driftRatio <= 0.01) {
        return {
          success: true,
          data: {
            positionId: position.positionId,
            status: 'NO_ACTION_NEEDED',
            driftBps: Math.round(driftRatio * 10000),
          },
          timestamp: Date.now(),
        };
      }

      // If mobile supplied a pre-signed Kuru rebalance tx, register it
      if (body.spotTxHash && body.filledBaseQty) {
        spotExecutors.registerClientSignedFill(body.spotTxHash, body.filledBaseQty);
        // Record rebalance in position history
        position.spotLeg.quantity = body.filledBaseQty.toFixed(6);
        db.savePosition(position);
        spotExecutors.clear();
        return {
          success: true,
          data: {
            positionId: position.positionId,
            status: 'REBALANCED',
            driftBps: Math.round(driftRatio * 10000),
            newSpotQty: body.filledBaseQty,
          },
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: {
          positionId: position.positionId,
          status: 'REBALANCE_PENDING_CLIENT_TX',
          driftBps: Math.round(driftRatio * 10000),
          message: 'Please submit the Kuru spot adjustment tx from the mobile app, then call this endpoint with spotTxHash + filledBaseQty',
        },
        timestamp: Date.now(),
      };
    }
  );

  // 4. Execute 1-Tap Unwind
  fastify.post(
    '/api/v1/strategy/unwind',
    { preHandler: validateBody(unwindSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof unwindSchema>;
      const position = db.getPosition(body.positionId);

      if (!position) {
        throw new Error(`Position ${body.positionId} not found`);
      }

      const secretBytes = padSecretToBytes(body.apiSecretHex);

      // Register client-signed Kuru sell if provided
      if (body.spotSellTxHash && body.filledSellQty) {
        spotExecutors.registerClientSignedFill('', 0, body.spotSellTxHash);
      }

      try {
        const unwindResult = await unwindEngine.executeUnwind(
          position,
          body.apiKey,
          secretBytes,
          body.reason
        );

        // Update position state and persist
        position.state = 'CLOSED';
        db.savePosition(position);

        // Credit returned capital back to user balance
        const returnedAmount = parseFloat(unwindResult.totalReturnedAusd) || 0;
        db.creditBalance(position.ownerAddress, returnedAmount);

        return {
          success: true,
          data: unwindResult,
          timestamp: Date.now(),
        };
      } finally {
        spotExecutors.clear();
      }
    }
  );
}

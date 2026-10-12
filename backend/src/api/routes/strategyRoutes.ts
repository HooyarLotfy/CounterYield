import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validateBody } from '../middleware/requestValidator.js';
import { strategyEngine } from '../../engine/strategyEngine.js';
import { unwindEngine } from '../../engine/unwindEngine.js';
import { marketEligibilityEngine } from '../../engine/marketEligibility.js';
import { db } from '../../db/database.js';
import { spotExecutors } from '../../engine/spotExecutor.js';

const enterSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  marketId: z.string().default('MON'),
  depositAmount: z.number().positive(),
  leverage: z.number().min(1).max(2).default(1),
  maxSlippageBps: z.number().default(50),
  apiKey: z.string().min(1),
  apiSecretHex: z.string().regex(/^(0x)?[0-9a-fA-F]{64}$/),
});

const unwindSchema = z.object({
  positionId: z.string(),
  reason: z.string().default('USER_REQUESTED'),
  apiKey: z.string().min(1),
  apiSecretHex: z.string().regex(/^(0x)?[0-9a-fA-F]{64}$/),
});

const rebalanceSchema = z.object({
  positionId: z.string(),
  reason: z.string().default('MANUAL_USER_REBALANCE'),
  targetMarginRatio: z.number().optional().default(1.0),
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
  fastify.post(
    '/api/v1/strategy/enter',
    { preHandler: validateBody(enterSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof enterSchema>;
      const secretBytes = Buffer.from(body.apiSecretHex.replace(/^0x/, ''), 'hex');

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

      return {
        success: true,
        data: position,
        timestamp: Date.now(),
      };
    }
  );

  // 3. Manual "Rebalance Now" Guaranteed User Action
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

      // Hedge drift = |spot - perp| / perp (spec 6.3: rebalance the smaller leg above 1%).
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

      // Drift correction trades the smaller leg and needs the user-signed spot executor.
      spotExecutors.require();
      throw new Error('Drift rebalance execution is not implemented for the backend path; use the in-app engine');
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

      const secretBytes = Buffer.from(body.apiSecretHex.replace(/^0x/, ''), 'hex');
      const unwindResult = await unwindEngine.executeUnwind(
        position,
        body.apiKey,
        secretBytes,
        body.reason
      );

      // Update position state and persist
      position.state = 'CLOSED';
      db.savePosition(position);

      return {
        success: true,
        data: unwindResult,
        timestamp: Date.now(),
      };
    }
  );
}

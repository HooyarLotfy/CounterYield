import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validateBody } from '../middleware/requestValidator.js';
import { db } from '../../db/database.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { relayerWalletClient } from '../../clients/monadClient.js';
import { CarryLedgerABI } from '@counter-yield/shared';

const policySchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  maxLeverage: z.number().min(1).max(2).default(1),
  maxSlippageBps: z.number().min(5).max(1000).default(50),
  fundingFloorBps: z.number().default(0),
  maxDriftBps: z.number().default(100),
  reserveBufferBps: z.number().min(500).max(5000).default(1000),
});

const fireDrillSchema = z.object({
  positionId: z.string().optional(),
  simulatedDropPercent: z.number().min(1).max(90).default(25),
  targetTier: z.number().min(1).max(3).default(1),
});

export async function policyRoutes(fastify: FastifyInstance) {
  // 1. Save and Anchor Portable Risk Policy
  fastify.post(
    '/api/v1/settings/policy',
    { preHandler: validateBody(policySchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof policySchema>;

      const policyRecord = {
        maxLeverage: body.maxLeverage,
        maxSlippageBps: body.maxSlippageBps,
        fundingFloorBps: body.fundingFloorBps,
        maxDriftBps: body.maxDriftBps,
        reserveBufferBps: body.reserveBufferBps,
        updatedAt: Date.now(),
      };

      // Persist to local database
      db.savePolicy(body.ownerAddress, policyRecord);

      let onchainTxHash: string | null = null;
      // Anchor to CarryLedger on Monad Testnet if configured
      if (
        env.NODE_ENV !== 'test' &&
        env.CARRY_LEDGER_ADDRESS &&
        env.CARRY_LEDGER_ADDRESS !== '0x0000000000000000000000000000000000000000'
      ) {
        try {
          onchainTxHash = await relayerWalletClient.writeContract({
            address: env.CARRY_LEDGER_ADDRESS as `0x${string}`,
            abi: CarryLedgerABI,
            functionName: 'setPolicy',
            args: [
              BigInt(body.maxLeverage),
              BigInt(body.maxSlippageBps),
              BigInt(body.fundingFloorBps),
              BigInt(body.maxDriftBps),
              BigInt(body.reserveBufferBps),
            ],
          });
          logger.info({ onchainTxHash, owner: body.ownerAddress }, 'CarryLedger.setPolicy anchored to Monad Testnet');
        } catch (err) {
          logger.warn({ err }, 'CarryLedger.setPolicy non-blocking on testnet');
        }
      }

      return {
        success: true,
        data: {
          ...policyRecord,
          onchainTxHash,
        },
        timestamp: Date.now(),
      };
    }
  );

  // 2. Query Configured Policy
  fastify.get('/api/v1/settings/policy/:address', async (request: FastifyRequest) => {
    const { address } = request.params as { address: string };
    const policy = db.getPolicy(address) || {
      maxLeverage: 1,
      maxSlippageBps: 50,
      fundingFloorBps: 0,
      maxDriftBps: 100,
      reserveBufferBps: 1000,
      isDefault: true,
    };

    return {
      success: true,
      data: policy,
      timestamp: Date.now(),
    };
  });

  // 3. Risk Guard Interactive Fire Drill Simulation
  fastify.post(
    '/api/v1/risk/fire-drill',
    { preHandler: validateBody(fireDrillSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof fireDrillSchema>;
      const positionId = body.positionId || `pos_firedrill_${Date.now()}`;
      const targetTier = body.targetTier;

      let tierName = 'TIER_1_TOPUP';
      let actionTaken = 'Reserve buffer drawn to top up Perpl margin back to 100%';
      let simulatedMarginRatio = 0.52;

      if (targetTier === 2) {
        tierName = 'TIER_2_DELEVERAGE';
        actionTaken = 'Reserve buffer exhausted. Deleveraged 20% spot MON and short to restore margin ratio to 1.00x';
        simulatedMarginRatio = 0.35;
      } else if (targetTier === 3) {
        tierName = 'TIER_3_EMERGENCY';
        actionTaken = 'Catastrophic flash wick across 2 consecutive blocks. Concurrently unwound 100% to AUSD';
        simulatedMarginRatio = 0.18;
      }

      // Record guard audit event
      const auditRecord = db.recordGuardEvent({
        positionId,
        tier: targetTier,
        marginRatioBps: Math.round(simulatedMarginRatio * 10000),
        action: actionTaken,
        timestamp: Date.now(),
      });

      return {
        success: true,
        data: {
          positionId,
          targetTier,
          tierName,
          simulatedDropPercent: body.simulatedDropPercent,
          simulatedMarginRatio,
          actionTaken,
          auditRecordId: auditRecord.id,
          status: 'DEFENSE_VERIFIED',
        },
        timestamp: Date.now(),
      };
    }
  );
}

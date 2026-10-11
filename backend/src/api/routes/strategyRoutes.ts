import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validateBody } from '../middleware/requestValidator.js';
import { strategyEngine } from '../../engine/strategyEngine.js';
import { unwindEngine } from '../../engine/unwindEngine.js';
import { activePositions } from './positionRoutes.js';

const enterSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  marketId: z.string().default('MON'),
  depositAmount: z.number().positive(),
  leverage: z.number().min(1).max(2).default(1),
  maxSlippageBps: z.number().default(50),
  apiKey: z.string().default('testnet-demo-key'),
  apiSecretHex: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
});

const unwindSchema = z.object({
  positionId: z.string(),
  reason: z.string().default('USER_REQUESTED'),
  apiKey: z.string().default('testnet-demo-key'),
  apiSecretHex: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
});

export async function strategyRoutes(fastify: FastifyInstance) {
  // Execute Coordinated Dual-Leg Entry
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

      // Save to memory cache
      activePositions.set(position.positionId, position);

      return {
        success: true,
        data: position,
        timestamp: Date.now(),
      };
    }
  );

  // Execute 1-Tap Unwind
  fastify.post(
    '/api/v1/strategy/unwind',
    { preHandler: validateBody(unwindSchema) },
    async (request: FastifyRequest) => {
      const body = request.body as z.infer<typeof unwindSchema>;
      const position = activePositions.get(body.positionId);

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

      // Update position state
      position.state = 'CLOSED';
      activePositions.set(position.positionId, position);

      return {
        success: true,
        data: unwindResult,
        timestamp: Date.now(),
      };
    }
  );
}

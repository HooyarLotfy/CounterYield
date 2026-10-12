import { FastifyInstance, FastifyRequest } from 'fastify';
import { activePositions } from './positionRoutes.js';
import { riskGuard } from '../../guard/riskGuard.js';
import { CircuitBreakers } from '../../guard/circuitBreakers.js';
import { perplClient } from '../../clients/perplClient.js';
import { PERPL_TESTNET_MARKETS } from '../../config/constants.js';

export async function riskRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/risk/status/:positionId', async (request: FastifyRequest<{ Params: { positionId: string } }>) => {
    const { positionId } = request.params;
    const position = activePositions.get(positionId);

    if (!position) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Position ${positionId} not found` },
        timestamp: Date.now(),
      };
    }

    const ticker = await perplClient.getValidatedTicker(position.perplMarketId || PERPL_TESTNET_MARKETS.MON);
    const markPrice = ticker.mrk;
    const riskStatus = riskGuard.evaluatePositionRisk(position, markPrice, markPrice);

    const circuitBreaker = CircuitBreakers.evaluate(Date.now(), 0.15, 1.0);

    return {
      success: true,
      data: {
        riskStatus,
        circuitBreakers: circuitBreaker,
      },
      timestamp: Date.now(),
    };
  });
}

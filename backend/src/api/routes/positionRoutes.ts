import { FastifyInstance, FastifyRequest } from 'fastify';
import { PositionModel } from '@counter-yield/shared';
import { riskGuard } from '../../guard/riskGuard.js';
import { perplClient } from '../../clients/perplClient.js';
import { PERPL_TESTNET_MARKETS } from '../../config/constants.js';

export const activePositions = new Map<string, PositionModel>();

export async function positionRoutes(fastify: FastifyInstance) {
  // Fetch specific position by ID
  fastify.get('/api/v1/position/:positionId', async (request: FastifyRequest<{ Params: { positionId: string } }>) => {
    const { positionId } = request.params;
    const position = activePositions.get(positionId);

    if (!position) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Position ${positionId} not found` },
        timestamp: Date.now(),
      };
    }

    // Refresh live telemetry
    const ticker = await perplClient.getTicker(position.perplMarketId || PERPL_TESTNET_MARKETS.MON).catch(() => ({ mrk: 10.0 }));
    const markPrice = ticker.mrk || 10.0;
    const riskStatus = riskGuard.evaluatePositionRisk(position, markPrice, markPrice);

    // Compute live estimated funding accrual
    const elapsedHours = (Date.now() - position.openedAt) / (1000 * 60 * 60);
    const hourlyRate = 0.00015; // ~15 bps per hour
    const notional = parseFloat(position.spotLeg.currentValueUsd);
    const estimatedFunding = (notional * hourlyRate * elapsedHours).toFixed(2);
    position.estimatedAccrualUsd = estimatedFunding;

    return {
      success: true,
      data: {
        ...position,
        marginRatio: riskStatus.marginRatio,
        currentTier: riskStatus.currentTier,
        netDeltaDollars: riskStatus.netDeltaDollars,
        isDeltaNeutral: riskStatus.isDeltaNeutral,
        distanceToLiquidationPercent: riskStatus.distanceToLiquidationPercent,
      },
      timestamp: Date.now(),
    };
  });

  // Fetch all positions for an owner
  fastify.get('/api/v1/positions', async (request: FastifyRequest<{ Querystring: { owner?: string } }>) => {
    const { owner } = request.query;
    let list = Array.from(activePositions.values());
    if (owner) {
      list = list.filter((p) => p.ownerAddress.toLowerCase() === owner.toLowerCase());
    }

    return {
      success: true,
      data: list,
      timestamp: Date.now(),
    };
  });
}

import { FastifyInstance, FastifyRequest } from 'fastify';
import { PositionModel } from '@counter-yield/shared';
import { riskGuard } from '../../guard/riskGuard.js';
import { perplClient } from '../../clients/perplClient.js';
import { PERPL_TESTNET_MARKETS } from '../../config/constants.js';
import { db } from '../../db/database.js';

export const activePositions = {
  get: (id: string): PositionModel | undefined => db.getPosition(id),
  has: (id: string): boolean => !!db.getPosition(id),
  values: (): PositionModel[] => db.getAllPositions(),
};

export async function positionRoutes(fastify: FastifyInstance) {
  // Fetch specific position by ID
  fastify.get('/api/v1/position/:positionId', async (request: FastifyRequest<{ Params: { positionId: string } }>) => {
    const { positionId } = request.params;
    const position = db.getPosition(positionId);

    if (!position) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Position ${positionId} not found` },
        timestamp: Date.now(),
      };
    }

    // Refresh live telemetry (throws 503 if the price feed is missing/invalid; never invents a price)
    const ticker = await perplClient.getValidatedTicker(position.perplMarketId || PERPL_TESTNET_MARKETS.MON);
    const markPrice = ticker.mrk;
    const riskStatus = riskGuard.evaluatePositionRisk(position, markPrice, markPrice);

    // ESTIMATED accrual = live hourly funding rate x notional x elapsed hours (same micros convention as /market/quote).
    // Realized funding is reconciled separately (settledFundingUsd) and is never mixed with this estimate.
    const elapsedHours = (Date.now() - position.openedAt) / (1000 * 60 * 60);
    const hourlyRate = ticker.fr / 1_000_000;
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
    const list = db.getAllPositions(owner);

    return {
      success: true,
      data: list,
      timestamp: Date.now(),
    };
  });

  // Fetch audit records for a position
  fastify.get('/api/v1/position/:positionId/history', async (request: FastifyRequest<{ Params: { positionId: string } }>) => {
    const { positionId } = request.params;
    const guardHistory = db.getGuardRecords(positionId);
    const rebalanceHistory = db.getRebalanceRecords(positionId);

    return {
      success: true,
      data: {
        positionId,
        guardHistory,
        rebalanceHistory,
      },
      timestamp: Date.now(),
    };
  });
}

import { FastifyInstance } from 'fastify';
import { activePositions } from './routes/positionRoutes.js';
import { riskGuard } from '../guard/riskGuard.js';
import { perplClient } from '../clients/perplClient.js';
import { PERPL_TESTNET_MARKETS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export async function websocketGateway(fastify: FastifyInstance) {
  fastify.get('/ws/telemetry', { websocket: true }, (socket, req) => {
    logger.info('Client connected to real-time WebSocket telemetry');

    let activePositionId: string | null = null;

    socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.action === 'subscribe' && data.positionId) {
          activePositionId = data.positionId;
          logger.info({ activePositionId }, 'Client subscribed to position telemetry');
        }
      } catch (err) {
        logger.warn({ err }, 'Invalid WebSocket message');
      }
    });

    // 1-Second block heartbeat loop
    const interval = setInterval(async () => {
      if (socket.readyState !== socket.OPEN) {
        clearInterval(interval);
        return;
      }

      if (activePositionId && activePositions.has(activePositionId)) {
        const position = activePositions.get(activePositionId)!;
        let ticker;
        try {
          ticker = await perplClient.getValidatedTicker(position.perplMarketId || PERPL_TESTNET_MARKETS.MON);
        } catch {
          socket.send(JSON.stringify({ type: 'FEED_STALE', positionId: position.positionId, timestamp: Date.now() }));
          return;
        }
        const markPrice = ticker.mrk;
        const risk = riskGuard.evaluatePositionRisk(position, markPrice, markPrice);

        const elapsedHours = (Date.now() - position.openedAt) / 3_600_000;
        const accruedEst = (parseFloat(position.spotLeg.currentValueUsd) * (ticker.fr / 1_000_000) * elapsedHours).toFixed(2);

        const payload = {
          type: 'TELEMETRY_UPDATE',
          positionId: position.positionId,
          markPrice: markPrice.toFixed(2),
          spotPrice: markPrice.toFixed(2),
          marginRatio: risk.marginRatio,
          tier: risk.currentTier,
          netDelta: risk.netDeltaDollars,
          isDeltaNeutral: risk.isDeltaNeutral,
          distanceToLiquidationPercent: risk.distanceToLiquidationPercent,
          accruedFundingEst: accruedEst,
          timestamp: Date.now(),
        };

        socket.send(JSON.stringify(payload));
      }
    }, 1000);

    socket.on('close', () => {
      clearInterval(interval);
      logger.info('Client disconnected from telemetry stream');
    });
  });
}

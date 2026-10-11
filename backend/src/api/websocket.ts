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
        const ticker = await perplClient.getTicker(position.perplMarketId || PERPL_TESTNET_MARKETS.MON).catch(() => ({ mrk: 10.0 }));
        const markPrice = ticker.mrk || 10.0;
        const risk = riskGuard.evaluatePositionRisk(position, markPrice, markPrice);

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
          accruedFundingEst: position.estimatedAccrualUsd,
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

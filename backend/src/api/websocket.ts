import { FastifyInstance } from 'fastify';
import { activePositions } from './routes/positionRoutes.js';
import { riskGuard } from '../guard/riskGuard.js';
import { perplClient } from '../clients/perplClient.js';
import { kuruClient } from '../clients/kuruClient.js';
import { PERPL_TESTNET_MARKETS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export async function websocketGateway(fastify: FastifyInstance) {
  // Real-time market feed streaming Kuru L2 book and Perpl funding/ticker
  fastify.get('/ws/market', { websocket: true }, (socket) => {
    logger.info('Client connected to real-time /ws/market stream');

    const interval = setInterval(async () => {
      if (socket.readyState !== socket.OPEN) {
        clearInterval(interval);
        return;
      }

      try {
        const [book, ticker] = await Promise.all([
          kuruClient.getOrderBook().catch(() => null),
          perplClient.getValidatedTicker(PERPL_TESTNET_MARKETS.MON).catch(() => null),
        ]);

        if (book || ticker) {
          const bestBid = book?.bids?.[0]?.price ?? 0;
          const bestAsk = book?.asks?.[0]?.price ?? 0;
          const mid = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : (ticker?.mrk ?? 0);

          socket.send(
            JSON.stringify({
              type: 'MARKET_TICK',
              market: 'MON',
              book: book
                ? {
                    bids: book.bids.slice(0, 10),
                    asks: book.asks.slice(0, 10),
                    mid,
                    spreadBps: mid > 0 ? ((bestAsk - bestBid) / mid) * 10000 : 0,
                    fetchedAt: book.fetchedAt,
                  }
                : null,
              perpl: ticker
                ? {
                    markPrice: ticker.mrk,
                    fundingRate: ticker.fr,
                    annualizedApr: (ticker.fr * 24 * 365) / 1_000_000,
                    timestamp: Date.now(),
                  }
                : null,
              timestamp: Date.now(),
            })
          );
        }
      } catch (err) {
        logger.debug({ err }, 'Error sending /ws/market update');
      }
    }, 1000);

    socket.on('close', () => {
      clearInterval(interval);
      logger.info('Client disconnected from /ws/market stream');
    });
  });

  // Real-time user position telemetry
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
        const spotPrice = await kuruClient.getMidPrice().catch(() => markPrice);
        const risk = riskGuard.evaluatePositionRisk(position, spotPrice, markPrice);

        const elapsedHours = (Date.now() - position.openedAt) / 3_600_000;
        const accruedEst = (parseFloat(position.spotLeg.currentValueUsd) * (ticker.fr / 1_000_000) * elapsedHours).toFixed(2);

        const payload = {
          type: 'TELEMETRY_UPDATE',
          positionId: position.positionId,
          markPrice: markPrice.toFixed(4),
          spotPrice: spotPrice.toFixed(4),
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

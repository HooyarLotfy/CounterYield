import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { OrderSizer } from '../../engine/orderSizer.js';
import { BreakEvenCalculator } from '../../engine/breakEvenCalc.js';
import { perplClient } from '../../clients/perplClient.js';
import { kuruClient } from '../../clients/kuruClient.js';
import { PERPL_TESTNET_MARKETS } from '../../config/constants.js';

const quoteQuerySchema = z.object({
  marketId: z.string().default('MON'),
  amount: z.coerce.number().default(1000),
  leverage: z.coerce.number().min(1).max(2).default(1),
});

export async function marketRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/market/quote', async (request: FastifyRequest) => {
    const query = quoteQuerySchema.parse(request.query);
    const perplMarketId = PERPL_TESTNET_MARKETS.MON;

    // Fetch live market data (throws 503 rather than inventing a price)
    const ticker = await perplClient.getValidatedTicker(perplMarketId);
    const markPrice = ticker.mrk;
    const fundingRateMicros = ticker.fr;
    const annualizedFundingApr = (fundingRateMicros * 24 * 365) / 1000000; // estimated APR

    // Validate liquidity + read real Kuru mid from the live book
    const depth = await kuruClient.validateLiquidityDepth(query.amount);
    const kuruMid = await kuruClient.getMidPrice();

    // Calculate sizing
    const sizing = OrderSizer.calculateSizing(query.amount, markPrice, query.leverage);

    // Calculate break-even
    const breakEven = BreakEvenCalculator.computeBreakEven(
      annualizedFundingApr,
      query.leverage,
      sizing.reserveBuffer / sizing.totalCapital
    );

    // Risk ladder price projections at 1x leverage
    const tier1Price = markPrice * 1.25;
    const tier2Price = markPrice * 1.43;
    const tier3EmergencyPrice = markPrice * 1.60;
    const exchangeLiquidationPrice = markPrice * 1.82;

    return {
      success: true,
      data: {
        marketId: query.marketId,
        perplMarketId,
        eligible: depth.eligible,
        rejectionReason: depth.reason || null,
        sizing: {
          totalCapital: sizing.totalCapital.toFixed(2),
          reserveBuffer: sizing.reserveBuffer.toFixed(2),
          spotCapital: sizing.spotCapital.toFixed(2),
          perpMargin: sizing.perpMargin.toFixed(2),
          baseQuantity: sizing.baseQuantity.toFixed(4),
        },
        telemetry: {
          perplMarkPrice: markPrice.toFixed(2),
          kuruMidPrice: kuruMid.toFixed(2),
          trailingFundingApr: breakEven.grossAnnualApr,
          netEstimatedApr: breakEven.netAnnualApr,
          roundTripFeePercent: breakEven.roundTripFeePercent,
          estimatedBreakEvenDays: breakEven.breakEvenDays,
        },
        riskLadder: {
          tier1Price: tier1Price.toFixed(2),
          tier2Price: tier2Price.toFixed(2),
          tier3EmergencyPrice: tier3EmergencyPrice.toFixed(2),
          exchangeLiquidationPrice: exchangeLiquidationPrice.toFixed(2),
        },
      },
      timestamp: Date.now(),
    };
  });

  // Live Kuru L2 book for the Spot tab (503 when the data source is not configured/available)
  fastify.get('/api/v1/market/book', async () => {
    const book = await kuruClient.getOrderBook();
    const depth = 10;
    const bestBid = book.bids[0].price;
    const bestAsk = book.asks[0].price;
    return {
      success: true,
      data: {
        bids: book.bids.slice(0, depth),
        asks: book.asks.slice(0, depth),
        mid: (bestBid + bestAsk) / 2,
        spreadBps: ((bestAsk - bestBid) / ((bestBid + bestAsk) / 2)) * 10000,
        fetchedAt: book.fetchedAt,
      },
      timestamp: Date.now(),
    };
  });
}

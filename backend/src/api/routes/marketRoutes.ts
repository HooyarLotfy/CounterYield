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

    // Fetch live market data
    const ticker = await perplClient.getTicker(perplMarketId).catch(() => ({ mrk: 10.0, fr: 25 }));
    const markPrice = ticker.mrk || 10.0;
    const fundingRateMicros = ticker.fr || 25; // in micros
    const annualizedFundingApr = (fundingRateMicros * 24 * 365) / 1000000; // estimated APR

    // Validate liquidity
    const depth = await kuruClient.validateLiquidityDepth(query.amount);

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
          kuruMidPrice: markPrice.toFixed(2),
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
}

export interface BreakEvenAnalysis {
  roundTripFeePercent: number;
  grossAnnualApr: number;
  netAnnualApr: number;
  dailyNetYieldPercent: number;
  breakEvenDays: number;
}

export class BreakEvenCalculator {
  /**
   * Computes the round-trip friction, net yield, and estimated days to break even.
   * Factors in:
   * - Kuru taker fees (e.g. 0.05% entry + 0.05% exit = 0.10%)
   * - Perpl taker fees (e.g. 0.03% entry + 0.03% exit = 0.06%)
   * - Slippage allowance (e.g. 0.04% total)
   * - Funding rate annualized
   */
  static computeBreakEven(
    trailingFundingApr: number,
    leverage: number = 1,
    reserveBufferRatio: number = 0.10,
    takerFeeKuruBps: number = 5,
    takerFeePerplBps: number = 3,
    estimatedSlippageBps: number = 4
  ): BreakEvenAnalysis {
    // Total round-trip cost in percentage
    const roundTripFeePercent =
      ((takerFeeKuruBps * 2 + takerFeePerplBps * 2 + estimatedSlippageBps) / 10000);

    // Capital efficiency factor: (1 - reserve) * L / (L + 1)
    const capitalEfficiency = (1 - reserveBufferRatio) * (leverage / (leverage + 1));
    const netAnnualApr = trailingFundingApr * capitalEfficiency;

    // Daily net carry rate
    const dailyNetYieldPercent = netAnnualApr / 365;

    // Days to break even
    const breakEvenDays =
      dailyNetYieldPercent > 0
        ? Number((roundTripFeePercent / dailyNetYieldPercent).toFixed(1))
        : 999.0;

    return {
      roundTripFeePercent: Number(roundTripFeePercent.toFixed(4)),
      grossAnnualApr: Number(trailingFundingApr.toFixed(4)),
      netAnnualApr: Number(netAnnualApr.toFixed(4)),
      dailyNetYieldPercent: Number(dailyNetYieldPercent.toFixed(6)),
      breakEvenDays,
    };
  }
}

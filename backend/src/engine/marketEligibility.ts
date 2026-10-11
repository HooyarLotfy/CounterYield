import { logger } from '../utils/logger.js';

export interface MarketEligibilityCriteria {
  marketId: string;
  intendedNotionalUsd: number;
  kuruMidPrice: number;
  kuruDepthWithinHalfPctUsd: number;
  perplTrailingAvgFundingRate: number; // e.g. 0.0002 (per 8h)
  fundingVolatility: number;
  perplOpenInterestUsd: number;
  perplSpreadBps: number;
  ausdCurrentPrice: number;
}

export interface EligibilityResult {
  isEligible: boolean;
  marketId: string;
  reasons: string[];
  metrics: {
    overlapVerified: boolean;
    depthMultiple: number;
    fundingPositive: boolean;
    spreadAcceptable: boolean;
    ausdPegHealthy: boolean;
  };
}

export class MarketEligibilityEngine {
  // Verified testnet allowlist markets
  private readonly ALLOWED_MARKETS = new Set(['MON', 'WETH', 'WBTC']);

  private readonly MIN_DEPTH_MULTIPLE = 2.0; // 2x intended size available within 0.5%
  private readonly MAX_SPREAD_BPS = 20; // 20 bps (0.20%) max spread
  private readonly MIN_OPEN_INTEREST_USD = 10_000; // $10,000 min OI
  private readonly MAX_FUNDING_VOLATILITY = 0.05; // 5% vol cap
  private readonly MAX_AUSD_DEPEG_BPS = 150; // 1.5% max depeg

  /**
   * Verifies all 4 eligibility conditions defined in Metropolis Spec Section 6.1:
   * 1. Tradable on both Kuru (spot) and Perpl (perp).
   * 2. Kuru book depth within 0.5% of mid exceeds a multiple of intended notional.
   * 3. Trailing average funding is positive and funding volatility is below cap.
   * 4. Perp open interest and spread are above/below safety bounds.
   */
  public evaluate(criteria: MarketEligibilityCriteria): EligibilityResult {
    const reasons: string[] = [];

    // 1. Overlap Check
    const overlapVerified = this.ALLOWED_MARKETS.has(criteria.marketId.toUpperCase());
    if (!overlapVerified) {
      reasons.push(`Market ${criteria.marketId} not found in dual-venue allowlist (Kuru + Perpl)`);
    }

    // 2. Kuru Book Depth within 0.5% of mid
    const depthMultiple =
      criteria.intendedNotionalUsd > 0
        ? criteria.kuruDepthWithinHalfPctUsd / criteria.intendedNotionalUsd
        : 0;
    const depthAcceptable = depthMultiple >= this.MIN_DEPTH_MULTIPLE;
    if (!depthAcceptable) {
      reasons.push(
        `Kuru depth within 0.5% (${criteria.kuruDepthWithinHalfPctUsd.toFixed(2)} USD) is below required ${this.MIN_DEPTH_MULTIPLE}x multiple (${(criteria.intendedNotionalUsd * this.MIN_DEPTH_MULTIPLE).toFixed(2)} USD)`
      );
    }

    // 3. Trailing Average Funding & Volatility
    const fundingPositive = criteria.perplTrailingAvgFundingRate > 0;
    if (!fundingPositive) {
      reasons.push(
        `Trailing average funding rate is non-positive (${(criteria.perplTrailingAvgFundingRate * 100).toFixed(4)}%), carry would be unprofitable`
      );
    }

    const fundingVolLow = criteria.fundingVolatility <= this.MAX_FUNDING_VOLATILITY;
    if (!fundingVolLow) {
      reasons.push(`Funding volatility exceeds ${(this.MAX_FUNDING_VOLATILITY * 100).toFixed(1)}% threshold`);
    }

    // 4. Spread and Open Interest
    const spreadAcceptable = criteria.perplSpreadBps <= this.MAX_SPREAD_BPS;
    if (!spreadAcceptable) {
      reasons.push(`Perpl spread of ${criteria.perplSpreadBps} bps exceeds maximum ${this.MAX_SPREAD_BPS} bps`);
    }

    const oiAcceptable = criteria.perplOpenInterestUsd >= this.MIN_OPEN_INTEREST_USD;
    if (!oiAcceptable) {
      reasons.push(`Perpl open interest ($${criteria.perplOpenInterestUsd}) is below $${this.MIN_OPEN_INTEREST_USD} threshold`);
    }

    // Pre-trade AUSD Peg check
    const depegBps = Math.abs(criteria.ausdCurrentPrice - 1.0) * 10000;
    const ausdPegHealthy = depegBps <= this.MAX_AUSD_DEPEG_BPS;
    if (!ausdPegHealthy) {
      reasons.push(`AUSD price ($${criteria.ausdCurrentPrice.toFixed(4)}) is depegged by ${depegBps.toFixed(0)} bps`);
    }

    const isEligible =
      overlapVerified &&
      depthAcceptable &&
      fundingPositive &&
      fundingVolLow &&
      spreadAcceptable &&
      oiAcceptable &&
      ausdPegHealthy;

    if (!isEligible) {
      logger.warn({ marketId: criteria.marketId, reasons }, 'Market eligibility check failed');
    }

    return {
      isEligible,
      marketId: criteria.marketId,
      reasons,
      metrics: {
        overlapVerified,
        depthMultiple,
        fundingPositive,
        spreadAcceptable,
        ausdPegHealthy,
      },
    };
  }
}

export const marketEligibilityEngine = new MarketEligibilityEngine();

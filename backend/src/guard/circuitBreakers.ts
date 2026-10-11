import { RISK_GUARD_CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export interface CircuitBreakerStatus {
  stalePriceTripped: boolean;
  fundingDecayTripped: boolean;
  ausdDepegTripped: boolean;
  canEnterNewPositions: boolean;
  canUnwind: boolean; // Must ALWAYS be true!
}

export class CircuitBreakers {
  /**
   * Evaluates all automatic circuit breakers.
   */
  static evaluate(
    lastPriceTimestampMs: number,
    trailingFundingApr: number,
    ausdPrice: number = 1.0
  ): CircuitBreakerStatus {
    const now = Date.now();
    const stalePriceTripped = now - lastPriceTimestampMs > RISK_GUARD_CONSTANTS.STALE_DATA_TIMEOUT_MS;
    const fundingDecayTripped = trailingFundingApr < 0;
    const ausdDepegTripped = Math.abs(ausdPrice - 1.0) > 0.005; // >0.5% depeg

    const canEnterNewPositions = !stalePriceTripped && !fundingDecayTripped && !ausdDepegTripped;

    if (!canEnterNewPositions) {
      logger.warn(
        { stalePriceTripped, fundingDecayTripped, ausdDepegTripped },
        'Circuit breaker active: New position entries are frozen'
      );
    }

    return {
      stalePriceTripped,
      fundingDecayTripped,
      ausdDepegTripped,
      canEnterNewPositions,
      canUnwind: true, // Unwind is guaranteed and never locked
    };
  }
}

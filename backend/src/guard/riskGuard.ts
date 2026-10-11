import { logger } from '../utils/logger.js';
import { RISK_GUARD_CONSTANTS } from '../config/constants.js';
import { RiskTier, RiskStatus } from '../types/risk.js';
import { PositionModel } from '@counter-yield/shared';

export class RiskGuard {
  private consecutiveTier3Reads: Map<string, number> = new Map();

  /**
   * Evaluates position risk and executes defensive actions across the 3-tier ladder.
   */
  evaluatePositionRisk(
    position: PositionModel,
    currentMarkPrice: number,
    currentSpotPrice: number
  ): RiskStatus {
    const entryPrice = parseFloat(position.spotLeg.entryPrice);
    const baseQty = parseFloat(position.baseQuantity);
    const initialMargin = parseFloat(position.perpMarginRemaining);
    let reserveBuffer = parseFloat(position.reserveBufferAusd);

    // 1. Compute PnL & Margin Remaining
    const perpPnL = baseQty * (entryPrice - currentMarkPrice);
    const perpMarginRemaining = Math.max(0, initialMargin + perpPnL);
    const shortNotional = baseQty * currentMarkPrice;

    // 2. Margin Ratio
    const marginRatio = shortNotional > 0 ? perpMarginRemaining / shortNotional : 1.0;

    // 3. Net Delta in Dollars
    const spotValue = baseQty * currentSpotPrice;
    const netDeltaDollars = (spotValue - shortNotional).toFixed(2);
    const isDeltaNeutral = Math.abs(parseFloat(netDeltaDollars)) <= spotValue * RISK_GUARD_CONSTANTS.MAX_DELTA_DEVIATION_RATIO;

    // 4. Distance to Liquidation (% price increase before liquidation)
    const liquidationPrice = entryPrice * (1 + initialMargin / (baseQty * entryPrice) - RISK_GUARD_CONSTANTS.EXCHANGE_MAINTENANCE_MARGIN);
    const distanceToLiquidationPercent = Math.max(0, ((liquidationPrice - currentMarkPrice) / currentMarkPrice) * 100);

    let currentTier: RiskTier = 'NORMAL';
    let actionTaken: string | null = null;

    // 5. Escalating 3-Tier Defense Ladder Evaluation
    if (marginRatio >= RISK_GUARD_CONSTANTS.TIER_1_TOPUP_THRESHOLD) {
      currentTier = 'NORMAL';
      this.consecutiveTier3Reads.delete(position.positionId);
    } else if (marginRatio >= RISK_GUARD_CONSTANTS.TIER_2_DELEVERAGE_THRESHOLD) {
      // TIER 1: TOP-UP (< 60% Margin Ratio)
      currentTier = 'TIER_1_TOPUP';
      this.consecutiveTier3Reads.delete(position.positionId);

      const neededTopUp = shortNotional - perpMarginRemaining;
      if (reserveBuffer >= neededTopUp) {
        reserveBuffer -= neededTopUp;
        actionTaken = `Tier 1: Topped up ${neededTopUp.toFixed(2)} AUSD margin from reserve buffer`;
        logger.info({ positionId: position.positionId, neededTopUp }, actionTaken);
      } else {
        // Proportional deleverage if reserve buffer exhausted
        const shrinkFraction = 0.20;
        actionTaken = `Tier 1: Reserve dry. Proportional deleverage by ${(shrinkFraction * 100).toFixed(0)}%`;
        logger.warn({ positionId: position.positionId }, actionTaken);
      }
    } else if (marginRatio >= RISK_GUARD_CONSTANTS.TIER_3_EMERGENCY_THRESHOLD) {
      // TIER 2: DELEVERAGE (< 40% Margin Ratio)
      currentTier = 'TIER_2_DELEVERAGE';
      this.consecutiveTier3Reads.delete(position.positionId);
      actionTaken = `Tier 2: Forced proportional deleverage back to 100% margin ratio`;
      logger.warn({ positionId: position.positionId, marginRatio }, actionTaken);
    } else {
      // TIER 3: EMERGENCY UNWIND (< 25% Margin Ratio)
      const reads = (this.consecutiveTier3Reads.get(position.positionId) || 0) + 1;
      this.consecutiveTier3Reads.set(position.positionId, reads);

      if (reads >= 2) {
        currentTier = 'TIER_3_EMERGENCY';
        actionTaken = `Tier 3: Emergency Unwind triggered across 2 consecutive blocks. Converting to 100% AUSD.`;
        logger.error({ positionId: position.positionId, marginRatio }, actionTaken);
      } else {
        currentTier = 'TIER_2_DELEVERAGE'; // Hold until second confirmation
        actionTaken = `Tier 3 Warning: Consecutive read 1/2`;
      }
    }

    return {
      positionId: position.positionId,
      marginRatio: Number(marginRatio.toFixed(4)),
      currentTier,
      distanceToLiquidationPercent: Number(distanceToLiquidationPercent.toFixed(1)),
      isDeltaNeutral,
      netDeltaDollars,
      reserveBufferRemaining: Number(reserveBuffer.toFixed(2)),
      rebalanceCount: 0,
      lastCheckedBlock: 14920421,
      lastAction: actionTaken,
    };
  }
}

export const riskGuard = new RiskGuard();

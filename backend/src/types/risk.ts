export type RiskTier = 'NORMAL' | 'TIER_1_TOPUP' | 'TIER_2_DELEVERAGE' | 'TIER_3_EMERGENCY';

export interface RiskStatus {
  positionId: string;
  marginRatio: number;
  currentTier: RiskTier;
  distanceToLiquidationPercent: number;
  isDeltaNeutral: boolean;
  netDeltaDollars: string;
  reserveBufferRemaining: number;
  rebalanceCount: number;
  lastCheckedBlock: number;
  lastAction: string | null;
}

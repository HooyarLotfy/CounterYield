export type PositionState = 'IDLE' | 'ACTIVE' | 'REBALANCING' | 'CLOSED' | 'EMERGENCY_UNWOUND';

export interface PositionLegDetails {
  orderId?: string;
  txHash?: string;
  quantity: string;
  entryPrice: string;
  currentValueUsd: string;
}

export interface PositionModel {
  positionId: string;
  ownerAddress: string;
  marketId: string;
  perplMarketId: number;
  leverage: number;
  state: PositionState;
  baseQuantity: string;
  spotLeg: PositionLegDetails;
  perpLeg: PositionLegDetails;
  perpMarginRemaining: string;
  initialDepositAusd: string;
  reserveBufferAusd: string;
  marginRatio: number;
  currentTier: 'NORMAL' | 'TIER_1_TOPUP' | 'TIER_2_DELEVERAGE' | 'TIER_3_EMERGENCY';
  netDeltaDollars: string;
  isDeltaNeutral: boolean;
  distanceToLiquidationPercent: number;
  realizedPnlAusd?: string;
  estimatedAccrualUsd: string;
  settledFundingUsd: string;
  openedAt: number;
  closedAt?: number;
}

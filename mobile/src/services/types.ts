/** Domain types returned by the backend (mirrors shared/src/models/PositionModel.ts). */
export type Tier = 'NORMAL' | 'TIER_1_TOPUP' | 'TIER_2_DELEVERAGE' | 'TIER_3_EMERGENCY';
export type PositionState = 'IDLE' | 'ACTIVE' | 'REBALANCING' | 'CLOSED' | 'EMERGENCY_UNWOUND';

export interface Position {
  positionId: string;
  ownerAddress: string;
  marketId: string;
  perplMarketId: number;
  leverage: number;
  state: PositionState;
  baseQuantity: string;
  spotLeg: { txHash?: string; quantity: string; entryPrice: string; currentValueUsd: string };
  perpLeg: { orderId?: string; quantity: string; entryPrice: string; currentValueUsd: string };
  perpMarginRemaining: string;
  initialDepositAusd: string;
  reserveBufferAusd: string;
  marginRatio: number;
  currentTier: Tier;
  netDeltaDollars: string;
  isDeltaNeutral: boolean;
  distanceToLiquidationPercent: number;
  estimatedAccrualUsd: string;
  settledFundingUsd: string;
  openedAt: number;
  closedAt?: number;
}

export interface Quote {
  marketId: string;
  eligible: boolean;
  rejectionReason: string | null;
  sizing: { totalCapital: string; reserveBuffer: string; spotCapital: string; perpMargin: string; baseQuantity: string };
  telemetry: {
    perplMarkPrice: string;
    kuruMidPrice: string;
    trailingFundingApr: number;
    netEstimatedApr: number;
    roundTripFeePercent: number;
    estimatedBreakEvenDays: number;
  };
  riskLadder: { tier1Price: string; tier2Price: string; tier3EmergencyPrice: string; exchangeLiquidationPrice: string };
}

export interface BookLevel { price: number; size: number }
export interface Book { bids: BookLevel[]; asks: BookLevel[]; mid: number; spreadBps: number; fetchedAt: number }

export interface GuardRecord { id: string; positionId: string; tier: number; marginRatioBps: number; action: string; timestamp: number }
export interface RebalanceRecord { id: string; positionId: string; oldSpotQty: string; newSpotQty: string; oldPerpQty: string; newPerpQty: string; reason: string; timestamp: number }
export interface PositionHistory { positionId: string; guardHistory: GuardRecord[]; rebalanceHistory: RebalanceRecord[] }

export interface Health {
  status: 'healthy' | 'degraded';
  monad: { connected: boolean; blockNumber: string; rpcLatencyMs: number };
  kuru: { status: 'connected' | 'unavailable'; bookSourceConfigured: boolean };
  perpl: { status: 'connected' | 'unavailable' };
  ledger: { address: string; deployed: boolean };
}

export interface UnwindResult { positionId: string; status: 'UNWOUND'; totalReturnedAusd: string; realizedPnlAusd: string; timestamp: number }

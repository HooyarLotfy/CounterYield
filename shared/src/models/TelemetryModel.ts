export interface MarketQuoteModel {
  marketId: string;
  perplMarketId: number;
  eligible: boolean;
  rejectionReason: string | null;
  sizing: {
    totalCapital: string;
    reserveBuffer: string;
    spotCapital: string;
    perpMargin: string;
    baseQuantity: string;
  };
  telemetry: {
    perplMarkPrice: string;
    kuruMidPrice: string;
    trailingFundingApr: number;
    netEstimatedApr: number;
    roundTripFeePercent: number;
    estimatedBreakEvenDays: number;
  };
  riskLadder: {
    tier1Price: string;
    tier2Price: string;
    tier3EmergencyPrice: string;
    exchangeLiquidationPrice: string;
  };
}

export interface LiveTelemetryUpdate {
  type: 'TELEMETRY_UPDATE';
  positionId: string;
  markPrice: string;
  spotPrice: string;
  marginRatio: number;
  tier: 'NORMAL' | 'TIER_1_TOPUP' | 'TIER_2_DELEVERAGE' | 'TIER_3_EMERGENCY';
  netDeltaDollars: string;
  accruedFundingEst: string;
  timestamp: number;
}

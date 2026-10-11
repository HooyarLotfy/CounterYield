// Envio Event Handlers for CarryLedger and KuruOrderBook on Monad Testnet
// These handlers ingest raw EVM logs into the GraphQL entities defined in schema.graphql.

export interface HedgeOpenedEventArgs {
  positionId: string;
  owner: string;
  marketId: string;
  baseQuantity: bigint;
  spotEntryPrice: bigint;
  perpEntryPrice: bigint;
  leverage: number;
  timestamp: bigint;
}

export interface HedgeRebalancedEventArgs {
  positionId: string;
  oldSpotQty: bigint;
  newSpotQty: bigint;
  oldPerpQty: bigint;
  newPerpQty: bigint;
  reason: string;
  timestamp: bigint;
}

export interface HedgeClosedEventArgs {
  positionId: string;
  realizedPnl: bigint;
  reason: string;
  timestamp: bigint;
}

export interface GuardTriggeredEventArgs {
  positionId: string;
  tier: number;
  marginRatioBps: bigint;
  action: string;
  timestamp: bigint;
}

export interface EmergencyUnwindEventArgs {
  positionId: string;
  reason: string;
  timestamp: bigint;
}

export interface TradeEventArgs {
  orderId: bigint;
  maker: string;
  taker: string;
  isBuy: boolean;
  price: bigint;
  size: bigint;
  timestamp: bigint;
}

/**
 * Envio Event Handlers & GraphQL Query Interfaces for CarryLedger and KuruOrderBook on Monad Testnet.
 * Ingests raw EVM logs into queryable entities for proof-of-hedge, drift tracking, and guard history.
 */

export interface HedgeOpenedEventArgs {
  positionId: string;
  owner: string;
  marketId: string;
  baseQuantity: bigint;
  spotTxRef: string;
  perpOrderRef: string;
  leverage: bigint;
  timestamp: bigint;
}

export interface HedgeRebalancedEventArgs {
  positionId: string;
  oldSpotQty: bigint;
  oldPerpQty: bigint;
  newSpotQty: bigint;
  newPerpQty: bigint;
  reason: string;
  timestamp: bigint;
}

export interface HedgeClosedEventArgs {
  positionId: string;
  owner: string;
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

export interface PolicySetEventArgs {
  owner: string;
  maxLeverage: bigint;
  maxSlippageBps: bigint;
  fundingFloorBps: bigint;
  maxDriftBps: bigint;
  reserveBufferBps: bigint;
  timestamp: bigint;
}

export interface KuruTradeEventArgs {
  tradeId: bigint;
  taker: string;
  maker: string;
  size: bigint;
  price: bigint;
  isBuy: boolean;
}

/**
 * Core GraphQL Queries exposed by Envio and consumed by Mobile & Backend
 */
export const ENVIO_GRAPHQL_QUERIES = {
  // Query 1: Active user positions for HomeScreen and PositionScreen
  GET_USER_POSITIONS: `
    query GetUserPositions($owner: String!) {
      Position(where: { owner: { _eq: $owner }, state: { _eq: "ACTIVE" } }) {
        id
        marketId
        baseQuantity
        spotQuantity
        perpQuantity
        spotTxRef
        perpOrderRef
        leverage
        openedAt
        rebalanceCount
        guardEventCount
      }
    }
  `,

  // Query 2: Detailed position audit trail for PositionScreen
  GET_POSITION_AUDIT_TRAIL: `
    query GetPositionAuditTrail($positionId: ID!) {
      Position_by_pk(id: $positionId) {
        id
        state
        baseQuantity
        spotQuantity
        perpQuantity
        realizedPnl
        openedAt
        closedAt
        rebalances(order_by: { timestamp: desc }) {
          id
          oldSpotQty
          newSpotQty
          oldPerpQty
          newPerpQty
          reason
          timestamp
          txHash
        }
        guardEvents(order_by: { timestamp: desc }) {
          id
          tier
          marginRatioBps
          action
          timestamp
          txHash
        }
        driftSnapshots(order_by: { timestamp: desc }, limit: 50) {
          driftBps
          timestamp
        }
        marginSnapshots(order_by: { timestamp: desc }, limit: 50) {
          marginRatioBps
          timestamp
        }
      }
    }
  `,

  // Query 3: ActivityScreen proof-of-hedge feed
  GET_ACTIVITY_FEED: `
    query GetActivityFeed($owner: String!) {
      Position(where: { owner: { _eq: $owner } }, order_by: { openedAt: desc }) {
        id
        marketId
        state
        realizedPnl
        openedAt
        closedAt
        rebalances {
          reason
          timestamp
          txHash
        }
        guardEvents {
          tier
          action
          timestamp
          txHash
        }
      }
    }
  `,
};

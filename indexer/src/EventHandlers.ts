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

// ---------------------------------------------------------------------------
// Envio HyperIndex handlers (spec section 7). These populate the entities defined in
// schema.graphql so the Position and Activity screens are driven by indexed events.
// Everything below is derived 1:1 from onchain CarryLedger / Kuru events; nothing is simulated.
// ---------------------------------------------------------------------------
import { CarryLedger, KuruOrderBook } from "generated";

const toId = (chainId: number, txHash: string, logIndex: number) => `${chainId}-${txHash}-${logIndex}`;

/** Hedge drift in bps = |spot - perp| / perp (spec 6.3 rebalance trigger is > 100 bps). */
const driftBps = (spot: bigint, perp: bigint): bigint =>
  perp === 0n ? 0n : ((spot > perp ? spot - perp : perp - spot) * 10000n) / perp;

CarryLedger.HedgeOpened.handler(async ({ event, context }) => {
  context.Position.set({
    id: event.params.positionId,
    owner: event.params.owner.toLowerCase(),
    marketId: event.params.marketId,
    baseQuantity: event.params.baseQuantity,
    spotQuantity: event.params.baseQuantity,
    perpQuantity: event.params.baseQuantity,
    spotTxRef: event.params.spotTxRef,
    perpOrderRef: event.params.perpOrderRef,
    leverage: event.params.leverage,
    state: "ACTIVE",
    realizedPnl: undefined,
    openedAt: event.params.timestamp,
    closedAt: undefined,
    rebalanceCount: 0,
    guardEventCount: 0,
  });
});

CarryLedger.HedgeRebalanced.handler(async ({ event, context }) => {
  const position = await context.Position.get(event.params.positionId);
  if (!position) return;

  const id = toId(event.chainId, event.transaction.hash, event.logIndex);
  context.RebalanceEvent.set({
    id,
    position_id: position.id,
    oldSpotQty: event.params.oldSpotQty,
    oldPerpQty: event.params.oldPerpQty,
    newSpotQty: event.params.newSpotQty,
    newPerpQty: event.params.newPerpQty,
    reason: event.params.reason,
    timestamp: event.params.timestamp,
    txHash: event.transaction.hash,
  });
  context.HedgeDriftPoint.set({
    id,
    position_id: position.id,
    driftBps: driftBps(event.params.newSpotQty, event.params.newPerpQty),
    spotQty: event.params.newSpotQty,
    perpQty: event.params.newPerpQty,
    timestamp: event.params.timestamp,
  });
  context.Position.set({
    ...position,
    spotQuantity: event.params.newSpotQty,
    perpQuantity: event.params.newPerpQty,
    rebalanceCount: position.rebalanceCount + 1,
  });
});

CarryLedger.HedgeClosed.handler(async ({ event, context }) => {
  const position = await context.Position.get(event.params.positionId);
  if (!position) return;
  // Emergency unwinds are written by EmergencyUnwind first; do not overwrite that terminal state.
  const state = position.state === "EMERGENCY_UNWOUND" ? position.state : "CLOSED";
  context.Position.set({
    ...position,
    state,
    realizedPnl: event.params.realizedPnl,
    closedAt: event.params.timestamp,
  });
});

CarryLedger.GuardTriggered.handler(async ({ event, context }) => {
  const position = await context.Position.get(event.params.positionId);
  if (!position) return;

  const id = toId(event.chainId, event.transaction.hash, event.logIndex);
  context.GuardEvent.set({
    id,
    position_id: position.id,
    tier: Number(event.params.tier),
    marginRatioBps: event.params.marginRatioBps,
    action: event.params.action,
    timestamp: event.params.timestamp,
    txHash: event.transaction.hash,
  });
  context.MarginRatioPoint.set({
    id,
    position_id: position.id,
    marginRatioBps: event.params.marginRatioBps,
    timestamp: event.params.timestamp,
  });
  context.Position.set({ ...position, guardEventCount: position.guardEventCount + 1 });
});

CarryLedger.EmergencyUnwind.handler(async ({ event, context }) => {
  const position = await context.Position.get(event.params.positionId);
  if (!position) return;
  context.Position.set({ ...position, state: "EMERGENCY_UNWOUND" });
});

CarryLedger.PolicySet.handler(async ({ event, context }) => {
  context.UserPolicy.set({
    id: event.params.owner.toLowerCase(),
    maxLeverage: event.params.maxLeverage,
    maxSlippageBps: event.params.maxSlippageBps,
    fundingFloorBps: event.params.fundingFloorBps,
    maxDriftBps: event.params.maxDriftBps,
    reserveBufferBps: event.params.reserveBufferBps,
    updatedAt: event.params.timestamp,
  });
});

KuruOrderBook.Trade.handler(async ({ event, context }) => {
  context.SpotTradeFill.set({
    id: toId(event.chainId, event.transaction.hash, event.logIndex),
    tradeId: event.params.tradeId.toString(),
    taker: event.params.taker.toLowerCase(),
    maker: event.params.maker.toLowerCase(),
    size: event.params.size,
    price: event.params.price,
    isBuy: event.params.isBuy,
    timestamp: BigInt(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

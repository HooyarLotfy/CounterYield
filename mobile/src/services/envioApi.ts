import { config } from '../config/env';

/**
 * Envio HyperIndex queries. Each screen documents the exact query it uses (spec section 7).
 * Field names match indexer/schema.graphql. Relations are exposed by Envio as `<name>_id`.
 */
export const QUERIES = {
  /** ActivityScreen: proof-of-hedge feed for one owner. */
  ACTIVITY: `
    query Activity($owner: String!) {
      Position(where: { owner: { _eq: $owner } }, order_by: { openedAt: desc }) {
        id marketId state realizedPnl openedAt closedAt spotTxRef perpOrderRef
        rebalances(order_by: { timestamp: desc }) { id reason timestamp txHash }
        guardEvents(order_by: { timestamp: desc }) { id tier action marginRatioBps timestamp txHash }
      }
    }`,
  /** PositionScreen: margin-ratio and drift history for the charts / incident log. */
  POSITION_HISTORY: `
    query PositionHistory($id: String!) {
      GuardEvent(where: { position_id: { _eq: $id } }, order_by: { timestamp: desc }, limit: 50) {
        id tier action marginRatioBps timestamp txHash
      }
      HedgeDriftPoint(where: { position_id: { _eq: $id } }, order_by: { timestamp: desc }, limit: 50) {
        id driftBps timestamp
      }
    }`,
} as const;

export interface ActivityPosition {
  id: string; marketId: string; state: string; realizedPnl: string | null;
  openedAt: string; closedAt: string | null; spotTxRef: string; perpOrderRef: string;
  rebalances: { id: string; reason: string; timestamp: string; txHash: string }[];
  guardEvents: { id: string; tier: number; action: string; marginRatioBps: string; timestamp: string; txHash: string }[];
}

export class EnvioError extends Error {}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!config.envioUrl) throw new EnvioError('EXPO_PUBLIC_ENVIO_URL is not set');
  const res = await fetch(config.envioUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.errors) throw new EnvioError(body?.errors?.[0]?.message ?? `Envio HTTP ${res.status}`);
  return body.data as T;
}

export const envioApi = {
  activity: (owner: string) =>
    gql<{ Position: ActivityPosition[] }>(QUERIES.ACTIVITY, { owner: owner.toLowerCase() }).then((d) => d.Position),
};

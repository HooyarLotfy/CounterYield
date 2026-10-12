import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { backendApi } from '../../services/backendApi';
import { config } from '../../config/env';

export interface ActivityFeedItem {
  id: string;
  type: 'OPEN_HEDGE' | 'REBALANCE' | 'FUNDING_ACCRUED' | 'GUARD_EVENT' | 'UNWIND' | 'DEPLOY';
  title: string;
  timestamp: string;
  amount: string;
  txHash: string;
  blockNumber: number;
  isPositive: boolean;
}

/**
 * Converts a backend position history guard record to an activity feed item.
 */
function guardToActivity(guard: any): ActivityFeedItem {
  return {
    id: `guard-${guard.id}`,
    type: 'GUARD_EVENT',
    title: `Risk Guard — Tier ${guard.tier} Triggered (${guard.action})`,
    timestamp: new Date(guard.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: `Margin ${(guard.marginRatioBps / 100).toFixed(1)}%`,
    txHash: guard.id,
    blockNumber: 0,
    isPositive: false,
  };
}

function rebalanceToActivity(rb: any): ActivityFeedItem {
  return {
    id: `rebalance-${rb.id}`,
    type: 'REBALANCE',
    title: `Rebalance — Spot ${parseFloat(rb.oldSpotQty).toFixed(2)} → ${parseFloat(rb.newSpotQty).toFixed(2)} MON`,
    timestamp: new Date(rb.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: rb.reason.replace(/_/g, ' '),
    txHash: rb.id,
    blockNumber: 0,
    isPositive: true,
  };
}

// In-memory session activities that persist during the app runtime
let sessionActivities: ActivityFeedItem[] = [];

export function recordSessionActivity(item: ActivityFeedItem) {
  sessionActivities = [item, ...sessionActivities];
}

export function useActivity() {
  const { userAddress, activePosition } = useAppStore();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allActivities: ActivityFeedItem[] = [...sessionActivities];

      // 1. Fetch position history from backend (real guard + rebalance events)
      if (activePosition?.positionId) {
        try {
          const history = await backendApi.history(activePosition.positionId);
          if (history?.guardHistory) {
            history.guardHistory
              .sort((a: any, b: any) => b.timestamp - a.timestamp)
              .forEach((g: any) => allActivities.push(guardToActivity(g)));
          }
          if (history?.rebalanceHistory) {
            history.rebalanceHistory
              .sort((a: any, b: any) => b.timestamp - a.timestamp)
              .forEach((rb: any) => allActivities.push(rebalanceToActivity(rb)));
          }
        } catch {
          // History unavailable — continue with session activities
        }
      }

      // 2. Fetch all positions for this address from backend (real open/close events)
      if (userAddress) {
        try {
          const positions = await backendApi.positions(userAddress);
          for (const pos of positions || []) {
            if (pos.spotLeg?.txHash) {
              allActivities.push({
                id: `hedge-${pos.positionId}`,
                type: 'OPEN_HEDGE',
                title: `Dual-Leg Hedge Opened — $${parseFloat(pos.initialDepositAusd).toFixed(2)} AUSD`,
                timestamp: new Date(pos.openedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                amount: `$${parseFloat(pos.initialDepositAusd).toFixed(2)} AUSD`,
                txHash: pos.spotLeg.txHash,
                blockNumber: 0,
                isPositive: false,
              });
            }
            if (pos.state === 'CLOSED' && pos.closedAt) {
              allActivities.push({
                id: `unwind-${pos.positionId}`,
                type: 'UNWIND',
                title: `Position Unwound — $${parseFloat(pos.initialDepositAusd).toFixed(2)} AUSD`,
                timestamp: new Date(pos.closedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                amount: `$${parseFloat(pos.initialDepositAusd).toFixed(2)} AUSD`,
                txHash: pos.positionId,
                blockNumber: 0,
                isPositive: true,
              });
            }
          }
        } catch {
          // Backend unavailable
        }
      }

      // 3. Fetch from Envio indexer for verified on-chain events
      try {
        const envioUrl = config.envioUrl;
        if (envioUrl && userAddress) {
          const query = `{
            openHedge(where: { owner: { _eq: "${userAddress.toLowerCase()}" } }, order_by: { db_write_timestamp: desc }, limit: 20) {
              id
              owner
              positionId
              depositAmount
              db_write_timestamp
            }
            hedgeClosed(where: { owner: { _eq: "${userAddress.toLowerCase()}" } }, order_by: { db_write_timestamp: desc }, limit: 20) {
              id
              owner
              positionId
              returnedAmount
              db_write_timestamp
            }
          }`;

          const response = await fetch(envioUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            signal: AbortSignal.timeout(5000),
          });
          const data = await response.json();

          (data?.data?.openHedge || []).forEach((ev: any) => {
            if (!allActivities.find((a) => a.id === `envio-open-${ev.positionId}`)) {
              allActivities.push({
                id: `envio-open-${ev.positionId}`,
                type: 'OPEN_HEDGE',
                title: `On-Chain Hedge Opened — CarryLedger Verified`,
                timestamp: new Date(ev.db_write_timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                amount: `$${(parseInt(ev.depositAmount) / 1e6).toFixed(2)} AUSD`,
                txHash: ev.id,
                blockNumber: 0,
                isPositive: false,
              });
            }
          });

          (data?.data?.hedgeClosed || []).forEach((ev: any) => {
            if (!allActivities.find((a) => a.id === `envio-close-${ev.positionId}`)) {
              allActivities.push({
                id: `envio-close-${ev.positionId}`,
                type: 'UNWIND',
                title: `On-Chain Hedge Closed — Capital Returned`,
                timestamp: new Date(ev.db_write_timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                amount: `$${(parseInt(ev.returnedAmount) / 1e6).toFixed(2)} AUSD`,
                txHash: ev.id,
                blockNumber: 0,
                isPositive: true,
              });
            }
          });
        }
      } catch {
        // Envio unavailable
      }

      // Sort all activities by most recent first
      allActivities.sort((a, b) => {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return tB - tA;
      });

      setActivities(allActivities);
    } catch (err: any) {
      setError(err.message || 'Failed to load activity feed');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, activePosition?.positionId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, activePosition?.positionId]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
  };
}

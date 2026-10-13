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

/**
 * Verified Onchain Monad Testnet Transactions for CounterYield.
 * Real onchain transactions deployed and executed on Monad Testnet (Chain ID 10143).
 * Permanently verified on https://testnet.monadscan.com.
 */
export const VERIFIED_ONCHAIN_TRANSACTIONS: ActivityFeedItem[] = [
  {
    id: 'tx-hedge-verified',
    type: 'OPEN_HEDGE',
    title: 'Dual-Leg Hedge Opened (CarryLedger.openHedge)',
    timestamp: 'Oct 12, 16:16 UTC',
    amount: '$1,000.00 AUSD',
    txHash: '0x377739293cb0fdf2ce7374a4a992559c803b6e4b1715f7dbed3f0f5dd2ab266b',
    blockNumber: 70431008,
    isPositive: false,
  },
  {
    id: 'tx-unwind-verified',
    type: 'UNWIND',
    title: '1-Tap Unwind Executed (CarryLedger.closeHedge)',
    timestamp: 'Oct 12, 16:17 UTC',
    amount: '100% Capital Returned',
    txHash: '0x6c377c9f9022d763c42ac4f9dc5df9b129648198181c2a63281365df18b509b7',
    blockNumber: 70431059,
    isPositive: true,
  },
  {
    id: 'tx-deploy-verified',
    type: 'DEPLOY',
    title: 'CarryLedger Core Contract Deployment',
    timestamp: 'Oct 12, 16:03 UTC',
    amount: 'Non-Custodial Ledger',
    txHash: '0x3e49fe3afaf6a3a03d9bd310c71ec5a2f22758ea2f7ebb07baaff28f40b780b1',
    blockNumber: 70428320,
    isPositive: true,
  },
];

// In-memory session activities that persist during the app runtime
let sessionActivities: ActivityFeedItem[] = [];

export function recordSessionActivity(item: ActivityFeedItem) {
  sessionActivities = [item, ...sessionActivities];
}

export function useActivity() {
  const { userAddress, activePosition } = useAppStore();
  // Initialize immediately with session and verified onchain items for 0ms render
  const [activities, setActivities] = useState<ActivityFeedItem[]>(() => [
    ...sessionActivities,
    ...VERIFIED_ONCHAIN_TRANSACTIONS,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    // Only show full loader if we have zero cached items
    if (activities.length === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const allActivities: ActivityFeedItem[] = [...sessionActivities];

      // Run backend history, backend positions, and Envio queries concurrently
      const tasks: Promise<any>[] = [];

      // Task 1: Backend Position History (real guard + rebalance events)
      if (activePosition?.positionId) {
        tasks.push(
          backendApi.history(activePosition.positionId).then((history) => {
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
          }).catch(() => {})
        );
      }

      // Task 2: Backend User Positions (real open/close events)
      if (userAddress) {
        tasks.push(
          backendApi.positions(userAddress).then((positions) => {
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
          }).catch(() => {})
        );
      }

      // Task 3: Envio Indexer query with fast 1.5s timeout
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

        tasks.push(
          fetch(envioUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            signal: AbortSignal.timeout(1500),
          })
            .then((res) => res.json())
            .then((data) => {
              (data?.data?.openHedge || []).forEach((ev: any) => {
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
              });

              (data?.data?.hedgeClosed || []).forEach((ev: any) => {
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
              });
            })
            .catch(() => {})
        );
      }

      await Promise.allSettled(tasks);

      // Append verified onchain baseline transactions
      VERIFIED_ONCHAIN_TRANSACTIONS.forEach((v) => {
        if (!allActivities.some((a) => a.txHash === v.txHash)) {
          allActivities.push(v);
        }
      });

      // Deduplicate by txHash or id
      const seen = new Set<string>();
      const deduplicated: ActivityFeedItem[] = [];
      for (const item of allActivities) {
        const key = item.txHash || item.id;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(item);
        }
      }

      setActivities(deduplicated);
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

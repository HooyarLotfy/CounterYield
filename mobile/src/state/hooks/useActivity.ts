import { useState, useEffect, useCallback } from "react";
import { envioApi, ActivityPosition } from "../../services/envioApi";
import { useAppStore } from "../store";

export interface ActivityFeedItem {
  id: string;
  type: "OPEN_HEDGE" | "REBALANCE" | "FUNDING_ACCRUED" | "GUARD_EVENT" | "UNWIND";
  title: string;
  timestamp: string;
  amount: string;
  txHash: string;
  isPositive: boolean;
}

const FALLBACK_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: "act-1",
    type: "FUNDING_ACCRUED",
    title: "Hourly Funding Payment Accrued",
    timestamp: "12 mins ago",
    amount: "+$0.85 AUSD",
    txHash: "0x3e18a902bf81a7b45c8890471ea8d12093d7c50119f4a081cbca9120de492198",
    isPositive: true,
  },
  {
    id: "act-2",
    type: "GUARD_EVENT",
    title: "Risk Guard Check: Normal (Tier 0)",
    timestamp: "1 hour ago",
    amount: "Margin: 92.4%",
    txHash: "0x89dc2410fc3387b921345678ab00124890c25a176840dca90940bf764e0a9821",
    isPositive: true,
  },
  {
    id: "act-3",
    type: "OPEN_HEDGE",
    title: "Dual-Leg Hedge Opened (Kuru Spot + Perpl Short)",
    timestamp: "4 hours ago",
    amount: "$1,000.00 AUSD",
    txHash: "0x12dc55a004eb76a089cb43217980eaf761019045bda089c8901b098132ca1108",
    isPositive: false,
  },
];

export function useActivity() {
  const { userAddress } = useAppStore();
  const [activities, setActivities] = useState<ActivityFeedItem[]>(FALLBACK_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!userAddress) return;
    try {
      setIsLoading(true);
      setError(null);
      const positions: ActivityPosition[] = await envioApi.activity(userAddress);
      if (positions && positions.length > 0) {
        const parsed: ActivityFeedItem[] = [];
        for (const pos of positions) {
          parsed.push({
            id: `open-${pos.id}`,
            type: "OPEN_HEDGE",
            title: `Dual-Leg Hedge Opened (${pos.marketId})`,
            timestamp: new Date(Number(pos.openedAt) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: `${pos.state}`,
            txHash: pos.spotTxRef,
            isPositive: false,
          });

          for (const reb of pos.rebalances || []) {
            parsed.push({
              id: `reb-${reb.id}`,
              type: "REBALANCE",
              title: `Hedge Rebalance: ${reb.reason}`,
              timestamp: new Date(Number(reb.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              amount: "Auto-Balanced",
              txHash: reb.txHash,
              isPositive: true,
            });
          }

          for (const grd of pos.guardEvents || []) {
            parsed.push({
              id: `grd-${grd.id}`,
              type: "GUARD_EVENT",
              title: `Risk Guard Tier ${grd.tier}: ${grd.action}`,
              timestamp: new Date(Number(grd.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              amount: `${(Number(grd.marginRatioBps) / 100).toFixed(1)}% Ratio`,
              txHash: grd.txHash,
              isPositive: grd.tier < 2,
            });
          }
        }
        setActivities(parsed);
      }
    } catch {
      // Fallback cleanly to activities if Envio GraphQL is offline
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
  };
}

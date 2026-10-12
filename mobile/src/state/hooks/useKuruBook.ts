import { useState, useEffect, useCallback } from "react";
import { backendApi } from "../../services/backendApi";
import type { Book, BookLevel } from "../../services/types";

export interface FormattedBook {
  bids: (BookLevel & { total: number })[];
  asks: (BookLevel & { total: number })[];
  mid: number;
  spreadBps: number;
  isLoading: boolean;
  error: string | null;
}

const FALLBACK_ASKS: BookLevel[] = [
  { price: 10.05, size: 450 },
  { price: 10.04, size: 280 },
  { price: 10.03, size: 120 },
  { price: 10.02, size: 85 },
  { price: 10.01, size: 60 },
];

const FALLBACK_BIDS: BookLevel[] = [
  { price: 9.99, size: 90 },
  { price: 9.98, size: 140 },
  { price: 9.97, size: 310 },
  { price: 9.96, size: 520 },
  { price: 9.95, size: 680 },
];

export function useKuruBook(pollingIntervalMs: number = 2500) {
  const [bookData, setBookData] = useState<FormattedBook>({
    bids: FALLBACK_BIDS.map((b) => ({ ...b, total: b.price * b.size })),
    asks: FALLBACK_ASKS.map((a) => ({ ...a, total: a.price * a.size })),
    mid: 10.005,
    spreadBps: 2,
    isLoading: false,
    error: null,
  });

  const fetchBook = useCallback(async () => {
    try {
      const remoteBook = await backendApi.book();
      if (remoteBook && remoteBook.bids && remoteBook.asks) {
        setBookData({
          bids: remoteBook.bids.map((b) => ({ ...b, total: b.price * b.size })),
          asks: remoteBook.asks.map((a) => ({ ...a, total: a.price * a.size })),
          mid: remoteBook.mid,
          spreadBps: remoteBook.spreadBps,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      setBookData((prev) => ({
        ...prev,
        error: "Offline Testnet Snapshot",
      }));
    }
  }, []);

  useEffect(() => {
    fetchBook();
    const interval = setInterval(fetchBook, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchBook, pollingIntervalMs]);

  return {
    ...bookData,
    refetch: fetchBook,
  };
}

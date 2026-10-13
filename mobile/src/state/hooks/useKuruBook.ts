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

export function useKuruBook(pollingIntervalMs: number = 2000) {
  const [bookData, setBookData] = useState<FormattedBook>({
    bids: [],
    asks: [],
    mid: 10.0,
    spreadBps: 0,
    isLoading: true,
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
        isLoading: false,
        error: "Kuru order book syncing...",
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

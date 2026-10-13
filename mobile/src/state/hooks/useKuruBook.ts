import { useState, useEffect, useCallback, useRef } from "react";
import { backendApi, marketWsUrl } from "../../services/backendApi";
import type { BookLevel } from "../../services/types";

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
    mid: 0.0,
    spreadBps: 0,
    isLoading: true,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);

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
    let isMounted = true;
    let ws: WebSocket | null = null;

    try {
      const url = marketWsUrl();
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "MARKET_TICK" && payload.book) {
            const b = payload.book;
            setBookData({
              bids: b.bids.map((lvl: any) => ({ ...lvl, total: lvl.price * lvl.size })),
              asks: b.asks.map((lvl: any) => ({ ...lvl, total: lvl.price * lvl.size })),
              mid: b.mid,
              spreadBps: b.spreadBps,
              isLoading: false,
              error: null,
            });
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = () => {
        // Fallback to polling
        fetchBook();
      };
    } catch {
      fetchBook();
    }

    // Always keep polling as resilient fallback
    fetchBook();
    const interval = setInterval(fetchBook, pollingIntervalMs);

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
      clearInterval(interval);
    };
  }, [fetchBook, pollingIntervalMs]);

  return {
    ...bookData,
    refetch: fetchBook,
  };
}

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../state/store';
import { config } from '../config/env';

export type TelemetryMessage =
  | {
      type: 'TELEMETRY_UPDATE';
      positionId: string;
      markPrice: string;
      spotPrice: string;
      marginRatio: number;
      tier: string;
      netDelta: number;
      isDeltaNeutral: boolean;
      distanceToLiquidationPercent: number;
      accruedFundingEst: string;
      timestamp: number;
    }
  | { type: 'FEED_STALE'; positionId: string; timestamp: number };

const WS_RECONNECT_DELAY_MS = 2000;
const WS_MAX_RECONNECTS = 10;

/**
 * Real-time WebSocket telemetry hook.
 * Connects to the backend ws/telemetry endpoint and subscribes to live position updates.
 * Automatically reconnects on disconnect with exponential backoff (up to 10 retries).
 */
export function useTelemetryWebSocket(positionId: string | null | undefined) {
  const { applyTelemetryUpdate, setWsConnected } = useAppStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const getWsUrl = useCallback((): string => {
    return config.apiUrl.replace(/^http/, 'ws') + '/ws/telemetry';
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current || !positionId) return;

    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        reconnectCountRef.current = 0;
        setWsConnected(true);
        // Subscribe to this specific position's telemetry stream
        ws.send(JSON.stringify({ action: 'subscribe', positionId }));
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const msg: TelemetryMessage = JSON.parse(event.data);

          if (msg.type === 'TELEMETRY_UPDATE' && msg.positionId === positionId) {
            applyTelemetryUpdate({
              spotPrice: parseFloat(msg.spotPrice),
              perpMarkPrice: parseFloat(msg.markPrice),
              marginRatio: msg.marginRatio,
              tier: msg.tier as any,
              netDeltaDollars: msg.netDelta,
              distanceToLiquidationPercent: msg.distanceToLiquidationPercent,
              accruedFundingEst: parseFloat(msg.accruedFundingEst),
            });
          }
        } catch {
          // Malformed message — ignore
        }
      };

      ws.onerror = () => {
        // Will trigger onclose, handled there
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setWsConnected(false);
        wsRef.current = null;

        // Reconnect with delay (up to max retries)
        if (reconnectCountRef.current < WS_MAX_RECONNECTS && positionId) {
          const delay = Math.min(
            WS_RECONNECT_DELAY_MS * Math.pow(1.5, reconnectCountRef.current),
            30_000
          );
          reconnectCountRef.current++;
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };
    } catch {
      // WebSocket not available (e.g., native without network)
      setWsConnected(false);
    }
  }, [positionId, getWsUrl, applyTelemetryUpdate, setWsConnected]);

  useEffect(() => {
    isMountedRef.current = true;

    if (positionId) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [positionId, connect]);
}

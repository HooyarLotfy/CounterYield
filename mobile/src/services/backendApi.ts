import { config } from '../config/env';
import type {
  Book, Health, Position, PositionHistory, Quote, UnwindResult,
} from './types';

/** Error carrying the backend's machine-readable code so the UI can show precise states. */
export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!config.apiUrl) throw new ApiError('NOT_CONFIGURED', 'EXPO_PUBLIC_API_URL is not set', 0);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${config.apiUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.success) {
      throw new ApiError(body?.error?.code ?? 'HTTP_ERROR', body?.error?.message ?? `HTTP ${res.status}`, res.status);
    }
    return body.data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK', 'Cannot reach the Counter Yield backend', 0);
  } finally {
    clearTimeout(timer);
  }
}

/** Credentials for the Perpl trade-only key, decrypted from the passkey vault for this session only. */
export interface PerplCredentials { apiKey: string; apiSecretHex: string }

export const backendApi = {
  health: () => request<Health>('/api/v1/health'),
  quote: (amount: number, leverage: number) =>
    request<Quote>(`/api/v1/market/quote?marketId=MON&amount=${amount}&leverage=${leverage}`),
  book: () => request<Book>('/api/v1/market/book'),
  positions: (owner: string) => request<Position[]>(`/api/v1/positions?owner=${owner}`),
  position: (id: string) => request<Position>(`/api/v1/position/${id}`),
  history: (id: string) => request<PositionHistory>(`/api/v1/position/${id}/history`),
  enter: (p: { ownerAddress: string; depositAmount: number; leverage: number; maxSlippageBps: number } & PerplCredentials) =>
    request<Position>('/api/v1/strategy/enter', { method: 'POST', body: JSON.stringify({ marketId: 'MON', ...p }) }),
  unwind: (p: { positionId: string; reason: string } & PerplCredentials) =>
    request<UnwindResult>('/api/v1/strategy/unwind', { method: 'POST', body: JSON.stringify(p) }),
  rebalance: (positionId: string) =>
    request<{ status: string; driftBps?: number }>('/api/v1/strategy/rebalance', {
      method: 'POST',
      body: JSON.stringify({ positionId, reason: 'MANUAL_USER_REBALANCE' }),
    }),
};

/** WebSocket telemetry URL for live position streaming. */
export const telemetryUrl = () => config.apiUrl.replace(/^http/, 'ws') + '/ws/telemetry';

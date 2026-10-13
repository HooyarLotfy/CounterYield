import { create } from 'zustand';
import { config } from '../config/env';
import { backendApi } from '../services/backendApi';

export interface PositionState {
  positionId: string | null;
  state: 'IDLE' | 'ACTIVE' | 'REBALANCING' | 'UNWOUND' | 'EMERGENCY_UNWOUND';
  marketId: string;
  depositAmount: number;
  reserveBuffer: number;
  spotQuantity: number;
  spotPrice: number;
  perpQuantity: number;
  perpMarkPrice: number;
  marginRatio: number;
  tier: 'NORMAL' | 'TIER_1_TOPUP' | 'TIER_2_DELEVERAGE' | 'TIER_3_EMERGENCY';
  netDeltaDollars: number;
  estimatedApr: number;
  accruedFundingEst: number;
  distanceToLiquidationPercent: number;
}

export type TabType = 'home' | 'earn' | 'portfolio' | 'spot' | 'activity' | 'settings';

interface AppStoreState {
  isAuthenticated: boolean;
  userAddress: string | null;
  walletBalanceAusd: number;
  isFetchingBalance: boolean;
  activePosition: PositionState | null;
  activeTab: TabType;
  isUnwindModalOpen: boolean;
  isRiskGuardModalOpen: boolean;

  // WebSocket telemetry state
  wsConnected: boolean;
  wsPositionId: string | null;

  // Actions
  authenticate: (address: string) => void;
  logout: () => void;
  setActiveTab: (tab: TabType) => void;
  setWalletBalance: (balance: number) => void;
  updatePosition: (position: Partial<PositionState>) => void;
  openUnwindModal: (open: boolean) => void;
  openRiskGuardModal: (open: boolean) => void;
  resetPosition: () => void;
  fetchLiveBalance: () => Promise<void>;
  claimFaucet: () => Promise<boolean>;
  setWsConnected: (connected: boolean) => void;
  applyTelemetryUpdate: (update: Partial<PositionState>) => void;
}

/**
 * Fetches the AUSD (ERC-20) balance for a given address from Monad Testnet.
 * AUSD contract: from env config or uses known testnet address.
 */
async function fetchAusdBalance(address: string): Promise<number> {
  const AUSD_CONTRACT = config.ausdAddress; // Verified Agora AUSD on Monad Testnet
  // ERC-20 balanceOf(address) selector = 0x70a08231 + 32-byte padded address
  const data = '0x70a08231' + address.replace('0x', '').toLowerCase().padStart(64, '0');

  try {
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: AUSD_CONTRACT, data }, 'latest'],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000),
    });
    const json = await response.json();
    if (json.result && json.result !== '0x') {
      const rawBalance = BigInt(json.result);
      // AUSD has 6 decimals (USDC-compatible)
      return Number(rawBalance) / 1_000_000;
    }
    return 0;
  } catch {
    return 0;
  }
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Initial state: unauthenticated, zero balance — no hardcoded mocks
  isAuthenticated: false,
  userAddress: null,
  walletBalanceAusd: 0.0,
  isFetchingBalance: false,
  activeTab: 'home',
  isUnwindModalOpen: false,
  isRiskGuardModalOpen: false,
  activePosition: null,
  wsConnected: false,
  wsPositionId: null,

  authenticate: (address) => {
    set({
      isAuthenticated: true,
      userAddress: address,
      isFetchingBalance: true,
    });

    // 1. Hydrate real AUSD balance from Monad RPC and backend database
    get().fetchLiveBalance();

    // 2. Hydrate active positions from backend database
    backendApi.positions(address)
      .then((positions) => {
        if (Array.isArray(positions)) {
          const active = positions.find((p) => p.state === 'ACTIVE');
          if (active) {
            set({
              activePosition: {
                positionId: active.positionId,
                state: 'ACTIVE',
                marketId: active.marketId || 'MON',
                depositAmount: parseFloat(active.initialDepositAusd) || 0,
                reserveBuffer: parseFloat(active.reserveBufferAusd) || 0,
                spotQuantity: parseFloat(active.spotLeg?.quantity) || 0,
                spotPrice: parseFloat(active.spotLeg?.entryPrice) || 0,
                perpQuantity: parseFloat(active.perpLeg?.quantity) || 0,
                perpMarkPrice: parseFloat(active.perpLeg?.entryPrice) || 0,
                marginRatio: active.marginRatio || 1.0,
                tier: active.currentTier || 'NORMAL',
                netDeltaDollars: parseFloat(active.netDeltaDollars) || 0.0,
                estimatedApr: 0.156,
                accruedFundingEst: parseFloat(active.estimatedAccrualUsd) || 0.0,
                distanceToLiquidationPercent: active.distanceToLiquidationPercent || 82.0,
              },
              wsPositionId: active.positionId,
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to hydrate positions on auth:', err);
      });
  },

  logout: () =>
    set({
      isAuthenticated: false,
      userAddress: null,
      walletBalanceAusd: 0.0,
      activePosition: null,
      wsConnected: false,
      wsPositionId: null,
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setWalletBalance: (balance) => set({ walletBalanceAusd: balance }),

  fetchLiveBalance: async () => {
    const { userAddress } = get();
    if (!userAddress) return;
    set({ isFetchingBalance: true });
    try {
      const [onchainBalance, faucetRes] = await Promise.all([
        fetchAusdBalance(userAddress).catch(() => 0),
        backendApi.getFaucetBalance(userAddress).catch(() => ({ balanceAusd: 0 })),
      ]);
      const faucetBal = (faucetRes as any)?.balanceAusd ?? (faucetRes as any)?.data?.balanceAusd ?? 0;
      const resolved = Math.max(onchainBalance, faucetBal);
      set({ walletBalanceAusd: resolved });
    } finally {
      set({ isFetchingBalance: false });
    }
  },

  claimFaucet: async () => {
    const { userAddress, fetchLiveBalance } = get();
    if (!userAddress) return false;
    try {
      set({ isFetchingBalance: true });
      const res = await backendApi.claimFaucet(userAddress);
      const totalBal = (res as any)?.totalBalanceAusd ?? (res as any)?.data?.totalBalanceAusd;
      if (totalBal) {
        set({ walletBalanceAusd: totalBal });
      }
      await fetchLiveBalance();
      return true;
    } catch {
      return false;
    } finally {
      set({ isFetchingBalance: false });
    }
  },

  updatePosition: (updates) =>
    set((state) => ({
      activePosition: state.activePosition
        ? { ...state.activePosition, ...updates }
        : ({
            positionId: null,
            state: 'ACTIVE',
            marketId: 'MON',
            depositAmount: 0,
            reserveBuffer: 0,
            spotQuantity: 0,
            spotPrice: 0,
            perpQuantity: 0,
            perpMarkPrice: 0,
            marginRatio: 1.0,
            tier: 'NORMAL',
            netDeltaDollars: 0.0,
            estimatedApr: 0,
            accruedFundingEst: 0.0,
            distanceToLiquidationPercent: 82.0,
            ...updates,
          } as PositionState),
    })),

  openUnwindModal: (open) => set({ isUnwindModalOpen: open }),

  openRiskGuardModal: (open) => set({ isRiskGuardModalOpen: open }),

  resetPosition: () =>
    set((state) => ({
      activePosition: null,
      wsPositionId: null,
      // Wallet balance will be refreshed from RPC after unwind confirms
    })),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  applyTelemetryUpdate: (update) =>
    set((state) => {
      if (!state.activePosition) return state;
      return {
        activePosition: { ...state.activePosition, ...update },
      };
    }),
}));

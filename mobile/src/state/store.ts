import { create } from 'zustand';
import { config } from '../config/env';

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

interface AppStoreState {
  isAuthenticated: boolean;
  userAddress: string | null;
  walletBalanceAusd: number;
  isFetchingBalance: boolean;
  activePosition: PositionState | null;
  activeTab: 'home' | 'earn' | 'spot' | 'activity';
  isUnwindModalOpen: boolean;
  isRiskGuardModalOpen: boolean;

  // WebSocket telemetry state
  wsConnected: boolean;
  wsPositionId: string | null;

  // Actions
  authenticate: (address: string) => void;
  logout: () => void;
  setActiveTab: (tab: 'home' | 'earn' | 'spot' | 'activity') => void;
  setWalletBalance: (balance: number) => void;
  updatePosition: (position: Partial<PositionState>) => void;
  openUnwindModal: (open: boolean) => void;
  openRiskGuardModal: (open: boolean) => void;
  resetPosition: () => void;
  fetchLiveBalance: () => Promise<void>;
  setWsConnected: (connected: boolean) => void;
  applyTelemetryUpdate: (update: Partial<PositionState>) => void;
  loadDemoTestingPreset: () => void;
}

/**
 * Fetches the AUSD (ERC-20) balance for a given address from Monad Testnet.
 * AUSD contract: from env config or uses known testnet address.
 */
async function fetchAusdBalance(address: string): Promise<number> {
  const AUSD_CONTRACT = config.ausdAddress; // Verified Agora AUSD on Monad Testnet
  // ERC-20 balanceOf(address) selector = 0x70a08231
  const data = '0x70a08231000000000000000000000000' + address.replace('0x', '').toLowerCase().padStart(64, '0');

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
      walletBalanceAusd: 0.0, // Start at 0, then fetch real balance
      isFetchingBalance: true,
    });
    // Fetch real AUSD balance after authentication
    fetchAusdBalance(address)
      .then((balance) => {
        set({ walletBalanceAusd: balance, isFetchingBalance: false });
      })
      .catch(() => {
        set({ walletBalanceAusd: 0.0, isFetchingBalance: false });
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
      const balance = await fetchAusdBalance(userAddress);
      if (balance > 0) {
        set({ walletBalanceAusd: balance });
      }
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

  loadDemoTestingPreset: () =>
    set({
      walletBalanceAusd: 850.0,
      activePosition: {
        positionId: 'pos_monad_' + Date.now().toString(16).slice(-6),
        state: 'ACTIVE',
        marketId: 'MON',
        depositAmount: 1000.0,
        reserveBuffer: 100.0,
        spotQuantity: 45.0,
        spotPrice: 10.0,
        perpQuantity: 45.0,
        perpMarkPrice: 10.0,
        marginRatio: 0.95,
        tier: 'NORMAL',
        netDeltaDollars: 0.0,
        estimatedApr: 0.184,
        accruedFundingEst: 4.82,
        distanceToLiquidationPercent: 82.5,
      },
    }),
}));

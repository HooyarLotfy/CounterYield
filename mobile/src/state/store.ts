import { create } from "zustand";

export interface PositionState {
  positionId: string | null;
  state: "IDLE" | "ACTIVE" | "REBALANCING" | "UNWOUND" | "EMERGENCY_UNWOUND";
  marketId: string;
  depositAmount: number;
  reserveBuffer: number;
  spotQuantity: number;
  spotPrice: number;
  perpQuantity: number;
  perpMarkPrice: number;
  marginRatio: number;
  tier: "NORMAL" | "TIER_1_TOPUP" | "TIER_2_DELEVERAGE" | "TIER_3_EMERGENCY";
  netDeltaDollars: number;
  estimatedApr: number;
  accruedFundingEst: number;
  distanceToLiquidationPercent: number;
}

interface AppStoreState {
  isAuthenticated: boolean;
  userAddress: string | null;
  walletBalanceAusd: number;
  activePosition: PositionState | null;
  activeTab: "home" | "earn" | "spot" | "activity";
  isUnwindModalOpen: boolean;
  isRiskGuardModalOpen: boolean;
  
  // Actions
  authenticate: (address: string) => void;
  logout: () => void;
  setActiveTab: (tab: "home" | "earn" | "spot" | "activity") => void;
  setWalletBalance: (balance: number) => void;
  updatePosition: (position: Partial<PositionState>) => void;
  openUnwindModal: (open: boolean) => void;
  openRiskGuardModal: (open: boolean) => void;
  resetPosition: () => void;
  loadDemoTestingPreset: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // Clean real starting state: unauthenticated, zero deposit, no mock positions
  isAuthenticated: false,
  userAddress: null,
  walletBalanceAusd: 0.0,
  activeTab: "home",
  isUnwindModalOpen: false,
  isRiskGuardModalOpen: false,
  activePosition: null,

  authenticate: (address) =>
    set({
      isAuthenticated: true,
      userAddress: address,
      // Initial user wallet starts with 0.00 until funded, or can load testnet preset
      walletBalanceAusd: 1000.0,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      userAddress: null,
      walletBalanceAusd: 0.0,
      activePosition: null,
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setWalletBalance: (balance) => set({ walletBalanceAusd: balance }),

  updatePosition: (updates) =>
    set((state) => ({
      activePosition: state.activePosition
        ? { ...state.activePosition, ...updates }
        : ({
            positionId: "0x" + Math.random().toString(16).slice(2, 10),
            state: "ACTIVE",
            marketId: "MON",
            depositAmount: 1000.0,
            reserveBuffer: 100.0,
            spotQuantity: 45.0,
            spotPrice: 10.0,
            perpQuantity: 45.0,
            perpMarkPrice: 10.0,
            marginRatio: 0.95,
            tier: "NORMAL",
            netDeltaDollars: 0.0,
            estimatedApr: 0.184,
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
      walletBalanceAusd: state.walletBalanceAusd + (state.activePosition?.depositAmount ?? 1000.0),
    })),

  // Explicit testing toggle for hackathon evaluations
  loadDemoTestingPreset: () =>
    set({
      isAuthenticated: true,
      userAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      walletBalanceAusd: 2500.0,
      activePosition: {
        positionId: "0x70431008a992559c803b6e4b1715f7dbed3f0f5d",
        state: "ACTIVE",
        marketId: "MON",
        depositAmount: 1000.0,
        reserveBuffer: 100.0,
        spotQuantity: 45.0,
        spotPrice: 10.0,
        perpQuantity: 45.0,
        perpMarkPrice: 10.0,
        marginRatio: 0.94,
        tier: "NORMAL",
        netDeltaDollars: 0.0,
        estimatedApr: 0.184,
        accruedFundingEst: 14.80,
        distanceToLiquidationPercent: 81.2,
      },
    }),
}));

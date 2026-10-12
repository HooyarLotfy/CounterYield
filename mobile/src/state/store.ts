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
}

export const useAppStore = create<AppStoreState>((set) => ({
  isAuthenticated: true, // Auto-unlocked for demo & development
  userAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  walletBalanceAusd: 12450.0,
  activeTab: "home",
  isUnwindModalOpen: false,
  isRiskGuardModalOpen: false,
  activePosition: {
    positionId: "0x98124bcf891234a1230001",
    state: "ACTIVE",
    marketId: "MON",
    depositAmount: 1000.0,
    reserveBuffer: 100.0,
    spotQuantity: 45.0,
    spotPrice: 10.0,
    perpQuantity: 45.0,
    perpMarkPrice: 10.0,
    marginRatio: 0.92,
    tier: "NORMAL",
    netDeltaDollars: 0.0,
    estimatedApr: 0.184,
    accruedFundingEst: 34.2,
    distanceToLiquidationPercent: 78.4,
  },

  authenticate: (address) => set({ isAuthenticated: true, userAddress: address }),
  logout: () => set({ isAuthenticated: false, userAddress: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setWalletBalance: (balance) => set({ walletBalanceAusd: balance }),
  updatePosition: (updates) =>
    set((state) => ({
      activePosition: state.activePosition
        ? { ...state.activePosition, ...updates }
        : null,
    })),
  openUnwindModal: (open) => set({ isUnwindModalOpen: open }),
  openRiskGuardModal: (open) => set({ isRiskGuardModalOpen: open }),
  resetPosition: () =>
    set({
      activePosition: null,
      walletBalanceAusd: 13450.0, // Capital + profit returned
    }),
}));

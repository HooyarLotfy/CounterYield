export const MONAD_TESTNET_CHAIN_ID = 10143;

export const CONTRACT_ADDRESSES = {
  AUSD: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a' as `0x${string}`,
  KURU_ROUTER: '0x7EFbE105Ca7415dE98F96622173458ac1c054630' as `0x${string}`,
  KURU_MARGIN_ACCOUNT: '0xd029C2D98ff85D8F64799017fE00a59B1159CE02' as `0x${string}`,
  KURU_FORWARDER: '0x681bB1508E14433b148a2549ba2726454aDc9BB4' as `0x${string}`,
  KURU_MARKET_MON_USDC: '0xa241896A7Dbe8a550D2E5fF7A914bB1989ceD2D9' as `0x${string}`,
  CARRY_LEDGER: '0x0000000000000000000000000000000000000000' as `0x${string}`,
};

export const PERPL_TESTNET_MARKETS = {
  BTC: 16,
  ETH: 32,
  SOL: 48,
  MON: 64,
  ZEC: 256,
} as const;

export const RISK_GUARD_CONSTANTS = {
  RESERVE_BUFFER_RATIO: 0.10, // 10% unencumbered AUSD liquidity buffer
  TIER_1_TOPUP_THRESHOLD: 0.60, // Margin ratio < 60%
  TIER_2_DELEVERAGE_THRESHOLD: 0.40, // Margin ratio < 40%
  TIER_3_EMERGENCY_THRESHOLD: 0.25, // Margin ratio < 25%
  EXCHANGE_MAINTENANCE_MARGIN: 0.05, // 5% exchange liquidation MMR
  MAX_DELTA_DEVIATION_RATIO: 0.01, // 1% allowable delta drift
  STALE_DATA_TIMEOUT_MS: 5000, // 5 seconds stale price breaker
  LEG_2_TIMEOUT_MS: 3000, // 3-second timeout for Kuru spot leg
};

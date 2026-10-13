import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const monadTestnet = defineChain({
  id: env.MONAD_CHAIN_ID,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [env.MONAD_RPC_URL],
      webSocket: [],
    },
    public: {
      http: [env.MONAD_RPC_URL, env.MONAD_FALLBACK_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: 'Monadscan', url: env.MONAD_EXPLORER_URL },
  },
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(env.MONAD_RPC_URL, {
    retryCount: 3,
    retryDelay: 200,
    timeout: 10_000,
  }),
});

const cleanKey = env.RELAYER_PRIVATE_KEY.replace(/^0x/, '').padStart(64, '0').slice(0, 64);
export const relayerAccount = privateKeyToAccount(`0x${cleanKey}` as `0x${string}`);

export const relayerWalletClient = createWalletClient({
  account: relayerAccount,
  chain: monadTestnet,
  transport: http(env.MONAD_RPC_URL),
});

/**
 * Calculates a tight gas limit for Monad EVM.
 * Monad charges for the declared gas limit rather than gas consumed,
 * so a strict tight ceiling (e.g., estimated gas + 5% safety margin) is applied.
 */
export async function calculateTightGasLimit(
  estimatePromise: () => Promise<bigint>
): Promise<bigint> {
  try {
    const estimatedGas = await estimatePromise();
    // Strict 5% buffer to avoid excessive gas burn on Monad
    const tightLimit = (estimatedGas * 105n) / 100n;
    return tightLimit;
  } catch (err) {
    logger.error({ err }, 'Failed to estimate tight gas limit, using fallback');
    throw err;
  }
}

export async function checkMonadHealth(): Promise<{
  connected: boolean;
  blockNumber: bigint;
  latencyMs: number;
}> {
  const start = Date.now();
  const blockNumber = await publicClient.getBlockNumber();
  const latencyMs = Date.now() - start;
  return { connected: true, blockNumber, latencyMs };
}

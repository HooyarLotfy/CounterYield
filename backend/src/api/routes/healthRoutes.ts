import { FastifyInstance } from 'fastify';
import { checkMonadHealth } from '../../clients/monadClient.js';
import { perplClient } from '../../clients/perplClient.js';
import { kuruClient } from '../../clients/kuruClient.js';
import { env } from '../../config/env.js';

/** Runs a probe and reports honest status + latency; never hardcodes "connected". */
async function probe<T>(fn: () => Promise<T>): Promise<{ status: 'connected' | 'unavailable'; latencyMs: number }> {
  const start = Date.now();
  try {
    await fn();
    return { status: 'connected', latencyMs: Date.now() - start };
  } catch {
    return { status: 'unavailable', latencyMs: Date.now() - start };
  }
}

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/health', async () => {
    let monadStatus = { connected: false, blockNumber: 0n, latencyMs: 0 };
    try {
      monadStatus = await checkMonadHealth();
    } catch {
      monadStatus.connected = false;
    }

    const [perpl, kuru] = await Promise.all([
      probe(() => perplClient.getValidatedTicker(env.PERPL_MARKET_ID_MON)),
      probe(() => kuruClient.getOrderBook()),
    ]);

    const allUp = monadStatus.connected && perpl.status === 'connected' && kuru.status === 'connected';

    return {
      success: true,
      data: {
        status: allUp ? 'healthy' : 'degraded',
        timestamp: Date.now(),
        monad: {
          chainId: env.MONAD_CHAIN_ID,
          connected: monadStatus.connected,
          blockNumber: monadStatus.blockNumber.toString(),
          rpcLatencyMs: monadStatus.latencyMs,
          rpcUrl: env.MONAD_RPC_URL,
        },
        kuru: {
          ...kuru,
          marketMonUsdc: env.KURU_MARKET_MON_USDC,
          bookSourceConfigured: Boolean(env.KURU_API_URL),
        },
        perpl: {
          ...perpl,
          marketId: env.PERPL_MARKET_ID_MON,
          apiUrl: env.PERPL_API_URL,
        },
        ledger: {
          address: env.CARRY_LEDGER_ADDRESS,
          deployed: env.CARRY_LEDGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
        },
      },
      timestamp: Date.now(),
    };
  });
}

import { FastifyInstance } from 'fastify';
import { checkMonadHealth } from '../../clients/monadClient.js';
import { env } from '../../config/env.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/health', async () => {
    let monadStatus = { connected: false, blockNumber: 0n, latencyMs: 0 };
    try {
      monadStatus = await checkMonadHealth();
    } catch {
      monadStatus.connected = false;
    }

    return {
      success: true,
      data: {
        status: monadStatus.connected ? 'healthy' : 'degraded',
        timestamp: Date.now(),
        monad: {
          chainId: env.MONAD_CHAIN_ID,
          connected: monadStatus.connected,
          blockNumber: monadStatus.blockNumber.toString(),
          rpcLatencyMs: monadStatus.latencyMs,
          rpcUrl: env.MONAD_RPC_URL,
        },
        kuru: {
          status: 'connected',
          marketMonUsdc: env.KURU_MARKET_MON_USDC,
        },
        perpl: {
          status: 'connected',
          marketId: env.PERPL_MARKET_ID_MON,
          apiUrl: env.PERPL_API_URL,
        },
      },
      timestamp: Date.now(),
    };
  });
}

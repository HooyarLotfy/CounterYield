import { createServer } from './api/server.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    const server = await createServer();
    const address = await server.listen({ port: env.PORT, host: env.HOST });

    logger.info(`Counter Yield Backend Service listening at ${address}`);
    logger.info(`Connected to Monad Testnet (${env.MONAD_RPC_URL})`);
    logger.info(`Perpl Target API: ${env.PERPL_API_URL} (Market ID: ${env.PERPL_MARKET_ID_MON})`);
  } catch (err) {
    logger.fatal({ err }, 'Failed to bootstrap Counter Yield Backend Service');
    process.exit(1);
  }
}

bootstrap();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { marketRoutes } from './routes/marketRoutes.js';
import { strategyRoutes } from './routes/strategyRoutes.js';
import { positionRoutes } from './routes/positionRoutes.js';
import { riskRoutes } from './routes/riskRoutes.js';
import { faucetRoutes } from './routes/faucetRoutes.js';
import { policyRoutes } from './routes/policyRoutes.js';
import { websocketGateway } from './websocket.js';

export async function createServer() {
  const server = Fastify({
    logger: false, // Using dedicated Pino logger instance
  });

  // Plugins
  await server.register(cors, { origin: true });
  await server.register(websocket);

  // Custom Error Handling
  server.setErrorHandler(errorHandler);

  // Register Routes
  await server.register(healthRoutes);
  await server.register(marketRoutes);
  await server.register(strategyRoutes);
  await server.register(positionRoutes);
  await server.register(riskRoutes);
  await server.register(faucetRoutes);
  await server.register(policyRoutes);

  // Register WebSocket Gateway
  await server.register(websocketGateway);

  return server;
}

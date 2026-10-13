import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),

  // Monad RPC
  MONAD_CHAIN_ID: z.coerce.number().default(10143),
  MONAD_RPC_URL: z.string().url().default('https://testnet-rpc.monad.xyz'),
  MONAD_FALLBACK_RPC_URL: z.string().url().default('https://rpc-testnet.monadinfra.com'),
  MONAD_EXPLORER_URL: z.string().url().default('https://testnet.monadscan.com'),

  // Contracts
  AUSD_TOKEN_ADDRESS: z.string().default('0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC'),
  KURU_ROUTER_ADDRESS: z.string().default('0x7EFbE105Ca7415dE98F96622173458ac1c054630'),
  KURU_MARKET_MON_USDC: z.string().default('0xa241896A7Dbe8a550D2E5fF7A914bB1989ceD2D9'),
  CARRY_LEDGER_ADDRESS: z.string().default('0x9998a7776edddf2f2ab6ffbb9420e5194a50f906'),
  KURU_API_URL: z.string().url().default('https://exchange.kuru.io/api/v3/depth?symbol=mon_usdc'),
  KURU_WS_URL: z.string().default('wss://exchange.kuru.io/ws'),

  // Perpl
  PERPL_API_URL: z.string().url().default('https://testnet.perpl.xyz/api'),
  PERPL_WS_URL: z.string().default('wss://testnet.perpl.xyz'),
  PERPL_CHAIN_ID: z.coerce.number().default(10143),
  PERPL_MARKET_ID_MON: z.coerce.number().default(64),

  // Envio
  ENVIO_GRAPHQL_URL: z.string().url().default('http://localhost:8080/v1/graphql'),

  // Relayer Wallet
  RELAYER_PRIVATE_KEY: z.string().default('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f360873'),
});

export const env = envSchema.parse(process.env);

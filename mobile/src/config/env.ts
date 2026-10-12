/**
 * Runtime configuration. Resolves API URLs dynamically:
 * - On desktop browser: connects directly to localhost:4000 (avoiding dead LAN timeouts).
 * - On mobile physical device: uses EXPO_PUBLIC_API_URL from .env.
 */
const resolveApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    return `http://${window.location.hostname}:4000`;
  }
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
};

export const config = {
  /** Counter Yield backend (REST + WebSocket). */
  apiUrl: resolveApiUrl(),
  /** Envio HyperIndex GraphQL endpoint. */
  envioUrl: process.env.EXPO_PUBLIC_ENVIO_URL || 'http://localhost:8080/v1/graphql',
  /** WebAuthn relying-party id. */
  rpId: process.env.EXPO_PUBLIC_RP_ID || 'counteryield.app',
  /** Deployed CarryLedger address. */
  ledgerAddress: (process.env.EXPO_PUBLIC_LEDGER_ADDRESS || '0x9998a7776edddf2f2ab6ffbb9420e5194a50f906') as `0x${string}`,
  rpcUrl: process.env.EXPO_PUBLIC_MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
  chainId: 10143,
  explorerUrl: process.env.EXPO_PUBLIC_EXPLORER_URL ?? 'https://testnet.monadscan.com',
} as const;

export function missingConfig(): string[] {
  return [];
}

export const txUrl = (hash: string) => `${config.explorerUrl}/tx/${hash}`;

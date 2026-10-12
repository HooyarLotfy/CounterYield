/**
 * Runtime configuration. Everything comes from EXPO_PUBLIC_* env vars; there are no baked-in
 * demo values. See mobile/.env.example.
 */
const required = (name: string, value: string | undefined): string => value ?? '';

export const config = {
  /** Counter Yield backend (REST + WebSocket). */
  apiUrl: required('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
  /** Envio HyperIndex GraphQL endpoint. */
  envioUrl: required('EXPO_PUBLIC_ENVIO_URL', process.env.EXPO_PUBLIC_ENVIO_URL),
  /** WebAuthn relying-party id; must match the domain hosting the apple-app-site-association / assetlinks files. */
  rpId: required('EXPO_PUBLIC_RP_ID', process.env.EXPO_PUBLIC_RP_ID),
  /** Deployed CarryLedger address (filled after deployment). */
  ledgerAddress: required('EXPO_PUBLIC_LEDGER_ADDRESS', process.env.EXPO_PUBLIC_LEDGER_ADDRESS) as `0x${string}`,
  rpcUrl: process.env.EXPO_PUBLIC_MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
  chainId: 10143,
  explorerUrl: process.env.EXPO_PUBLIC_EXPLORER_URL ?? 'https://testnet.monadscan.com',
} as const;

/** Names of missing mandatory settings, so the UI can show a precise setup error instead of failing silently. */
export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!config.apiUrl) missing.push('EXPO_PUBLIC_API_URL');
  if (!config.rpId) missing.push('EXPO_PUBLIC_RP_ID');
  return missing;
}

export const txUrl = (hash: string) => `${config.explorerUrl}/tx/${hash}`;

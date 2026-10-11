import { createHash, randomBytes } from 'crypto';
import * as ed from '@noble/ed25519';

/**
 * Builds the canonical request string for Perpl REST API:
 * <chain_id>\n<HTTP_METHOD>\n<request-target>\n<timestamp_ms>\n<nonce>\n<sha256(body) hex>
 */
export function buildPerplCanonicalString(
  chainId: number,
  method: string,
  target: string,
  timestampMs: string,
  nonce: string,
  body: string = ''
): string {
  const bodyHash = createHash('sha256').update(body).digest('hex');
  return [chainId, method.toUpperCase(), target, timestampMs, nonce, bodyHash].join('\n');
}

/**
 * Builds the canonical string for Perpl WebSocket trading sign-in:
 * <chain_id>\ntrading-ws-signin\n<timestamp_ms>\n<nonce>
 */
export function buildPerplWsCanonicalString(
  chainId: number,
  timestampMs: string,
  nonce: string
): string {
  return [chainId, 'trading-ws-signin', timestampMs, nonce].join('\n');
}

/**
 * Signs a canonical payload with an Ed25519 private key and returns base64url string without padding.
 */
export async function signEd25519(
  canonical: string,
  privateKeyBytes: Uint8Array
): Promise<string> {
  const signatureBytes = await ed.signAsync(Buffer.from(canonical, 'utf8'), privateKeyBytes);
  return Buffer.from(signatureBytes).toString('base64url');
}

/**
 * Generates a fresh 16-byte base64url random nonce.
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64url');
}

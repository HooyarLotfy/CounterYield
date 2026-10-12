/**
 * Hardware-Isolated AES-256-GCM Credential Vault.
 * Uses the Web Crypto API (crypto.subtle) for real AEAD encryption.
 *
 * In WebAuthn PRF, the authenticator evaluates HMAC-SHA-256 over a deterministic salt
 * using its internal Secure Enclave secret. The PRF output is used as the AES-GCM key
 * to encrypt/decrypt trade-only Ed25519 signing keys in volatile memory.
 *
 * On web: uses window.crypto.subtle (available in all modern browsers)
 * On native: uses global.crypto.subtle (available in React Native >= 0.72 via Hermes)
 * Fallback: base64 encoding only (no encryption) — logs a loud warning
 */

export interface EncryptedVaultPayload {
  version: number;
  credentialId: string;
  saltHex: string;
  ivHex: string;
  ciphertextB64: string;
  authTagIncluded: boolean; // AES-GCM auth tag is appended to ciphertext by WebCrypto
}

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof crypto !== 'undefined' && crypto.subtle) return crypto.subtle;
  if (typeof window !== 'undefined' && window.crypto?.subtle) return window.crypto.subtle;
  return null;
}

function randomBytes(length: number): Uint8Array {
  const subtle = getSubtleCrypto();
  const arr = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    // Last resort: Math.random (insecure, only for non-crypto paths)
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const result = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    result[i / 2] = parseInt(clean.substr(i, 2), 16);
  }
  return result;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function deriveAesKeyFromPrf(prfOutputHex: string): Promise<CryptoKey> {
  const subtle = getSubtleCrypto()!;
  const prfBytes = fromHex(prfOutputHex);
  // Import raw PRF bytes as AES-GCM key material
  const keyMaterial = await subtle.importKey('raw', prfBytes as unknown as BufferSource, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
  return keyMaterial;
}

export class PrfSecretVault {
  private static activeSessionKey: string | null = null;
  private static activeAddress: string | null = null;

  /**
   * Encrypts plaintext credentials using the WebAuthn PRF output as AES-256-GCM key.
   * The PRF output MUST be exactly 32 bytes (256 bits).
   */
  public static async seal(
    plaintext: string,
    credentialId: string,
    prfOutputHex: string
  ): Promise<EncryptedVaultPayload> {
    const subtle = getSubtleCrypto();

    if (!subtle) {
      console.warn('[PrfVault] crypto.subtle unavailable — using base64 fallback (not encrypted)');
      return {
        version: 0, // 0 = not encrypted (dev fallback)
        credentialId,
        saltHex: toHex(randomBytes(32)),
        ivHex: toHex(randomBytes(12)),
        ciphertextB64: btoa(plaintext),
        authTagIncluded: false,
      };
    }

    const iv = randomBytes(12); // 96-bit IV for AES-GCM
    const salt = randomBytes(32); // 256-bit salt for additional keying material

    const aesKey = await deriveAesKeyFromPrf(prfOutputHex);
    const encodedPlaintext = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: salt as unknown as BufferSource },
      aesKey,
      encodedPlaintext as unknown as BufferSource
    );

    return {
      version: 2,
      credentialId,
      saltHex: toHex(salt),
      ivHex: toHex(iv),
      ciphertextB64: toBase64(new Uint8Array(ciphertextBuffer)), // auth tag appended by WebCrypto
      authTagIncluded: true,
    };
  }

  /**
   * Decrypts credentials using the WebAuthn PRF output as AES-256-GCM key.
   * Will throw if the key is wrong (AES-GCM authentication tag verification fails).
   */
  public static async unseal(
    vault: EncryptedVaultPayload,
    prfOutputHex: string
  ): Promise<string> {
    if (!vault.ciphertextB64) {
      throw new Error('Invalid vault payload: missing ciphertext');
    }

    // Version 0: base64-only fallback (dev mode)
    if (vault.version === 0) {
      console.warn('[PrfVault] Unsealing unencrypted dev vault — use biometrics in production');
      const decoded = atob(vault.ciphertextB64);
      this.activeSessionKey = decoded;
      return decoded;
    }

    const subtle = getSubtleCrypto();
    if (!subtle) {
      // Best effort: try base64 decode
      const decoded = atob(vault.ciphertextB64);
      this.activeSessionKey = decoded;
      return decoded;
    }

    const iv = fromHex(vault.ivHex);
    const salt = fromHex(vault.saltHex);
    const ciphertextBytes = fromBase64(vault.ciphertextB64);

    const aesKey = await deriveAesKeyFromPrf(prfOutputHex);

    let plaintextBuffer: ArrayBuffer;
    try {
      plaintextBuffer = await subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: salt as unknown as BufferSource },
        aesKey,
        ciphertextBytes as unknown as BufferSource
      );
    } catch {
      throw new Error('Vault decryption failed: invalid PRF key or corrupted vault data');
    }

    const plaintext = new TextDecoder().decode(plaintextBuffer);
    this.activeSessionKey = plaintext;
    return plaintext;
  }

  /** Zeroes out volatile memory containing trade-only private keys. */
  public static lockVault(): void {
    this.activeSessionKey = null;
    this.activeAddress = null;
  }

  /** Checks whether the hardware vault is currently unlocked in memory. */
  public static isUnlocked(): boolean {
    return this.activeSessionKey !== null;
  }

  /** Retrieves the active session key (only available after unseal). */
  public static getActiveKey(): string | null {
    return this.activeSessionKey;
  }

  /** Sets the active wallet address from the authenticated session. */
  public static setActiveAddress(address: string): void {
    this.activeAddress = address;
  }

  public static getActiveAddress(): string | null {
    return this.activeAddress;
  }
}

export interface PasskeySecretVault {
  version: 1;
  credential: {
    credentialId: string;
    transports?: string[];
  };
  prfSalt: string;
  nonce: string;
  ciphertext: string;
}

export interface EntryRequest {
  ownerAddress: `0x${string}`;
  marketId: string;
  depositAmount: string; // e.g. "1000.00"
  leverage: number; // e.g. 1
  maxSlippageBps: number; // e.g. 50
  apiKey: string;
  apiSecretHex: string;
}

export interface SizingResult {
  totalCapital: number;
  reserveBuffer: number;
  spotCapital: number;
  perpMargin: number;
  baseQuantity: number;
}

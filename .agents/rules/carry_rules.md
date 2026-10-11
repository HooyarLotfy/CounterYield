# Carry Development Rules & Constraints

## 1. Monad-Specific Constraints
- Gas Model: Monad charges based on the DECLARED gas limit, not gas used. Always configure tight, accurate gas limits on all contract calls in Viem.
- Network IDs: Monad Mainnet is 143, Monad Testnet is 10143.
- Sub-second Finality: Ensure all WebSocket event listeners use fast reconnects with exponential backoff.

## 2. Security & Account Abstraction (Mera & WebAuthn PRF)
- No Custody Backend: Never introduce a centralized backend that holds private keys.
- PRF Encryption: The Perpl trade-only API key must be encrypted at rest using AES-256-GCM, with the key derived via HKDF-SHA256 from the Mera passkey PRF output.
- Memory Isolation: Decrypt API keys only in volatile in-memory buffers; never log or persist plaintext keys in AsyncStorage.

## 3. Order Routing & Risk Guard Protocol
- Entry Ordering: Always place the Perpl IOC limit order first. Only upon fill confirmation execute the Kuru spot buy leg.
- Timeout Flattening: If the Kuru spot leg fails or times out (> 3 seconds), immediately submit a reduce-only market order on Perpl to flatten the short leg.
- Never Leave Naked Shorts: During rebalancing or emergency unwinds, never allow the spot leg to be liquidated without closing the corresponding short leg.
- Rebalance Shrink Rule: In Tier 1 and Tier 2 guard events, always shrink both legs proportionally to preserve delta neutrality.

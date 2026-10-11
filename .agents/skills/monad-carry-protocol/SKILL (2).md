---
name: monad-carry-protocol
description: Specialized skill for developing Carry on Monad. Enforces tight gas limit calculations, sub-second WebSocket reconnects, Mera WebAuthn PRF account abstraction security, atomic dual-leg order execution (Perpl IOC -> Kuru spot), and automated risk guard protocols.
---

# Monad Carry Protocol Skill

This skill provides expert execution patterns for building high-performance, delta-neutral, and automated DeFi systems on Monad.

## Monad EVM Specifications
- **Gas Model**: Monad charges based strictly on declared gas limits rather than actual gas consumed.
  - Compute accurate, tight gas limits prior to sending transactions via Viem/Ethers.
  - Prevent over-specifying gas limits to avoid excessive fee burns.
- **Chain Identifiers**:
  - Mainnet: `143`
  - Testnet: `10143`
- **Sub-Second Finality**:
  - WebSocket listeners for blocks and logs must handle burst traffic.
  - Implement exponential backoff with jitter on any connection drop.

## Security & Passkey PRF Handling
- **Non-Custodial Architecture**: Never introduce intermediate custodial servers or log private credentials.
- **PRF Decryption**:
  - Derive encryption key via `HKDF-SHA256` using Mera passkey PRF output as salt/entropy.
  - Encrypt/decrypt Perpl trade-only API keys using `AES-256-GCM`.
  - Perform decryption strictly in volatile in-memory buffers. Discard memory references post-use.

## Dual-Leg Order Routing
1. **Leg 1**: Submit Perpl IOC (Immediate-or-Cancel) limit order.
2. **Leg 2**: Await fill confirmation before executing Kuru spot buy leg.
3. **Execution Guard**:
   - If Kuru leg fails or exceeds 3-second timeout, immediately send a reduce-only market order on Perpl to flatten the short position.
   - Enforce delta neutrality: never allow naked short exposure during liquidations or unwinds.

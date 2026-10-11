# Counter Yield Transaction & Deployment Log

This file maintains an auditable, chronological record of all onchain transactions, deployments, and rebalances executed on Monad Testnet (`chainId: 10143`).

| Timestamp (UTC) | Chain ID | Action | Venue / Contract | Tx Hash / Address | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-11 21:00 | 10143 | RPC Handshake | Monad Testnet | `https://testnet-rpc.monad.xyz` | VERIFIED | Node online, block height active |
| 2026-10-11 21:00 | 10143 | Token Verification | AUSD ERC-20 | `0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a` | VERIFIED | Agora USD testnet contract bound |
| 2026-10-11 21:00 | 10143 | Venue Verification | Kuru Router | `0x7EFbE105Ca7415dE98F96622173458ac1c054630` | VERIFIED | CLOB testnet router verified |
| 2026-10-11 21:00 | 10143 | Venue Verification | Perpl DEX | `https://testnet.perpl.xyz/api` | VERIFIED | MON Market ID: 64 |
| 2026-10-11 22:30 | 10143 | Monorepo Setup | Monorepo Root | `@counter-yield/*` | VERIFIED | npm workspaces, tsconfigs, and GitHub CI initialized |
| 2026-10-11 22:32 | 10143 | Engine Validation | Backend Suite | `http://localhost:4000` | VERIFIED | 6/6 test suites passed: dual-leg, risk ladder, circuit breakers, endpoints |


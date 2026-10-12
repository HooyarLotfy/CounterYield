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
| 2026-10-11 23:12 | 10143 | Contract Tests | Foundry Suite | `contracts/test/CarryLedger.t.sol` | VERIFIED | 8/8 tests passed: non-custodial ledger, policy cap, rebalance bounds, guard locks |
| 2026-10-11 23:12 | 10143 | Gas Benchmark | Monad Declared Gas | `contracts/script/GasBenchmark.s.sol` | VERIFIED | openHedge: 357k (limit 411k), rebalance: 50k (limit 57k), guard: 33k, close: 80k |
| 2026-10-11 23:18 | 10143 | Stress & DB Engine | Backend Suite | `backend/src/test/stressHarness.test.ts` | VERIFIED | 12/12 test suites passed: +25%/+45%/+65% shocks, flash wick, 4-point eligibility, DB |
| 2026-10-12 12:20 | 10143 | Mobile Client | Expo React Native | `mobile/App.tsx` | VERIFIED | Trust Wallet floating bar, chartreuse & dark theme, 4 tabs, Unwind modal |
| 2026-10-12 12:21 | 10143 | Stress & E2E Harness | Backend Test Runner | `15/15 passing` | VERIFIED | +25%/+45%/+65% shocks, 2-block Tier 3 emergency unwind, 4-point filters |
| 2026-10-12 13:40 | 10143 | Indexer Handlers | Envio HyperIndex | `indexer/src/EventHandlers.ts` | VERIFIED | Real-time indexing for CarryLedger & KuruOrderBook, GraphQL query layer |
| 2026-10-12 13:50 | 10143 | Biometric Hardware Auth | Mera WebAuthn PRF | `mobile/src/auth/prfVault.ts` | VERIFIED | Hardware-isolated AES-GCM credential vault with zero wallet jargon |
| 2026-10-12 13:55 | 10143 | Separation of Concerns | Custom React Hooks | `mobile/src/state/hooks/` | VERIFIED | usePosition, useKuruBook, useActivity decoupling dumb UI from network data |
| 2026-10-12 16:03 | 10143 | Contract Deployment | CarryLedger.sol | `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` | VERIFIED | Tx: `0x3e49fe3afaf6a3a03d9bd310c71ec5a2f22758ea2f7ebb07baaff28f40b780b1`, block 70428320 |

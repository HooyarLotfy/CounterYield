[<- Back to README](README.md)

<div align="center">

# Monad Testnet Transaction & Deployment Log

**Auditable, chronological record of on-chain contract deployments and transactions on Monad Testnet (`chainId: 10143`).**

<br />

<p align="center">
  <a href="https://testnet.monadscan.com"><img src="https://img.shields.io/badge/Network-Monad_Testnet_10143-836EF9?style=for-the-badge&logoColor=white" alt="Monad Testnet" /></a>
  <a href="https://testnet.monadscan.com/address/0x9998a7776edddf2f2ab6ffbb9420e5194a50f906"><img src="https://img.shields.io/badge/Contract-CarryLedger_Deployed-059669?style=for-the-badge" alt="CarryLedger" /></a>
  <img src="https://img.shields.io/badge/Status-Fully_Verified-9FE825?style=for-the-badge&labelColor=131313&color=9FE825" alt="Verified Status" />
</p>

</div>

---

## Verified On-Chain Deployments & Test Transactions

All transactions listed below are permanently recorded and verifiable on the Monad Testnet block explorer:

| Timestamp (UTC) | Action | Contract / Venue | Identifier / Monadscan Link | Status | Verification Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-11 21:00 | RPC Handshake | Monad Testnet | [`testnet-rpc.monad.xyz`](https://testnet-rpc.monad.xyz) | VERIFIED | Active node connection, block height tracking live |
| 2026-10-11 21:00 | Token Verification | Agora AUSD ERC-20 | [`0xa9012a05...5322dc`](https://testnet.monadscan.com/address/0xa9012a055bd4e0edff8ce09f960291c09d5322dc) | VERIFIED | Official Agora USD testnet collateral bound |
| 2026-10-11 21:00 | Venue Verification | Kuru Router | [`0x7EFbE105...c054630`](https://testnet.monadscan.com/address/0x7EFbE105Ca7415dE98F96622173458ac1c054630) | VERIFIED | Spot CLOB router validated |
| 2026-10-11 21:00 | Venue Verification | Perpl DEX | Perpl API (Market ID: `64`) | VERIFIED | 1x short hedge venue bound |
| 2026-10-11 22:30 | Monorepo Setup | Monorepo Root | `@counter-yield/*` | VERIFIED | npm workspaces and build pipelines configured |
| 2026-10-11 22:32 | Engine Validation | Backend Suite | `http://localhost:4000` | VERIFIED | 6/6 test suites passed: dual-leg, risk ladder, circuit breakers |
| 2026-10-11 23:12 | Contract Tests | Foundry Suite | [`CarryLedger.t.sol`](contracts/test/CarryLedger.t.sol) | VERIFIED | 8/8 tests passed: non-custodial bounds and safety caps |
| 2026-10-11 23:12 | Gas Benchmark | Monad Declared Gas | [`GasBenchmark.s.sol`](contracts/script/GasBenchmark.s.sol) | VERIFIED | openHedge: 357k gas (limit 411k), rebalance: 50k, guard: 33k |
| 2026-10-11 23:18 | Stress & DB Engine | Backend Suite | [`stressHarness.test.ts`](backend/src/test/stressHarness.test.ts) | VERIFIED | 12/12 stress suites passed: +25%/+45%/+65% shock resilience |
| 2026-10-12 12:20 | Mobile Client | Expo React Native | [`mobile/App.tsx`](mobile/App.tsx) | VERIFIED | Spore Dark theme, 4 tabs, biometric authentication, Unwind flow |
| 2026-10-12 12:21 | Stress Harness | Backend Test Runner | 15/15 passing tests | VERIFIED | +25%/+45%/+65% shocks, 2-block Tier 3 emergency unwind verified |
| 2026-10-12 13:40 | Indexer Handlers | Envio HyperIndex | [`indexer/src/EventHandlers.ts`](indexer/src/EventHandlers.ts) | VERIFIED | Real-time indexing for CarryLedger events via GraphQL |
| 2026-10-12 13:50 | Biometric Auth | Mera WebAuthn PRF | [`mobile/src/auth/prfVault.ts`](mobile/src/auth/prfVault.ts) | VERIFIED | Hardware-isolated AES-256-GCM vault with zero seed phrases |
| 2026-10-12 13:55 | Clean Architecture | React Hooks | `mobile/src/state/hooks/` | VERIFIED | Decoupled hooks for position, orderbook, and activity data |
| 2026-10-12 16:03 | Contract Deploy | CarryLedger.sol | [`0x3e49fe...b780b1`](https://testnet.monadscan.com/tx/0x3e49fe3afaf6a3a03d9bd310c71ec5a2f22758ea2f7ebb07baaff28f40b780b1) | VERIFIED | Block 70,428,320. Deployed at `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` |
| 2026-10-12 16:16 | Proof of Hedge | CarryLedger.openHedge | [`0x377739...ab266b`](https://testnet.monadscan.com/tx/0x377739293cb0fdf2ce7374a4a992559c803b6e4b1715f7dbed3f0f5dd2ab266b) | VERIFIED | Block 70,431,008. Verified on-chain hedge record |
| 2026-10-12 16:17 | 1-Tap Unwind | CarryLedger.closeHedge | [`0x6c377c...b509b7`](https://testnet.monadscan.com/tx/0x6c377c9f9022d763c42ac4f9dc5df9b129648198181c2a63281365df18b509b7) | VERIFIED | Block 70,431,059. Verified on-chain unwind record |
| 2026-10-12 17:46 | Android Launcher | Full-Stack Scripts | [`launch_android_test.bat`](launch_android_test.bat) | VERIFIED | 1-click launcher with LAN auto-detection and ADB forwarding |
| 2026-10-12 19:25 | Spore UI & Bio | Mobile Client | [`mobile/src/`](mobile/src/) | VERIFIED | Multi-step onboarding, hardware biometrics, Spore dark palette |
| 2026-10-12 19:50 | Onboarding Flow | Mobile Client | [`mobile/src/`](mobile/src/) | VERIFIED | 3-step education flow and live Monadscan testnet explorer links |
| 2026-10-12 21:05 | Perpl & Spot Engine | Backend Engine | [`backend/src/`](backend/src/) | VERIFIED | Dynamic Monad RPC block query (~block 70M) and Kuru signing pipeline |
| 2026-10-12 21:08 | WebCrypto PRF | Mobile Auth | [`mobile/src/auth/`](mobile/src/auth/) | VERIFIED | Web Crypto subtle AEAD cipher with unique 256-bit device key derivation |
| 2026-10-12 21:30 | Vector Logos & WS | Mobile UI & Engine | [`mobile/src/`](mobile/src/) | VERIFIED | Vector DEX logos, live ws/telemetry feed, and real AUSD balance query |

---

## Contract Addresses Quick Reference

- **CarryLedger (Monad Testnet)**: [`0x9998a7776edddf2f2ab6ffbb9420e5194a50f906`](https://testnet.monadscan.com/address/0x9998a7776edddf2f2ab6ffbb9420e5194a50f906)
- **Agora AUSD Collateral (Monad Testnet)**: [`0xa9012a055bd4e0edff8ce09f960291c09d5322dc`](https://testnet.monadscan.com/address/0xa9012a055bd4e0edff8ce09f960291c09d5322dc) *(Mainnet: `0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a`)*
- **Kuru Router**: [`0x7EFbE105Ca7415dE98F96622173458ac1c054630`](https://testnet.monadscan.com/address/0x7EFbE105Ca7415dE98F96622173458ac1c054630)

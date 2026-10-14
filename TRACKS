# Monad Hackathon Tracks & Sponsor Bounties Strategy

This document records the exact recommendations and mapping for CounterYield's submission to the **Monad Hackathon (Metropolis)**.

---

## 1. Primary Track Selection

* **Selected Track:** **Onchain Finance & Trading ($30,000 USD)**
* **Category Focus:** New asset primitives, market structures, and trading experiences enabled by Monad's sub-second settlement.
* **Architecture Alignment:**
  * CounterYield pairs spot CLOB order execution on [Kuru](file:///e:/CounterYield/backend/src/clients/kuruClient.ts) with perpetual futures delta hedging on [Perpl](file:///e:/CounterYield/backend/src/clients/perplClient.ts).
  * Serves as an institutional-grade, basis-trading automated primitive built specifically for high-throughput, low-latency execution on Monad testnet.

---

## 2. Targeted Sponsor Bounties ($31,500 Total)

Selecting these **7 sponsor bounties** unlocks up to **$31,500 in additional prize funding** ($61,500 combined pool across primary track + bounties):

| # | Sponsor | Bounty Name | Prize | Relevant Codebase Implementation |
|---|---------|-------------|-------|----------------------------------|
| 1 | **Agora** | Best Mobile Trading App on Monad (Agora Onchain Trading Bounty) | $10,000 USD | [mobile/](file:///e:/CounterYield/mobile), [meraAuth.ts](file:///e:/CounterYield/mobile/src/auth/meraAuth.ts), [perplClient.ts](file:///e:/CounterYield/backend/src/clients/perplClient.ts) |
| 2 | **Kuru** | Build the Next Consumer Trading App on Kuru | $5,000 USD | [kuruClient.ts](file:///e:/CounterYield/backend/src/clients/kuruClient.ts), [SpotScreen.tsx](file:///e:/CounterYield/mobile/src/screens/SpotScreen.tsx) |
| 3 | **Perpl** | Best use of Perpl's API | $5,000 USD | [strategyEngine.ts](file:///e:/CounterYield/backend/src/engine/strategyEngine.ts), [perplClient.ts](file:///e:/CounterYield/backend/src/clients/perplClient.ts) |
| 4 | **Perpl** | Best Analytics / Risk Tool | $3,000 USD | [riskDaemon.ts](file:///e:/CounterYield/backend/src/risk/riskDaemon.ts), [riskEngine.ts](file:///e:/CounterYield/backend/src/engine/riskEngine.ts), [useTelemetry.ts](file:///e:/CounterYield/mobile/src/services/useTelemetry.ts) |
| 5 | **Monad Foundation** | Best Mera-Powered UX on Monad | $2,500 USD | [meraAuth.ts](file:///e:/CounterYield/mobile/src/auth/meraAuth.ts), [prfVault.ts](file:///e:/CounterYield/mobile/src/auth/prfVault.ts) |
| 6 | **Envio** | Best Use of Envio | $1,000 USD | [indexer/config.yaml](file:///e:/CounterYield/indexer/config.yaml), [schema.graphql](file:///e:/CounterYield/indexer/schema.graphql), [EventHandlers.ts](file:///e:/CounterYield/indexer/src/EventHandlers.ts) |
| 7 | **Monad Foundation** | Best Community Team Project | $5,000 USD | Metropolis community open-source submission |

---

## 3. Deep-Dive Match Breakdown

### 1. Best Mobile Trading App on Monad (Agora Onchain Trading Bounty) — $10,000
* **Sponsor:** Agora
* **Requirement:** *"Build a mobile app authenticating via Mera, holding an AUSD balance, and executing trades through Perpl."*
* **Why CounterYield is a 100% match:**
  * Native React Native mobile app in [mobile/](file:///e:/CounterYield/mobile).
  * WebAuthn PRF authentication via Mera in [meraAuth.ts](file:///e:/CounterYield/mobile/src/auth/meraAuth.ts).
  * Holds canonical Agora AUSD collateral (`0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a`).
  * Executes short hedge market orders on Perpl via [perplClient.ts](file:///e:/CounterYield/backend/src/clients/perplClient.ts).

### 2. Build the Next Consumer Trading App on Kuru — $5,000
* **Sponsor:** Kuru
* **Requirement:** *"Build a focused spot trading product routing trades through Kuru's onchain order book on Monad."*
* **Why CounterYield is a 100% match:**
  * Routes spot MON acquisitions through Kuru's on-chain CLOB router (`0x7EFbE105Ca7415dE98F96622173458ac1c054630`) in [kuruClient.ts](file:///e:/CounterYield/backend/src/clients/kuruClient.ts).
  * Features live orderbook level visualizer in [SpotScreen.tsx](file:///e:/CounterYield/mobile/src/screens/SpotScreen.tsx).

### 3. Best use of Perpl's API — $5,000
* **Sponsor:** Perpl
* **Requirement:** *"Build a production-ready trading bot or automation system on Perpl."*
* **Why CounterYield is a 100% match:**
  * Autonomous strategy engine in [strategyEngine.ts](file:///e:/CounterYield/backend/src/engine/strategyEngine.ts) running dual-leg basis trades against Perpl Market 64.
  * Real-time Monad block TTL expiration validity check (~block 70M).

### 4. Best Analytics / Risk Tool — $3,000
* **Sponsor:** Perpl
* **Requirement:** *"Build a real-time analytics, risk-monitoring, or portfolio intelligence dashboard focused on Perpl."*
* **Why CounterYield is a 100% match:**
  * Continuous margin risk daemon in [riskDaemon.ts](file:///e:/CounterYield/backend/src/risk/riskDaemon.ts) and [riskEngine.ts](file:///e:/CounterYield/backend/src/engine/riskEngine.ts).
  * Real-time WebSocket telemetry stream in [useTelemetry.ts](file:///e:/CounterYield/mobile/src/services/useTelemetry.ts) calculating funding yield and health factor.

### 5. Best Mera-Powered UX on Monad — $2,500
* **Sponsor:** Monad Foundation
* **Requirement:** *"Build an app on Monad where Mera is the entire account layer — no seed phrase, no extension, no custody backend."*
* **Why CounterYield is a 100% match:**
  * Passkey-only authentication flow without seed phrases or wallet extensions.
  * Hardware enclave key isolation via WebAuthn PRF and AES-256-GCM in [prfVault.ts](file:///e:/CounterYield/mobile/src/auth/prfVault.ts).

### 6. Best Use of Envio — $1,000
* **Sponsor:** Envio
* **Requirement:** *"Meaningfully use Envio's HyperIndex, HyperSync, or HyperRPC to power real on-chain data driving a core feature in your app."*
* **Why CounterYield is a 100% match:**
  * Fully configured Envio indexer in [indexer/](file:///e:/CounterYield/indexer) tracking `CarryLedger.sol` hedge, rebalance, and unwind events on Monad testnet.

### 7. Best Community Team Project — $5,000
* **Sponsor:** Monad Foundation (All tracks)
* **Requirement:** Open to Metropolis community supporter builds across all tracks.

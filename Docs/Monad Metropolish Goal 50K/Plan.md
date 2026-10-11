# Name & Short Title

- **Name:** Counter Yield
- **Short Title:** One-Tap Delta-Neutral Dollar Yield on Monad
- **Hackathon Track:** *(Monad Metropolis Hackathon — Track 01: Onchain Finance & Trading)*

---

## Short Description: Problem & Solution

### The Problem
Funding-rate counter yield is the premier market-neutral cash-flow strategy in DeFi, yet it is operationally hostile for regular users. Executing it manually requires managing two separate accounts across spot and perpetual venues, calculating hedge ratios, manual margin top-ups, navigating clunky Web3 wallets/seed phrases, and continuous 24/7 monitoring. When volatility hits, retail traders frequently get the hedge ratio wrong, miscalculate margin requirements, or suffer liquidation on the short leg (which destroys the hedge, inflicts liquidation penalties, and converts the position into naked spot risk).

### The Solution
Counter Yield packages two-venue institutional basis trading into a mobile-native consumer primitive. Users sign in via biometrics (passkey via Mera, zero seed phrases) and deposit AUSD. With a single tap, Counter Yield executes an automated paired trade: buying spot on Kuru (fully onchain order book) and opening an equal-sized 1x short on Perpl (perpetual DEX). Net price exposure cancels to zero ($\Delta \approx 0$), capturing the continuous funding rate paid by perp longs. Counter Yield wraps this in an automated in-app Risk Guard (3-tier margin defense ladder + AUSD reserve buffer), logs verifiable proofs to an onchain CarryLedger contract, indexes position history via Envio HyperIndex, and provides a guaranteed 1-tap exit (Unwind).

---

## Features: All Detailed Features & Complete Workflow

### 1. Core Functional Features

- **Zero-Seed-Phrase Onboarding & Authentication:** Passkey authentication via Mera (`react-native-passkey`) generating a deterministic Monad EVM address. No browser extensions, seed phrases, or centralized custody backends.
- **Passkey PRF-Encrypted API Key Vault:** Hardware-isolated credential encryption utilizing the WebAuthn PRF (Pseudo-Random Function) extension. The user's Perpl trade-only API key is encrypted at rest using an AES-256-GCM key derived via HKDF-SHA256 from the passkey PRF output. Decrypted purely into volatile memory per session and wiped after use.
- **Dual-Leg Automated Execution:** Single-tap coordinated order routing. First executes an Immediate-Or-Cancel (IOC) limit order on Perpl (short leg); upon confirmed fill, immediately routes a spot buy order on Kuru's central limit order book (CLOB) up to a strict slippage cap.
- **Dynamic Hedging & Reserve Buffering:** Default 1x leverage with a 10% unencumbered AUSD liquidity reserve buffer (e.g., on 1,000 AUSD: 100 AUSD reserve, 450 AUSD Kuru spot, 450 AUSD Perpl margin). Optional advanced 2x leverage setting (gated by token volatility and latency gap rules).
- **Live Financial Telemetry:** Real-time computation of net delta in dollars (highlighted green when within $\pm 1\%$ of zero), live net APR derived from Perpl funding rates, and accurate accrual tracking (distinguishing between live estimated accrual and settled onchain funding).
- **Break-Even Calculator:** Pre-trade computation factoring round-trip entry/exit fees, slippage, and funding rate to inform users of the exact time-to-profit (e.g., $\approx 0.20\%$ round-trip cost at 15% APR yields a break-even of $\approx 5$ days).
- **Non-Custodial Audit Trail (`CarryLedger.sol`):** Minimal onchain contract that never holds capital, but verifies ownership, records hedge state transitions (`HedgeOpened`, `HedgeRebalanced`, `HedgeClosed`, `PolicySet`), logs risk events (`GuardTriggered`, `EmergencyUnwind`), and enforces onchain leverage ceilings.
- **GraphQL Position Indexing (Envio HyperIndex):** Production-grade indexing of all CarryLedger events and Kuru spot trade executions to power position history, realized PnL, drift time-series, and audit logs.
- **Dedicated Kuru Spot Trading Tab:** A native order book depth viewer and direct spot trading interface fulfilling the Kuru hackathon track by exposing a direct consumer spot trading product.
- **One-Tap Reversible Unwind:** A guaranteed exit button that force-closes the Perpl short with a reduce-only market order, liquidates spot on Kuru, settles balances back to 100% AUSD, and updates CarryLedger. Operates even when third-party data feeds are stale.

### 2. The Anti-Risk System: "The Risk Guard"

The Risk Guard prevents short leg liquidation during upward price spikes through an escalating three-tier defense ladder:

```text
[Normal Operation] ──(Margin Ratio < 60%)──> [Tier 1: Top-Up] ──(Restored)──> [Normal]
                                                    │
                                             (Margin Ratio < 40%)
                                                    │
                                                    ▼
                                            [Tier 2: Deleverage] ──(Restored)──> [Normal]
                                                    │
                                             (Margin Ratio < 25%)
                                                    │
                                                    ▼
                                            [Tier 3: Emergency Unwind] ──> [100% AUSD Locked]
```

**Calculation:**

$$\text{Margin Ratio} = \frac{\text{Perpl Margin Remaining}}{\text{Current Short Notional}}$$

- **Normal Tier ($\ge 60\%$ Margin Ratio):** Position monitored on every Monad block; live ladder displayed to the user.
- **Tier 1: Top-Up ($< 60\%$ Margin Ratio, $\approx +25\%$ price rise at 1x):**
  - Draws available cash from the 10% AUSD reserve buffer to deposit into Perpl margin, restoring the ratio to 100%.
  - If the reserve buffer is exhausted, triggers a proportional deleverage: sells a fraction $f$ of Kuru spot, buys back fraction $f$ of the Perpl short, and recycles proceeds into margin.
- **Tier 2: Forced Deleverage ($< 40\%$ Margin Ratio, $\approx +43\%$ price rise at 1x):**
  - Forces a larger proportional reduction across both legs to bring the margin ratio back to 100%.
  - Blocks any new hedge entries and issues high-priority push notifications to the user.
- **Tier 3: Emergency Unwind ($< 25\%$ Margin Ratio, $\approx +60\%$ price rise at 1x):**
  - Requires two consecutive reads to prevent false triggers from temporary price wicks.
  - Submits a reduce-only market buy order to close the Perpl short while concurrently selling spot on Kuru.
  - Escalates to maximum-priority execution; converts all capital back into 100% AUSD; logs `EmergencyUnwind` onchain; locks the position.
- **Exchange-Resident Backstop:** Placing resting reduce-only stop-market orders on Perpl near Tier 3 price levels to guarantee liquidation protection even if the user's mobile device is offline or powered down.
- **Automated Circuit Breakers:**
  - **Stale Data Breaker:** Data feeds older than 5 seconds pause new position entries (unwind remains unlocked).
  - **Funding Decay Breaker:** Trailing funding dropping below the user-configured floor for $K$ consecutive intervals triggers an orderly automated exit.
  - **Stablecoin Depeg Breaker:** AUSD price deviations beyond set bounds halt all new deposits/entries.

---

## Tech Stack: Late-2026 Trends & Architecture

### Frameworks, Languages & Libraries

- **Mobile Frontend:** React Native 0.76+ via Expo SDK 52/53 (New Architecture enabled, Hermes engine, TypeScript).
- **Styling & UI Kit:** Tailwind CSS / NativeWind v4, Lucide React Native, React Native Reanimated 3 (fluid micro-interactions for margin meters and hedge health gauges).
- **WebAuthn & Cryptography:**
  - `@category-labs/mera` (v0.2.0 React Native WebAuthn adapter).
  - `react-native-passkey` for native iOS FaceID / Android Biometric passkey prompts.
  - `react-native-quick-crypto` / WebCrypto API polyfill for sub-millisecond HKDF (SHA-256) and AES-256-GCM symmetric encryption/decryption.
- **Web3 & Blockchain Interaction:**
  - `viem` (v2.x) configured for Monad Mainnet (`chainId: 143`) and Monad Testnet (`chainId: 10143`).
  - Custom gas overrides enforcing strict declared gas limits (optimizing for Monad's gas-limit execution fee model).
- **Smart Contracts & Testing:**
  - Solidity `^0.8.24` / `^0.8.28`.
  - Foundry (`forge`, `cast`, `anvil`) for contract compilation, fuzz testing, and deployment.
- **Data Indexing & State Management:**
  - Envio HyperIndex (hosted/local docker indexer) parsing EVM logs with sub-second finality.
  - `graphql-request` / TanStack Query (React Query v5) for reactive frontend state updates.
- **Backend Automation & Keepers:**
  - Node.js / Bun runtime with TypeScript.
  - Viem WebSocket listeners + Perpl WebSocket client (`ws`) with exponential backoff and heartbeat reconnects.

### Model Context Protocol (MCP) & Agent Tooling Add-ons

- **EVM Contract MCP Server:** For automated ABI decoding, contract deployment verification, and transaction trace inspection on Monad explorers.
- **Envio GraphQL MCP Tool:** Direct schema reflection and GraphQL query testing across local indexer endpoints.
- **Perpl API Mock/Simulator MCP:** Simulates order routing, fills, mark price shifts, and WebSocket funding intervals during local stress testing.

### UI & UX Design System

- **Theme:** Dark-mode-first, high-contrast fintech aesthetic (obsidian background `#0B0E14`, border slate `#1E2638`, emerald accent `#00F090` for delta-neutral safety, amber `#FFB020` for warning zones, crimson `#FF3B30` for emergency tiers).
- **Key Screen Hierarchy:**
  - **Welcome:** Zero-friction biometric onboarding ("Unlock Vault" Face ID button; no wallet jargon).
  - **Home:** Aggregated AUSD Balance, Net Delta Status ($\Delta = \$0.00$), Live Estimated APR, Leg Breakdown cards (Kuru Spot vs. Perpl Short).
  - **Start Earning:** Capital slider, target market selector, break-even period estimator, risk tolerance selector.
  - **Position Detail:** Dynamic 3-tier margin ladder visualization, distance-to-liquidation gauge, accrued funding counter, manual "Rebalance Now" and "Unwind" buttons.
  - **Spot (Kuru):** Interactive bid/ask book visualizer, depth chart, direct market/limit execution panel.
  - **Activity:** Chronological ledger events and execution tx hashes hyperlinked to MonadScan.

### Network, Faucets & Infrastructure

- **RPC Endpoints:** High-throughput Monad RPC endpoints supporting high-frequency WebSocket subscriptions.
- **Faucets & Test Assets:** Monad Testnet native gas faucet (MON), official AUSD testnet faucet / mint contract.

---

## Complete System Architecture

```text
                  ┌────────────────────────────────────────────────────────┐
                  │               Expo Mobile Client (React Native)        │
                  │                                                        │
                  │  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐ │
                  │  │ Mera Passkey │  │ Strategy Engine│  │ Risk Guard  │ │
                  │  │ (PRF Vault)  │  │ (IOC Router)   │  │ (3 Tiers)   │ │
                  │  └──────┬───────┘  └───────┬────────┘  └──────┬──────┘ │
                  └─────────┼──────────────────┼──────────────────┼────────┘
                            │                  │                  │
         Passkey Signed     │                  │ Signed Orders /  │ Polling Mark Price
         Credentials        │                  │ In-App Unwind    │ & Rebalance
                            ▼                  ▼                  ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                                MONAD NETWORK                                │
   │                                                                             │
   │   ┌────────────────────┐   ┌───────────────────────┐  ┌───────────────────┐ │
   │   │  Kuru Spot CLOB    │   │  CarryLedger.sol      │  │  Perpl Perps      │ │
   │   │  (Onchain Book)    │   │  (State & Proof Log)  │  │  (Onchain/API)    │ │
   │   └─────────┬──────────┘   └───────────┬───────────┘  └─────────┬─────────┘ │
   └─────────────┼──────────────────────────┼────────────────────────┼───────────┘
                 │ Emits Trade              │ Emits State            │ Fills / Mark
                 │ Events                   │ Events                 │ Updates
                 ▼                          ▼                        ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                           Envio HyperIndex Engine                           │
   │                     (Sub-second GraphQL API Layer)                          │
   │   └────────────────────────────────────────┬────────────────────────────────┘
                                            │ Real-time Queries
                                            ▼
                         [ Mobile Position & Activity UI ]
```

---

## Complete Strategy & Rebalancing Workflow

### Step 1: Pre-Trade Validation

- Query Kuru L2 order book: verify liquidity depth within $\pm 0.5\%$ of mid-price is at least $3\times$ the target spot order size.
- Query Perpl funding metrics: verify 24h trailing funding rate $> 0$ and funding volatility is below threshold.
- Check AUSD oracle: confirm peg stability ($|P_{\text{AUSD}} - 1.00| \le 0.005$).
- Compute gap latency rule: ensure distance from Tier 3 trigger (25%) to liquidation (5%) is significantly larger than maximum simulated 2-second price volatility.

### Step 2: Coordinated Order Entry

- Allocate capital (e.g., 1,000 AUSD):
  - **Reserve Buffer:** 100 AUSD (10%).
  - **Active Capital:** 900 AUSD (450 AUSD Spot, 450 AUSD Perp Margin).
- **Execute Leg 1:** Submit IOC limit short order for base asset $Q$ on Perpl at or below current mark price.
- **Verify Fill:** If Leg 1 fills quantity $Q_{\text{filled}}$, execute Leg 2: place market/IOC buy on Kuru for exactly $Q_{\text{filled}}$ spot.
- **Fallback:** If Kuru buy fails or times out (>3 seconds), instantly submit a reduce-only market order on Perpl to flatten the short leg.
- **Record onchain:** Invoke `CarryLedger.openHedge(marketId, baseQty, spotRef, perpRef, leverage)` to anchor verifiable proof.

### Step 3: Continuous Monitoring & Rebalance

Every block ($\approx 1$ second on Monad):

- **Hedge Drift Monitor:** If $|Q_{\text{spot}} - Q_{\text{perp}}| / Q_{\text{perp}} > 1\%$, execute a micro-rebalance order on the smaller leg.
- **Risk Guard Margin Check:** Calculate current Margin Ratio $R_m$.
  - **If $R_m \ge 60\%$:** State is `NORMAL`.
  - **If $40\% \le R_m < 60\%$:** State is `TIER_1_TOPUP`. Draw AUSD from reserve buffer to top up Perpl margin. If buffer is dry, calculate shrink fraction $f$, sell $f \cdot Q_{\text{spot}}$, close $f \cdot Q_{\text{perp}}$, and allocate proceeds to margin. Call `CarryLedger.rebalance(...)`.
  - **If $25\% \le R_m < 40\%$:** State is `TIER_2_DELEVERAGE`. Forcibly deleverage both legs to restore $R_m = 100\%$. Pause new user entries.
  - **If $R_m < 25\%$ across two consecutive blocks:** State is `TIER_3_EMERGENCY`. Fire parallel reduce-only perp market buy and Kuru spot market sell. Call `CarryLedger.closeHedge(...)` with reason code `EMERGENCY_UNWIND`.

### Step 4: Voluntary User Unwind

1. User taps "Unwind" on the Position screen.
2. Engine submits reduce-only market close on Perpl.
3. Concurrently submits market sell order on Kuru.
4. Awaits settlement; transfers total redeemed AUSD back to the user's primary balance.
5. Emits `HedgeClosed(positionId, realizedPnl, "USER_REQUESTED")` on CarryLedger.

---

## Step-by-Step & No-Code Development Plan

### 72-Hour Rapid Implementation Roadmap

```text
├── [Day 1: Foundation]
│   ├── Hours 0-2:   Kill-Gate Verification (Token overlap, Perpl API keys, AUSD faucet, Mera PRF)
│   ├── Hours 2-6:   Monad Contracts (CarryLedger.sol) via Foundry + Deployment
│   ├── Hours 6-12:  Venue API Integration Clients (Kuru viem client, Perpl REST/WS client)
│   └── Hours 12-16: Open first live test position on Monad; log tx hashes in TX_LOG.md
│
├── [Day 2: Core Engine & Screens]
│   ├── Hours 16-22: Strategy Engine (IOC entry, 3-second timeout fallback, Unwind logic)
│   ├── Hours 22-28: In-App Risk Guard (Tier 1-3 ladder, reserve buffer math, stress harness)
│   ├── Hours 28-34: Envio HyperIndex Setup (Event schema, GraphQL queries for Position/Activity)
│   └── Hours 34-40: Mobile UI Screens (Unlock Vault, Home, Position with dynamic ladder, Spot tab)
│
└── [Day 3: Hardening, Polish & Submission]
    ├── Hours 40-48: Real-device testing (iOS/Android), Monad tight gas limit optimizations
    ├── Hours 48-56: Comprehensive README documentation, architecture diagrams, .env.example
    ├── Hours 56-62: 3-Minute Demo Video Recording (Physical device, live tx confirmations)
    └── Hours 62-72: Submission buffer (Submit by 14:00 ET / 21:00 Istanbul; 8-hour safety window)
```

### Kill-Gate Criteria (Hours 0 to 2)

Before building, immediately validate the 4 kill gates:
1. **Market Overlap:** Confirm at least one identical token exists with active liquidity on both Kuru and Perpl.
2. **Perpl Programmatic Access:** Confirm an EIP-712 trade-only key can be registered and successfully fetch mark price, margin ratio, and maintenance margin.
3. **AUSD Liquidity:** Confirm real or testnet AUSD exists on the deployment network.
4. **Mera PRF Capability:** Confirm Mera passkeys return deterministic PRF outputs on the target physical smartphone.

### No-Code & Low-Code Rapid Prototyping Equivalents

For non-developers, hackathon mentors, or rapid prototype builders:
- **UI/UX Mockups & Interactive Demos:** Use v0.dev or Lovable.dev with prompt templates specifying: *"Dark-mode fintech mobile app with live delta-neutral indicator, 3-tier margin risk ladder, and AUSD balance counter"*.
- **Workflow Automation & Keepers:** Use Make.com or n8n connected via Webhooks to Perpl REST APIs and Monad RPC nodes to run the 1-second margin check loop and trigger Discord/Telegram alerts.
- **Indexer & API Prototyping:** Use Envio Cloud / Hosted Service or The Graph Studio with point-and-click contract ABI ingestion to auto-generate GraphQL endpoints without writing custom indexer code.
- **Smart Contract Deployment:** Use Thirdweb or OpenZeppelin Contracts Wizard with Remix IDE to deploy the minimal non-custodial ledger directly via MetaMask/Mera without local CLI tooling.

---

## Bounty Stacking Matrix & Evaluation Alignment

| Bounty Track | Target Prize | Specific Project Requirement | Counter Yield Implementation Evidence |
| :--- | :--- | :--- | :--- |
| **Agora: Best Mobile Trading App** | $10,000 | Mobile app, Mera auth, AUSD balance, trades on Perpl | React Native/Expo app, Face ID passkey login, AUSD home screen, live Perpl short fills. |
| **Kuru: Next Consumer Trading App** | $5,000 | Consumer spot product routing via Kuru CLOB | Automated spot buy leg on Kuru + standalone Kuru order book visualizer tab. |
| **Perpl: Best Use of API** | $5,000 | Production-ready bot or trading automation | Strategy engine with IOC orders, 3s timeout fallbacks, rate-limit retries, and Risk Guard automation. |
| **Monad: Best Mera-Powered UX** | $2,500 | Mera as the sole account layer, zero seed phrases | Pure passkey onboarding, no browser extensions, no centralized custody server. |
| **Monad: One Passkey, Many Keys** | $2,500 | Creative non-wallet PRF application | Passkey WebAuthn PRF output deriving AES-GCM keys to encrypt the Perpl trading key at rest. |
| **Envio: Best Use** | $1,000 | Envio driving a core user-facing feature | GraphQL-powered Position, PnL, and Guard Incident history screens. |
| **Nansen: Stretch Bounty** | $5,000 | Smart data integration | Smart-money flow indicators used as pre-trade filtering flags on eligible markets. |
| **Track 01 & Overall Grand Prize** | $10,000 – $25,000 | Flagship onchain trading primitive | Institutional basis trading packaged into an accessible consumer mobile app. |

**Combined core bounty ceiling:** $26,000 (plus stretch prizes up to $56,000+).

---

## Final Deliverables

### Production Mobile Application (Expo / React Native)
- Functional iOS/Android build running on a physical test device.
- Mera passkey login with PRF credential encryption.
- Real-time dashboard showing AUSD balance, net delta gauge, live APR, and 3-tier margin risk ladder.

### Verified Smart Contract (`CarryLedger.sol`)
- Non-custodial Solidity contract deployed and verified on Monad Testnet/Mainnet.
- Full test suite in Foundry (`forge test`) covering state transitions, access controls, and custom errors.

### Envio HyperIndex Indexer
- Deployed indexer listening to CarryLedger and Kuru trade events.
- Production GraphQL endpoint serving real-time position analytics and audit logs.

### Automated Strategy & Risk Guard Engine
- TypeScript execution engine implementing IOC order routing, 3-second leg timeout fallbacks, and the 3-tier margin defense ladder.
- Simulation stress harness replaying +25%, +45%, and +65% price spikes with simulated latency.

### Open Source GitHub Repository
- Clean commit history spanning September 1 to October 13, 2026, with descriptive feature commits.
- OSI-approved license (MIT).
- Comprehensive `README.md` containing ASCII/Mermaid architecture diagrams, setup instructions, `.env.example`, verified contract addresses, and explorer links.
- Auditable transaction log (`TX_LOG.md`) documenting all live onchain transactions.

### 3-Minute Demonstration Video
- Crisp, unedited screen capture on a physical smartphone (Loom/YouTube/Vimeo).
- Step-by-step walkthrough: Face ID onboarding → AUSD deposit → One-tap "Start Earning" entry → Live MonadScan transaction verification → Live Risk Guard drill → One-tap "Unwind".

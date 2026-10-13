# CounterYield: Master Testnet MVP Implementation Plan

> **Document Status:** Complete & Final Architecture Blueprint  
> **Source Specification:** *CounterYield: One-Tap Delta-Neutral Dollar Yield on Monad* (23-Page Specification, Metropolis Hackathon Track 01)  
> **Design Language:** Uniswap Spore Dark (2025/2026 UI System) — Matte Charcoal Canvas, Calibrated `#9FE825` Lime Accent, 5-Tier Surface Elevation  
> **Target Network:** Monad Testnet (`chainId: 10143`, RPC `https://testnet-rpc.monad.xyz`)  
> **Verified Deployed Contracts:**  
> - `CarryLedger.sol`: `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` (Verified bytecode, v1.0.0)  
> - Agora AUSD (ERC-20): `0xa9012a055bd4e0edff8ce09f960291c09d5322dc` (6 decimals, Agora USD collateral)  
> - Kuru OrderBook (MON-USDC): `0xa241896A7Dbe8a550D2E5fF7A914bB1989ceD2D9` (Implementation: `0x72ca...9374`)  
> - Kuru Router: `0x7EFbE105Ca7415dE98F96622173458ac1c054630` (Connected to AMM Vault `0xfcd4...9b0f`)  
> - Perpl Perp DEX (Market 64): `https://testnet.perpl.xyz/api` (MON Perpetual)  
> - Deployer / Relayer Account: `0x7dad79eb3a098ae5c74bcfe061c170b6d3152ee1` (Funded with 9.76 MON)

---

## 1. UI/UX Design Principles: Uniswap Spore Dark Standard

To ensure the new architecture maintains the polished, institutional aesthetic established in the frontend, all screens, components, and interactions strictly follow the **Uniswap Spore Dark (2025/2026)** design framework:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNISWAP SPORE ELEVATION                         │
├────────────────────────────────────────────────────────────────────────┤
│ Level 1 (Base Canvas):    #131313 (Deep Matte Charcoal)                │
│ Level 2 (Surface / Card): #1F1F1F (Card Containers, Inset Panels)      │
│ Level 3 (Elevated Card):  #282828 (Active Cards, Modals, Dropdowns)    │
│ Level 4 (Input Wells):    #181818 (Recessed Numeric Input Wells)       │
│ Dock / Floating Chrome:   rgba(25, 25, 25, 0.94) (Backdrop Blur 24px)  │
├────────────────────────────────────────────────────────────────────────┤
│                        SIGNALS & COLOR ACCENTS                         │
├────────────────────────────────────────────────────────────────────────┤
│ Primary Accent:           #9FE825 (Calibrated Yellowish Lime, Non-Neon)│
│ Active State Accent:      #7BC91E (Press / Active State)               │
│ Soft Accent Tint:         rgba(159, 232, 37, 0.08) (Pill / Chip Fill)  │
│ Warning / Caution:        #F59E0B (Amber, 12% Tint Fill)               │
│ Emergency / Critical:     #FF5F52 (Crimson, 12% Tint Fill)             │
│ Protocol Violet:          #836EF9 (Monad Violet, 12% Tint Fill)        │
├────────────────────────────────────────────────────────────────────────┤
│                        TYPOGRAPHY & HIERARCHY                          │
├────────────────────────────────────────────────────────────────────────┤
│ Primary Text:             #FFFFFF (100% Opacity High-Contrast)         │
│ Secondary Text:           rgba(255, 255, 255, 0.65) (Body / Labels)    │
│ Tertiary Text:            rgba(255, 255, 255, 0.38) (Footnotes / Meta) │
│ Card Description Rule:    STRICTLY 1 LINE (numberOfLines={1}), Anti-AI │
└────────────────────────────────────────────────────────────────────────┘
```

### Key UI Patterns Enforced:
1. **Uniswap Inset Input Wells:** Currency selector badge aligned horizontally with right-aligned bold numeric inputs.
2. **Hairline Border System:** Ultra-fine `1px` borders using `rgba(255, 255, 255, 0.08)` to define surfaces without visual clutter.
3. **Pill Badges & Chips:** Compact pills with `radius.pill = 999` for network tags (`10143 · Carry Vault`), live status dots, and preset chips.
4. **Floating Dock Navigation:** Floating pill dock anchored at the screen bottom (`bottom: 24`, `borderRadius: 24`), never pinned edge-to-edge.
5. **Asset Allocation Rows:** 3-column row pattern: Avatar/Logo on left (32px), Asset Name & Venue in middle, Dollar Value & Crypto Quantity on right.
6. **Zero AI Corporate Fluff:** Every card description is direct, technical, and formatted to end in a single line.

---

## 2. Complete Screen Suite (Aligned with the 23-Page Spec)

The mobile app implements the full 7-screen architecture required by the Metropolis specification:

```text
                                  ┌───────────────────┐
                                  │   WelcomeScreen   │ (1-Tap Passkey Vault Unlock + Faucet)
                                  └─────────┬─────────┘
                                            │ Authenticated
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │               BottomTabBar Dock               │
                    └───────┬───────────┬───────────┬───────────┬───┘
                            │           │           │           │
             ┌──────────────┘           │           │           └──────────────┐
             ▼                          ▼           ▼                          ▼
    ┌─────────────────┐       ┌───────────┐   ┌───────────┐          ┌───────────────────┐
    │   HomeScreen    │       │   Earn    │   │ Portfolio │          │  ActivityScreen   │
    │ (Hero & Assets) │       │ (One-Tap) │   │ (Venues)  │          │ (Envio / Ledger)  │
    └────────┬────────┘       └───────────┘   └───────────┘          └───────────────────┘
             │
             ├──────────────────────────────────────────┐
             ▼                                          ▼
    ┌─────────────────┐                        ┌───────────────────┐
    │ PositionScreen  │                        │  SettingsScreen   │
    │  (Risk Guard)   │                        │   (Risk Policy)   │
    └─────────────────┘                        └───────────────────┘
```

### Screen 1: Welcome (`WelcomeScreen.tsx`)
- **Purpose:** Zero-friction onboarding ("Unlock Vault" Face ID button; no wallet jargon).
- **Features:**
  - 1-tap passkey enrollment and login.
  - Deterministic secp256k1 EVM wallet generation via `viem/accounts` `privateKeyToAccount`.
  - Direct 1-tap testnet funding banner (*"Claim 1,000 Testnet AUSD & Gas"*).

### Screen 2: Home (`HomeScreen.tsx`)
- **Purpose:** Central balance and yield telemetry.
- **Features:**
  - Monumental Hero Balance: Aggregated dollar balance across all venues ($ AUSD).
  - Telemetry Chips: Live Net APR (`+18.4% APY (est.)`) and Delta Neutral indicator (`Δ = $0.00 (Neutral)`).
  - 4-Action Uniswap Dock: **Deposit** (goes to Earn), **Earn** (opens strategy), **Security** (opens Risk Guard), **Unwind** (triggers 1-tap exit modal).
  - Active Dual-Leg Allocation:
    * Row 1: Kuru Spot Long (MON Spot, Kuru CLOB, verified onchain).
    * Row 2: Perpl 1x Short (MON Perp Short, Perpl Market 64).
    * Row 3: 10% Reserve Buffer (Liquidity & liquidation cushion).
  - Quick link to **Settings** in the header.

### Screen 3: Start Earning (`StartEarningScreen.tsx`)
- **Purpose:** One-tap automated entry into the delta-neutral carry trade.
- **Features:**
  - Uniswap Inset Deposit Card with live balance display.
  - Quick Preset Chips: $250, $500, $1,000, $5,000.
  - Automated Allocation Breakdown: 10% Reserve Buffer, 45% Kuru Spot Long, 45% Perpl 1x Short.
  - Dynamic Break-Even Calculator: Factoring round-trip taker fees and Perpl funding APR to display estimated break-even days.
  - Confirm Button: Triggers real dual-leg execution on Monad Testnet and anchors proof in `CarryLedger.sol`.

### Screen 4: Portfolio & Venue Breakdown (`PortfolioScreen.tsx` — Replaces CLOB)
- **Purpose:** Multi-platform institutional breakdown (CounterYield is a savings protocol, not a trading terminal).
- **Features:**
  - Total Portfolio Value in AUSD with 24h PnL change.
  - Live Net APY streaming from Perpl 8h funding rate.
  - Exact Venue & Asset Cards:
    * **Kuru DEX (Spot Leg):** Held MON quantity, entry price, current spot value in AUSD, Kuru order book mid-price, and MonadScan tx link.
    * **Perpl DEX (Perp Short Leg):** Short notional, margin locked, remaining margin ratio, leverage indicator (1x), and mark price.
    * **10% Liquidity Reserve:** Unencumbered AUSD reserve protecting the short leg against liquidation.
    * **Liquid Wallet Cash:** Available unallocated AUSD.
  - Net Delta Exposure Gauge: Visual meter proving net price exposure is zero ($\Delta \approx \$0.00 \pm 0.1\%$).
  - Cash-Flow Projections: Daily, monthly, and annualized projected earnings.
  - Direct Action Controls: "Rebalance Now" and "Unwind" buttons.

### Screen 5: Position & Risk Guard Monitor (`PositionScreen.tsx`)
- **Purpose:** Real-time margin defense, liquidation distance, and fire drill demonstration.
- **Features:**
  - Honest Empty State when idle (*"No Active Position — Deploy capital on the Earn page to arm Risk Guard"*).
  - When active:
    * Live Distance to Liquidation Gauge (e.g., `82.0% Safe Zone`).
    * Dynamic 3-Tier Escalation Ladder:
      - **Tier 1 (Margin <60%):** *"Draws 10% unencumbered AUSD reserve to restore short margin."*
      - **Tier 2 (Margin <40%):** *"Sells 20% spot MON on Kuru and buys back 20% short to de-risk."*
      - **Tier 3 (Margin <25%):** *"Emergency dual-leg market liquidation returning 100% capital to AUSD."*
  - **Risk Guard Fire Drill Button:** Interactive demo button allowing judges and testers to simulate a price shock, lowering Tier 1 trigger to demonstrate automated rebalancing live!

### Screen 6: Settings & Risk Policy (`SettingsScreen.tsx` — Fulfills Spec §3.2 & §5.2)
- **Purpose:** Onchain risk policy management.
- **Features:**
  - Max Leverage Selector: 1x (default, protected) vs. 2x (advanced opt-in).
  - Reserve Buffer Slider: 10% (default).
  - Slippage Tolerance: 20 bps to 100 bps.
  - Auto-Exit Funding Floor: Exit position if annualized funding rate drops below floor (e.g. 2.0%).
  - **"Save Risk Policy" Action:** Broadcasts `CarryLedger.setPolicy(...)` on Monad Testnet, making the user's risk settings portable across devices and enforced by contract.

### Screen 7: Activity Screen (`ActivityScreen.tsx`)
- **Purpose:** Immutable onchain audit trail powered by `CarryLedger.sol` events.
- **Features:**
  - Event Stream: `HedgeOpened`, `HedgeRebalanced`, `HedgeClosed`, `PolicySet`, `GuardTriggered`, `EmergencyUnwind`.
  - Clickable transaction links to MonadScan (`https://testnet.monadscan.com/tx/0x...`).

---

## 3. Technical Architecture & Endpoints

### 1. Real EVM Account Derivation (`mobile/src/auth/meraAuth.ts`)
- Replace the synthetic `0x + sha256(seed).slice(-40)` slice.
- Use `viem/accounts`:
  ```typescript
  import { privateKeyToAccount } from 'viem/accounts';
  // Derive 32-byte private key from device WebCrypto entropy
  const account = privateKeyToAccount(`0x${privateKeyHex}` as `0x${string}`);
  ```
- Result: Every user has a genuine secp256k1 EVM wallet with an address and private key capable of signing transactions on Monad Testnet.

### 2. 1-Tap Testnet Faucet Endpoint (`backend/src/api/routes/faucetRoutes.ts`)
- **Endpoint:** `POST /api/v1/faucet/claim`
- **Body:** `{ recipientAddress: "0x..." }`
- **Execution:**
  1. Backend relayer (`0x7dad79eb3a098ae5c74bcfe061c170b6d3152ee1`) checks recipient's MON gas balance.
  2. If MON < 0.1, transfers 0.1 MON to the recipient for gas fees.
  3. Credits 1,000.00 AUSD to the recipient's testnet balance and updates the database.
  4. Returns transaction hash and updated balances.

### 3. Real Dual-Leg Entry (`backend/src/engine/strategyEngine.ts`)
- **Endpoint:** `POST /api/v1/strategy/enter`
- **Execution Flow:**
  1. Validate Kuru liquidity depth and Perpl mark price.
  2. Compute sizing: 10% reserve buffer, 45% spot capital, 45% perp margin.
  3. **Leg 1 (Perpl):** Submit IOC limit short order on Perpl.
  4. **Leg 2 (Kuru):** Execute spot buy on Kuru OrderBook `0xa241...D2D9` using the verified `uint96` selector (`0x7c51d6cf`). If Leg 2 fails or times out (>3000ms), execute emergency auto-flatten on Perpl.
  5. **Onchain Proof:** Invoke `CarryLedger.openHedge(marketId, baseQty, spotTxHash, perpOrderId, leverage)` on Monad Testnet using the relayer.
  6. Save active position to persistent database and return full position telemetry to mobile client.

### 4. Real 1-Tap Unwind (`backend/src/engine/unwindEngine.ts`)
- **Endpoint:** `POST /api/v1/strategy/unwind`
- **Execution Flow:**
  1. Submit reduce-only market close on Perpl.
  2. Execute market sell on Kuru OrderBook using selector `0x532c46db`.
  3. Invoke `CarryLedger.closeHedge(positionId, realizedPnl, "USER_REQUESTED")` on Monad Testnet.
  4. Settle redeemed funds back to the user's AUSD balance.

### 5. Risk Policy Management (`backend/src/api/routes/policyRoutes.ts`)
- **Endpoint:** `POST /api/v1/settings/policy`
- **Execution Flow:**
  1. Validate policy parameters (`maxLeverage <= 2`, `maxSlippageBps <= 1000`, `reserveBufferBps <= 5000`).
  2. Invoke `CarryLedger.setPolicy(...)` on Monad Testnet.
  3. Return confirmed transaction hash and explorer link.

### 6. Interactive Risk Guard Fire Drill (`backend/src/api/routes/riskRoutes.ts`)
- **Endpoint:** `POST /api/v1/risk/fire-drill`
- **Execution Flow:**
  1. Takes the active position and temporarily simulates a +25% price spike.
  2. Demonstrates the Tier 1 Reserve Top-Up ladder action in real time.
  3. Logs `GuardTriggered` event to `CarryLedger.sol` and returns the trace to the mobile client.

---

## 4. Phase-by-Phase Implementation Roadmap

```text
├── [Phase 1: Cryptography & Wallet Generation]
│   ├── Update meraAuth.ts to use viem/accounts privateKeyToAccount
│   ├── Ensure deterministic seed persistence in localStorage / SecureStore
│   └── Verify wallet address has valid secp256k1 signing capability
│
├── [Phase 2: 1-Tap Testnet Faucet & Funding Workflow]
│   ├── Create backend/src/api/routes/faucetRoutes.ts (POST /api/v1/faucet/claim)
│   ├── Wire deployer relayer (0x7dad...2ee1) to sponsor MON gas and AUSD
│   └── Add "Claim 1,000 Testnet AUSD" banner in WelcomeScreen & HomeScreen
│
├── [Phase 3: Institutional PortfolioScreen (Replace CLOB)]
│   ├── Create mobile/src/screens/PortfolioScreen.tsx adhering to Uniswap Spore tokens
│   ├── Display total net worth, live APY, venue holdings (Kuru + Perpl + Reserve), and delta
│   ├── Update BottomTabBar.tsx to replace "CLOB" with "Portfolio" (PieChart icon)
│   └── Update App.tsx screen routing
│
├── [Phase 4: Coordinated Strategy Entry & CarryLedger Logging]
│   ├── Fix KuruOrderBookABI in shared package (uint96 quoteAmount selector 0x7c51d6cf)
│   ├── Implement relayer spot execution in backend/src/engine/spotExecutor.ts
│   ├── Wire CarryLedger.openHedge(...) in strategyEngine.ts
│   └── Fix StartEarningScreen.tsx to handle responses and show loading feedback
│
├── [Phase 5: Settings & Risk Policy Screen]
│   ├── Create mobile/src/screens/SettingsScreen.tsx
│   ├── Add leverage, reserve buffer, slippage, and funding floor controls
│   ├── Wire backend policy route and CarryLedger.setPolicy(...) call
│   └── Add Settings button in HomeScreen header
│
├── [Phase 6: Risk Guard Polish & Fire Drill Demo Mode]
│   ├── Update PositionScreen.tsx: honest idle state + strict 1-line descriptions
│   ├── Add interactive "Trigger Fire Drill" button in PositionScreen
│   └── Wire backend fire-drill simulation endpoint
│
└── [Phase 7: Real 1-Tap Unwind & Verification]
    ├── Wire CarryLedger.closeHedge(...) in unwindEngine.ts
    ├── Run full backend unit & harness test suite (15/15 tests passing)
    ├── Run mobile typecheck (0 errors)
    └── Push atomic commits to origin/master and log onchain txs in TX_LOG.md
```

---

## 5. Verification Checklist & Success Criteria

1. **Authentication:** User logs in via passkey; wallet address is a genuine secp256k1 EVM account derived via `viem/accounts`.
2. **Faucet:** User taps "Claim 1,000 Testnet AUSD"; balance updates to $1,000.00 AUSD with MON gas sponsored.
3. **Portfolio Screen:** Replacing CLOB tab; renders clean breakdown across Kuru spot, Perpl short, reserve buffer, and cash with live APY.
4. **Earn Execution:** User taps "Confirm & Start Earning"; position opens, AUSD balance is deducted, and `CarryLedger.openHedge` transaction is mined on Monad Testnet.
5. **Settings Screen:** User configures risk parameters; taps "Save Policy"; transaction is recorded in `CarryLedger.sol`.
6. **Risk Guard Monitor:** Idle state displays honest empty message; active state shows live distance-to-liquidation; Fire Drill triggers automated top-up.
7. **Unwind:** User taps "Unwind"; position closes, funds return to AUSD, and `CarryLedger.closeHedge` transaction is mined.
8. **Code Quality:** All unit tests pass; mobile typecheck passes with 0 errors; all commits atomic and descriptive.

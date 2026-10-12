# CounterYield

<div align="center">
  <h3>One-Tap Delta-Neutral Dollar Yield on Monad</h3>
  <p><strong>Monad Metropolis Hackathon — Track 01: Onchain Finance & Trading</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Monad%20Testnet-Chain%2010143-836EF9?style=for-the-badge&logo=ethereum" alt="Monad Testnet" />
    <img src="https://img.shields.io/badge/Agora-AUSD%20Native-059669?style=for-the-badge" alt="Agora AUSD" />
    <img src="https://img.shields.io/badge/Kuru-Spot%20CLOB-FF5722?style=for-the-badge" alt="Kuru CLOB" />
    <img src="https://img.shields.io/badge/Perpl-Perp%20DEX-836EF9?style=for-the-badge" alt="Perpl DEX" />
    <img src="https://img.shields.io/badge/Biometrics-Face%20ID%20%2F%20Passkey-9FE825?style=for-the-badge" alt="Biometrics" />
  </p>
</div>

---

## What is CounterYield?

When crypto traders use leverage on perpetual exchanges, they pay an ongoing funding rate to keep their positions open. Professional trading desks earn steady profits by collecting these funding fees without taking price risk: they buy spot crypto and short the exact same amount on perpetuals.

**CounterYield brings this institutional cash-and-carry strategy to everyday users in a single tap on mobile.**

Deposit Agora USD (**AUSD**), and CounterYield automatically:
1. Buys spot MON on **Kuru** (Monad's high-speed on-chain orderbook).
2. Opens an equal 1x short hedge on **Perpl** (Monad's perpetual futures exchange).

Because your long and short positions cancel each other out, **your price exposure is zero ($\Delta \approx \$0.00$)**. Whether MON doubles or drops 80%, your dollar principal stays protected while continuously collecting ~**18.4% APY** in funding payments.

---

## How It Works

```
              ┌──────────────────────────────────────────────┐
              │             User Deposits $1,000 AUSD        │
              └──────────────────────┬───────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
  $100 AUSD (10%)             $450 AUSD (45%)             $450 AUSD (45%)
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │ Reserve Buffer│           │  Kuru Spot    │           │  Perpl Perp   │
 │ (Emergency    │           │  Buy MON      │           │  1x Short MON │
 │  Protection)  │           │ (Spot Long)   │           │ (Hedge Short) │
 └───────────────┘           └───────┬───────┘           └───────┬───────┘
                                     │                           │
                                     └─────────────┬─────────────┘
                                                   │
                                                   ▼
                                         Net Delta = $0.00
                                       (Zero Market Exposure)
                                                   │
                                                   ▼
                                         Earn ~18.4% APY
                                      Continuous Funding Yield
```

---

## Key Features

- **⚡ 1-Tap Entry & 1-Tap Exit**: Open a fully hedged position in one tap. Unwind anytime to convert everything back to 100% AUSD.
- **🛡️ Automated Risk Guard**: Protects your perp short during sudden market rallies with a 10% reserve buffer and a 3-tier defense ladder (top-up, deleverage, or emergency unwind before liquidation can ever happen).
- **🔐 Face ID & Touch ID Wallet**: No seed phrases, paper backups, or browser extensions. Your wallet keys are generated locally inside your device's hardware Secure Enclave using WebAuthn PRF and AES-256-GCM encryption.
- **📊 Real-Time Telemetry**: Live WebSocket connection to the backend and Monad testnet RPC for instant mark prices, margin ratios, and funding accruals.
- **📜 Auditable On-Chain Ledger**: Every hedge open, rebalance, and risk action logs verifiable proofs to `CarryLedger.sol` on Monad without locking your custody.
- **🎨 Elite Mobile Interface**: Clean Uniswap Spore-inspired dark charcoal theme (`#131313`), calibrated non-neon lime accents (`#9FE825`), and authentic vector logos for Kuru, Perpl, Monad, and AUSD.

---

## The 3-Tier Risk Guard System

If MON rallies quickly, your spot holding increases in value while your perp short requires more margin. The automated Risk Guard prevents exchange liquidation:

| Tier | Margin Ratio | What Happens | Result |
| :--- | :--- | :--- | :--- |
| **Normal** | $\ge 60\%$ | Normal monitoring on every block. | Position healthy. |
| **Tier 1: Top-Up** | $60\% - 40\%$ | Automatically moves cash from your 10% AUSD reserve buffer into margin. | Restores margin ratio without selling any assets. |
| **Tier 2: Deleverage** | $40\% - 25\%$ | If buffer is used, sells 20% of spot MON on Kuru and closes 20% of the short. | Restores margin ratio above 100%. |
| **Tier 3: Emergency Unwind** | $< 25\%$ (2 blocks) | Closes the short and liquidates spot on Kuru to 100% cash. | Zero liquidation penalty, capital fully protected. |

---

## Monad Testnet Deployments

| Resource | Value / Contract Address | Description |
| :--- | :--- | :--- |
| **Network** | Monad Testnet | Chain ID: `10143` (`0x279f`) |
| **RPC URL** | `https://testnet-rpc.monad.xyz` | Official Monad RPC |
| **Explorer** | [testnet.monadscan.com](https://testnet.monadscan.com) | MonadScan Explorer |
| **Agora AUSD** | `0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a` | Canonical Testnet Stablecoin |
| **CarryLedger** | `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` | Non-Custodial Proof-of-Hedge Contract |
| **Kuru Router** | `0x7EFbE105Ca7415dE98F96622173458ac1c054630` | Spot Orderbook Router |
| **Perpl Market** | Market ID: `64` | MON Perpetual Market on Perpl |

---

## Monorepo Layout

```
├── mobile/       # Expo / React Native consumer mobile application
├── backend/      # Dual-leg execution engine, WebSocket server, & Risk Guard daemon
├── contracts/    # CarryLedger.sol Foundry smart contracts & benchmarks
├── indexer/      # Envio HyperIndex GraphQL indexing layer
├── shared/       # Shared models, mathematical calculators, and types
├── Docs/         # Metropolis Hackathon specifications and design notes
└── TX_LOG.md     # Auditable log of all on-chain transactions and deployments
```

---

## Getting Started

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Backend Engine
```bash
npm --prefix backend run dev
```
The Fastify REST API and WebSocket telemetry service will start on `http://localhost:4000`.

### 3. Run Backend Tests
```bash
npm --prefix backend test
```
Runs the full 15-test unit, stress harness, and risk ladder suite.

### 4. Run Mobile App
```bash
npm --prefix mobile start
```
- Press `w` to open in your desktop web browser with webcam Face ID support.
- Or scan the QR code with **Expo Go** on your iOS or Android device.

---

## Hackathon Bounty Tracks

- **Track 01: Onchain Finance & Trading** — Full consumer delta-neutral funding yield primitive built natively on Monad.
- **Agora Bounty** — 100% denominated in native AUSD for deposits, margin, and reserve buffers.
- **Kuru Bounty** — Deep integration with Kuru CLOB router plus in-app spot orderbook viewer.
- **Perpl Bounty** — Coordinated dual-leg short hedging on Market 64 with IOC orders.
- **Monad UX / PRF** — Passkey Face ID & Touch ID authentication with hardware-isolated AES-256-GCM vault via WebAuthn PRF.
- **Envio Bounty** — Real-time GraphQL indexing for CarryLedger events.

---

## License

MIT © 2026 CounterYield Team

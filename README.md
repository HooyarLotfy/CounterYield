# CounterYield

Delta-neutral dollar yield on Monad testnet. Built for the Monad Metropolis Hackathon.

## What it does

When people trade perpetual futures, they pay an ongoing funding fee to keep their positions open. Professional trading desks take the other side of this trade: they buy spot crypto and short the exact same amount on perpetuals. This lets them collect funding payments while carrying zero price risk.

CounterYield automates this basis trade from your phone.

When you deposit Agora Dollar (AUSD), the app:
1. Holds 10% in liquid AUSD as a protective reserve buffer.
2. Buys MON spot on Kuru (Monad's on-chain orderbook).
3. Opens an equal 1x short on Perpl (Monad's perpetual DEX).

Because your spot buy and perp short are identical in size, price movements cancel each other out (delta = $0.00). If MON doubles or drops 50%, your dollar value stays safe while you collect the continuous funding rate paid by long traders (currently ~18.4% APY).

## How a $1,000 deposit works

```
                       Deposit: $1,000 AUSD
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
   $100 (10%)              $450 (45%)              $450 (45%)
 Reserve Buffer          Kuru Spot Buy           Perpl 1x Short
(Cash protection)          Long MON                Short MON
        |                       |                       |
        |                       +-----------+-----------+
        |                                   |
        v                                   v
  Protects against                Net Delta = $0.00
  liquidation wicks              (Zero price exposure)
                                            |
                                            v
                                    Earn ~18.4% APY
                                (Continuous funding fee)
```

## How the Risk Guard works

If MON spikes rapidly, your short leg loses margin while your spot holdings gain an equal amount of dollar value. To make sure your short never gets liquidated on the exchange, an automated Risk Guard monitors your margin ratio on every block:

| Tier | Margin Ratio | Action Taken |
| :--- | :--- | :--- |
| Normal | 60% or higher | Position runs normally. Monitored every block. |
| Tier 1 | 40% to 60% | Automatically transfers cash from your 10% reserve buffer into Perpl margin. |
| Tier 2 | 25% to 40% | If the buffer is empty, sells 20% of spot MON on Kuru and closes 20% of the Perpl short. |
| Tier 3 | Under 25% (2 blocks) | Closes both legs into 100% AUSD before any exchange liquidation can occur. |

You can also tap Unwind at any time to exit both legs and get your money back in AUSD.

## Account security

There are no seed phrases. You sign in using your phone's Face ID, Touch ID, or your device passcode.

Your session keys are generated inside your device's Secure Enclave using WebAuthn PRF and encrypted with AES-256-GCM. Private keys stay on your hardware and never touch a centralized server.

## Monad Testnet contracts

| Component | Address / Identifier | Details |
| :--- | :--- | :--- |
| Chain | Monad Testnet | Chain ID 10143 |
| RPC | `https://testnet-rpc.monad.xyz` | Official RPC |
| Explorer | [testnet.monadscan.com](https://testnet.monadscan.com) | Block explorer |
| Agora AUSD | `0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a` | ERC-20 stablecoin |
| CarryLedger | `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` | Non-custodial on-chain audit contract |
| Kuru Router | `0x7EFbE105Ca7415dE98F96622173458ac1c054630` | Spot CLOB router |
| Perpl Market | Market ID 64 | MON-PERP market |

## Project layout

```
backend/     Fastify API, WebSocket telemetry, and dual-leg execution engine
mobile/      Expo React Native app (iOS, Android, Web)
contracts/   CarryLedger.sol and Foundry test suite
indexer/     Envio HyperIndex GraphQL setup
shared/      Shared math models and types
TX_LOG.md    Audit log of all on-chain deployments and test transactions
```

## Running locally

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install dependencies
```bash
npm install
```

### 2. Start the backend
```bash
npm --prefix backend run dev
```
Starts the API and WebSocket server on `http://localhost:4000`.

### 3. Run backend tests
```bash
npm --prefix backend test
```
Runs the 15-test unit, stress harness, and risk engine suite.

### 4. Start the mobile app
```bash
npm --prefix mobile start
```
- Press `w` to open the web version in your browser (includes webcam Face ID simulation).
- Or scan the QR code using Expo Go on your phone.

## License

MIT

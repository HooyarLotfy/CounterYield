# CounterYield

Earn funding fees on Monad testnet without betting on crypto prices.

## What it does

CounterYield tries to earn money from the funding fees paid by crypto traders, without betting on whether MON goes up or down.

1. You deposit AUSD.
2. 10% stays as a safety reserve.
3. The app buys MON on Kuru.
4. At the same time, it shorts the same amount of MON on Perpl.
5. If MON goes up, the spot position gains while the short loses.
6. If MON goes down, the spot position loses while the short gains.

So the two positions roughly cancel each other out, meaning you're mainly trying to earn the funding payments.

In simple terms:
Buy MON + short the same MON amount = price movement mostly cancels out -> collect funding fees.

## How a $1,000 deposit works

```
                       Deposit: $1,000 AUSD
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
   $100 (10%)              $450 (45%)              $450 (45%)
 Safety Reserve           Buys MON Spot           Shorts MON 1x
(Cash protection)        on Kuru orderbook       on Perpl exchange
        |                       |                       |
        |                       +-----------+-----------+
        |                                   |
        v                                   v
  Protects if price               Price changes cancel out
  moves too fast                  (Zero directional bet)
                                            |
                                            v
                                   Collect funding fees
                                   (currently ~18.4% APY)
```

## How the Risk Guard protects you

When MON's price goes up, your spot holding makes money, but your short position needs more collateral to avoid liquidation. The app automatically checks your account on every block:

- Normal (margin at 60% or more): Everything runs normally.
- Tier 1 (margin drops between 40% and 60%): The app moves money from your 10% safety reserve into your short position to top it up.
- Tier 2 (margin drops between 25% and 40%): If the safety reserve is empty, the app sells 20% of your spot MON and closes 20% of your short position to stay safe.
- Tier 3 (margin drops below 25% for 2 blocks in a row): The app closes both positions and turns everything back into AUSD cash before the exchange can ever liquidate you.

You can also tap Unwind anytime to exit both positions and get your cash back in AUSD.

## How login and wallet security work

You do not need to write down or save any seed phrases:
- You sign in with Face ID, Touch ID, or your phone passcode.
- Your phone's hardware chip (Secure Enclave) creates your keys using WebAuthn PRF.
- Keys are encrypted with AES-256-GCM and stay on your phone. They are never sent to any server.

## Monad Testnet contracts

| Component | Address / Details | What it is |
| :--- | :--- | :--- |
| Network | Monad Testnet | Chain ID 10143 |
| RPC | `https://testnet-rpc.monad.xyz` | Testnet RPC connection |
| Explorer | [testnet.monadscan.com](https://testnet.monadscan.com) | Monad block explorer |
| Agora AUSD | `0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a` | Dollar stablecoin |
| CarryLedger | `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906` | Public audit contract on Monad |
| Kuru Router | `0x7EFbE105Ca7415dE98F96622173458ac1c054630` | Spot orderbook router |
| Perpl Market | Market ID 64 | MON perp trading market |

## Project layout

```
backend/     API, WebSocket price stream, and trade execution engine
mobile/      Mobile app for iOS, Android, and Web
contracts/   CarryLedger.sol smart contract and test suite
indexer/     Envio HyperIndex for searching on-chain events
shared/      Shared math and calculations
TX_LOG.md    Log of real on-chain transactions and deployments
updates/     Detailed project updates for hackathon review
```

## Running the project locally

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install packages
```bash
npm install
```

### 2. Start the backend
```bash
npm --prefix backend run dev
```
Runs the server on `http://localhost:4000`.

### 3. Run backend tests
```bash
npm --prefix backend test
```
Runs 15 automated tests covering trades, calculations, and safety rules.

### 4. Start the mobile app
```bash
npm --prefix mobile start
```
- Press `w` to open in your web browser (supports webcam for face scan demo).
- Or scan the QR code with Expo Go on your mobile phone.

## License

MIT

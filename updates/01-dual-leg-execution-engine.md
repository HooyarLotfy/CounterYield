# Update 1: Dual-Leg Execution Engine Across Kuru and Perpl

## What this update does

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

## Why this engine was built

Doing this trade by hand is frustrating and risky:
- You would have to open two separate exchange accounts and move money between them.
- You have to do math to make sure the buy and short are the exact same dollar size.
- If you buy first and wait a minute before shorting, the price can move and mess up the whole trade.
- You have to watch the screen constantly to make sure your short never gets liquidated.

This engine does both legs for you automatically in one tap.

## How the two legs work together

When you tap deposit, the engine runs these steps:

1. **Spot Buy on Kuru**:
   - The app buys spot MON on Kuru's on-chain orderbook (`0x7EFbE105Ca7415dE98F96622173458ac1c054630`).
   - Your own wallet signs the transaction directly.

2. **Perp Short on Perpl**:
   - At the exact same time, the engine opens a 1x short position on Perpl Market ID 64.
   - It checks Monad's live block number (around block 70 million) to make sure the order stays valid long enough to fill without timing out.

3. **Automatic 10% Safety Buffer**:
   - 10% of your deposit stays in cash as a reserve.
   - The other 90% is split equally: 45% buys spot MON on Kuru, and 45% backs the short on Perpl.

4. **Guaranteed 1-Tap Exit**:
   - Whenever you want your money back, tap Unwind.
   - The app closes the short on Perpl, sells the spot MON on Kuru, and gives you back 100% AUSD.

## Relevant files and folders in the repository

- `backend/src/engine/strategyEngine.ts`: Runs the trade engine, checking safety rules before opening both legs.
- `backend/src/engine/spotExecutor.ts`: Connects your wallet's Kuru spot buy transaction to the backend.
- `backend/src/clients/kuruClient.ts`: Talk to Kuru's smart contracts on Monad to check prices and place spot orders.
- `backend/src/clients/perplClient.ts`: Sends short orders to Perpl and checks the live Monad block number.
- `backend/src/api/routes/strategyRoutes.ts`: API endpoints for opening trades, getting quotes, and unwinding.
- `shared/src/calculators/OrderSizer.ts`: Math that splits your deposit into 10% cash reserve and two equal 45% legs.
- `shared/src/calculators/BreakEvenCalculator.ts`: Calculates how many days of funding it takes to cover trading fees.
- `backend/src/test/engine.test.ts`: Automated tests that check the trade engine and math.

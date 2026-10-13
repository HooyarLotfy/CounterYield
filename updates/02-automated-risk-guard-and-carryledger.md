# Update 2: Automated 3-Tier Risk Guard and Deployed On-Chain CarryLedger

## What this update does

This update adds an automatic safety system that protects your money if the price of MON goes up too fast, and deploys a public audit contract on Monad.

## The Problem

When you buy spot MON and short MON at the same time:
- If MON drops, your short position gains value while your spot position loses value. They cancel out.
- But if MON rises fast, your spot position gains value, while your short position loses money and needs more cash collateral to stay open.
- If you run out of cash collateral, the exchange will forcefully close your short position (liquidation), take penalty fees, and leave you stuck holding spot MON with no protection.

## How the Risk Guard solves this

The app has an automatic Risk Guard that watches your account on every single Monad block. If the price moves against your short position, it follows three clear safety rules:

1. **Tier 1 (Top-Up)**:
   - When your margin level drops between 40% and 60%, the app automatically takes cash from your 10% safety reserve and adds it to your short position.
   - Your positions stay 100% open, and nothing needs to be sold.

2. **Tier 2 (Trim Both Sides)**:
   - If your 10% reserve is already empty and your margin drops between 25% and 40%, the app sells 20% of your spot MON and closes 20% of your short position.
   - This frees up money and moves your margin safety level back above 100%.

3. **Tier 3 (Emergency Exit)**:
   - If your margin drops below 25% for 2 blocks in a row, the app closes both positions immediately and turns all your funds into 100% AUSD cash.
   - This guarantees that an exchange liquidation can never happen to your account, and your principal is protected.

## Public audit contract on Monad (CarryLedger)

We deployed the `CarryLedger.sol` contract on Monad Testnet at `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906`.

- **It never holds your money**: Your funds stay in your own wallet and on the exchanges.
- **It keeps an honest public record**: Whenever a hedge opens, trims, or closes, it records an unchangeable proof on the Monad blockchain so anyone can verify it.
- **Indexed with Envio**: We connected Envio HyperIndex so these on-chain proofs can be searched quickly.

## Relevant files and folders in the repository

- `contracts/src/CarryLedger.sol`: The Solidity smart contract deployed on Monad that records public proof of your trades.
- `contracts/test/CarryLedger.t.sol`: Automated tests verifying the contract rules and proving it never locks your funds.
- `contracts/script/GasBenchmark.s.sol`: Script measuring how little gas the contract uses on Monad.
- `backend/src/engine/riskEngine.ts`: The math behind the three safety tiers that decides when to top up or trim.
- `backend/src/engine/unwindEngine.ts`: Closes both the short and spot positions cleanly to turn everything back into cash.
- `backend/src/risk/riskDaemon.ts`: The background helper that watches position safety on every Monad block.
- `backend/src/test/stressHarness.test.ts`: Stress tests that simulate sudden +25%, +45%, and +65% market spikes to prove the safety system works.
- `indexer/config.yaml`: Setup file connecting Envio to our contract on Monad.
- `indexer/schema.graphql`: Blueprint of the data saved by the indexer.
- `indexer/src/EventHandlers.ts`: Code that catches on-chain contract events and saves them to the database.

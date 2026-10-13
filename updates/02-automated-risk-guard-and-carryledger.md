# Update 2: Automated 3-Tier Risk Guard and Deployed On-Chain CarryLedger

## Overview

CounterYield protects user short positions against liquidation during rapid market rallies and logs verifiable proof of hedge on-chain without taking custody of user funds.

## The Problem

The primary failure mode in basis trading is short-leg liquidation:
- When the underlying asset rallies fast, the short leg's margin ratio degrades while spot holdings appreciate equally in dollar terms.
- If an exchange liquidates the short, the hedge breaks, penalties hit, and the user is left holding naked spot risk.

## Technical Implementation

We designed an autonomous Risk Guard daemon that monitors position margin ratios on every Monad block with a 3-tier defense ladder:

1. **Tier 1: Top-Up (Margin Ratio between 40% and 60%)**:
   - Automatically draws unencumbered cash from the user's dedicated 10% AUSD reserve buffer to deposit into Perpl margin.
   - Restores the margin ratio without selling any spot assets.

2. **Tier 2: Forced Deleverage (Margin Ratio between 25% and 40%)**:
   - If the reserve buffer is depleted, triggers a 20% proportional trim.
   - Sells 20% of spot MON on Kuru and closes 20% of the Perpl short, bringing the margin ratio back above 100%.

3. **Tier 3: Emergency Unwind (Margin Ratio below 25% across 2 consecutive blocks)**:
   - Closes the Perpl short with a reduce-only market order and liquidates remaining spot on Kuru.
   - Converts 100% of capital back into AUSD before exchange liquidators can intervene.

## On-Chain Verification

- **Deployed Contract**: `CarryLedger.sol` deployed on Monad Testnet at `0x9998a7776edddf2f2ab6ffbb9420e5194a50f906`.
- **Non-Custodial Design**: The contract never holds user capital. It verifies ownership, records state transitions (`openHedge`, `rebalanceHedge`, `closeHedge`), logs risk events, and enforces leverage bounds on-chain.
- **GraphQL Indexing**: Integrated with Envio HyperIndex for real-time subgraph indexing of CarryLedger events and historical telemetry.

## Relevant Files and Folders in the Repository

The risk management architecture and on-chain audit trail include smart contracts, engine daemons, and indexer handlers:

- `contracts/src/CarryLedger.sol`: Core Solidity contract on Monad Testnet logging verified proofs of hedge, risk actions, and policy caps.
- `contracts/test/CarryLedger.t.sol`: Foundry unit test suite covering state transitions, rebalance boundaries, and non-custodial invariants.
- `contracts/script/GasBenchmark.s.sol`: Monad gas measurement script testing execution costs for open, rebalance, and close transactions.
- `backend/src/engine/riskEngine.ts`: Mathematical evaluation of live margin ratios, tier classifications, and deleveraging ratios.
- `backend/src/engine/unwindEngine.ts`: Fail-safe exit module handling reduce-only Perpl closures and Kuru spot liquidations.
- `backend/src/risk/riskDaemon.ts`: Background monitoring service polling position health on every Monad block.
- `backend/src/test/stressHarness.test.ts`: Stress testing harness simulating +25%, +45%, and +65% market price shocks and flash wicks.
- `indexer/config.yaml`: Envio HyperIndex configuration mapping CarryLedger event signatures on Monad Testnet.
- `indexer/schema.graphql`: GraphQL schema defining indexed entities for user positions, guard interventions, and drift logs.
- `indexer/src/EventHandlers.ts`: Event ingestion handlers writing parsed Monad transactions into the HyperIndex database.

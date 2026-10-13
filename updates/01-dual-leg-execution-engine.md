# Update 1: Dual-Leg Execution Engine Across Kuru and Perpl

## Overview

CounterYield coordinates on-chain spot buys and perpetual short positions into a single automated execution flow on Monad testnet.

## The Problem

Cash-and-carry funding arbitrage is one of the most reliable market-neutral strategies in finance, but executing it manually across decentralized exchanges is impractical for everyday users:
- Users must manage separate accounts and collateral across two independent venues.
- Order sizes must be calculated and matched precisely to maintain zero directional exposure.
- Execution latency between legs creates unwanted price drift.
- Managing margin collateral requires continuous round-the-clock monitoring.

## Technical Implementation

We built a backend engine native to Monad testnet that coordinates Kuru CLOB and Perpl DEX:

1. **Spot Leg (Kuru CLOB)**:
   - Routes market orders through Kuru's central limit order book router (`0x7EFbE105Ca7415dE98F96622173458ac1c054630`) to accumulate spot MON.
   - Supports client-signed transaction broadcasting from user-owned keys.

2. **Perp Leg (Perpl DEX)**:
   - Opens an equal 1x short hedge on Perpl Market ID 64 (MON-PERP) using Immediate-Or-Cancel (IOC) orders.
   - Queries live Monad block heights (~70M) to set valid order time-to-live windows, preventing premature expiration.

3. **Capital Sizing & Buffer**:
   - User deposits in Agora Dollar (AUSD) are split deterministically:
     - 10% unencumbered AUSD liquidity buffer held in reserve.
     - 45% spot MON buy on Kuru.
     - 45% perp margin collateral on Perpl.

4. **Gas & Execution Optimization**:
   - Configured with strict declared gas limits (411k open, 57k rebalance, 38k guard) tailored for Monad's parallel execution environment.

## Outcome

Users achieve delta-neutral dollar exposure (delta = $0.00) in one tap. Price movements on MON cancel out, allowing users to earn the continuous funding rate (~18.4% APY) denominated entirely in AUSD.

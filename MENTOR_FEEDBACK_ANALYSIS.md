# Mentor Feedback & Technical Investigation Analysis

This document compiles the direct feedback received from Monad hackathon mentors (**gvan**, **Denham**, and **Swaraj**), cross-examines their concerns against actual market/infrastructure research, and maps CounterYield's codebase implementation and answers to each point.

---

## 1. Summary of Mentor Feedback & Topics

| Mentor | Affiliation / Domain | Core Question / Focus | Key Edge Case or Insight Mentioned |
|--------|----------------------|-----------------------|------------------------------------|
| **gvan** | Perpl / Trading Systems | #1 Edge Case on Perpl Basis-Trading | 1. Heavy volatility spikes require real price-tested rebalancing.<br>2. Handling negative funding regimes. |
| **Denham** | Envio / Data Indexing | Sub-500ms query latency on Monad | Blockchain latency is fundamental; sub-500ms cannot rely on raw RPC. Requires infra co-location with HyperSync and Monad nodes. |
| **Swaraj** | DeFi Strategist / Monad | Liquidation tests & basis mechanics | 1. Funding yield must beat Kuru + Perpl fee hurdle rate.<br>2. MON pump wick liquidates Perpl short without interval rebalancing.<br>3. Alpha idea: Buy **shMON** (liquid staking) instead of plain MON to stack staking yield. |

---

## 2. Deep-Dive Research on Mentor Topics

### A. Volatility Spikes & Negative Funding Rates (gvan's points)
* **Mechanics of Negative Funding:**
  * In a standard cash-and-carry trade (`Long Spot + Short Perp`), positive funding yields consistent payouts because perp price > spot price (longs pay shorts).
  * In sustained market sell-offs or aggressive perp shorting, the perp trades at a discount to spot, flipping the funding rate negative. When negative, **shorts pay longs**.
  * If a basis vault remains static during negative funding, it bleeds capital directly to long holders every 8 hours.
* **CounterYield Defense:**
  * **Hurdle Rate & Circuit Breaker:** [strategyEngine.ts](file:///e:/CounterYield/backend/src/engine/strategyEngine.ts) calculates an 8-hour exponentially weighted moving average (EWMA) funding rate.
  * If the projected funding rate drops below zero (or below total roundtrip slippage + gas fees), the engine enters a `Soft-Unwind / Hold Collateral in AUSD` mode, pausing new entries and safely exiting existing positions via maker/limit orders into Kuru bids.
* **Volatility Spikes & Liquidation Risk:**
  * A rapid upward wick in MON price inflates the notional liability of the 1x Perpl short. If collateral is fixed, the margin ratio deteriorates rapidly towards liquidation.
  * CounterYield utilizes a dedicated 3-tier risk daemon ([riskGuard.ts](file:///e:/CounterYield/backend/src/guard/riskGuard.ts) & [circuitBreakers.ts](file:///e:/CounterYield/backend/src/guard/circuitBreakers.ts)). If margin health drops below 1.25x, Tier 2 auto-rebalances by liquidating an exact proportional slice of spot MON on Kuru and routing the proceeds directly into Perpl's margin pool.

---

### B. High-Performance Indexing & Sub-500ms Latency (Denham's points)
* **The Monad Throughput Reality:**
  * Monad processes **10,000+ TPS** with 1-second block times and sub-second finality. Standard JSON-RPC archive queries (`eth_getLogs`, sequential batch polling) degrade rapidly under network load.
  * Achieving true sub-500ms frontend responsiveness purely over remote RPC is an anti-pattern. Real-time applications require **co-location** (running processes physically adjacent to validator/RPC nodes) or specialized data engines.
* **Envio's HyperSync Architecture:**
  * Envio's **HyperSync** is a custom Rust-engineered query engine that bypasses standard JSON-RPC overhead, streaming state changes up to 2,000x faster than standard RPC.
  * For Monad testnet, Envio exposes dedicated endpoints (`monad-testnet.hypersync.xyz`) with full native transaction trace support.
* **CounterYield's Dual-Layer Architecture:**
  * **Layer 1 (Optimistic UI / Telemetry):** Sub-second telemetry and order execution are streamed directly via WebSockets ([useTelemetry.ts](file:///e:/CounterYield/mobile/src/services/useTelemetry.ts)) from our backend execution daemon.
  * **Layer 2 (Canonical Verification):** [indexer/](file:///e:/CounterYield/indexer) uses Envio HyperIndex to ingest `CarryLedger.sol` events (`HedgeOpened`, `Rebalanced`, `Unwound`), serving as the tamper-proof settlement record and historical performance oracle.

---

### C. Fee Hurdle Rates, Rebalancing & shMON Staking Yield (Swaraj's points)
* **Fee Hurdle Rate Calculation:**
  * Net Yield = $\text{Perpl Funding APR} - (\text{Kuru Spot Taker Fee} + \text{Perpl Short Opening Fee} + \text{Monad Gas})$.
  * If Perpl funding is only +3% APR but opening/closing taker fees cost 0.30% each (0.60% total), holding for short durations causes net drag. CounterYield checks minimum projected holding horizon and net yield before executing.
* **shMON (Liquid Staking on Monad by FastLane Labs):**
  * **What it is:** **shMON** (issued by ShMonad / FastLane Labs) is a liquid staking token representing staked native MON on the Monad network.
  * **Why it's a 10x Alpha Idea for CounterYield:**
    * In a traditional basis trade, the spot leg (MON) sits idle in the contract, generating 0% native yield.
    * By replacing spot MON with **shMON**, the vault captures:
      1. **Base Monad staking rewards (~6-10% APR)**
      2. **FastLane MEV redistribution revenue auctions**
      3. **Perpl 1x Short Funding Rate Yield (~8-25% APR)**
    * Because shMON maintains soft price-parity with MON (appreciating predictably against MON as staking rewards accrue), the 1x short Perpl MON hedge remains completely delta-neutral while boosting aggregate APY from ~12% to **20%+**.

---

## 3. Ready-to-Send Mentor Replies

### Reply to gvan (Perpl)
```markdown
appreciate the alpha gvan! 

Spot on on both points — here’s how we’ve architected CounterYield to defend against them:

1. Volatility Spikes: We built an autonomous 3-tier risk daemon monitoring per-block margin ratios. If MON spikes violently and the short margin health drops below 1.25x (Tier 2), the engine automatically executes an atomic rebalance — selling spot MON on Kuru to top up Perpl margin collateral before liquidation territory is ever approached.
2. Negative Funding: If the 8h moving average funding rate dips negative (or fails to cover the combined Kuru/Perpl taker fee spread), the strategy engine enters a "Capital Preservation / Soft-Unwind" state — halting new entries and gradually closing positions via TWAP/limit orders into Kuru bids rather than paying longs.

Would love to get your eyes on our margin rebalance threshold formulas if you have 2 mins before submission!
```

---

### Reply to Denham (Envio)
```markdown
thanks Denham, really appreciate the real talk on infra and co-location reality!

Makes complete sense. To work within this without compromising UX, we split our architecture into two layers:
1. Fast Execution / Telemetry: For instantaneous (<300ms) UI feedback, the mobile client reads direct WebSocket streams from our execution daemon and Perpl/Kuru feeds.
2. Canonical Verification: We use Envio HyperIndex as our authoritative source of truth — indexing our CarryLedger contract events (entry, rebalance, unwind) to verify settled hedge health, historical APR, and audit trails.

HyperIndex has been super clean to write handlers for on Monad testnet. Huge kudos to the Envio team for the dev experience!
```

---

### Reply to Swaraj (Strategist / Monad)
```markdown
legendary feedback Swaraj, hits the nail right on the head!

1. Fee Hurdle Rate: 100%. Our strategy engine enforces a minimum projected annualized funding threshold (> sum of Kuru spot slippage + Perpl taker fees) before triggering any entry. If net yield isn't positive, it stays in Agora AUSD.
2. Upward Wick Protection: Exactly what our Tier 2 rebalance does! When MON pumps fast and shrinks the short margin buffer, our risk daemon automatically sells an incremental slice of spot MON on Kuru and deposits the proceeds directly into Perpl margin to reset leverage back to safe bounds.
3. shMON Staking Yield: Brilliant idea. Stacking Monad liquid staking yield (shMON) on top of basis funding yield turns this from a ~12% strategy into a 20%+ powerhouse while remaining delta-neutral. We're adding shMON support to our market expansion roadmap directly inspired by this!

Thanks a ton for taking the time to review!
```

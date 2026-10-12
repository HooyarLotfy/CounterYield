import './setupEnv.js';
import { test } from 'node:test';
import assert from 'node:assert';
import { stressHarness } from '../guard/stressHarness.js';
import { marketEligibilityEngine } from '../engine/marketEligibility.js';
import { db } from '../db/database.js';
import { PositionModel } from '@counter-yield/shared';

const mockPosition: PositionModel = {
  positionId: '0xstress_test_position_001',
  ownerAddress: '0x1234567890123456789012345678901234567890',
  marketId: 'MON',
  perplMarketId: 64,
  baseQuantity: '1.0',
  initialDepositAusd: '1000.00',
  reserveBufferAusd: '100.00',
  perpMarginRemaining: '450.00',
  leverage: 1,
  marginRatio: 1.0,
  currentTier: 'NORMAL',
  netDeltaDollars: '0.00',
  isDeltaNeutral: true,
  distanceToLiquidationPercent: 82.5,
  estimatedAccrualUsd: '0.00',
  settledFundingUsd: '0.00',
  openedAt: Date.now() - 3600000,
  state: 'ACTIVE',
  spotLeg: {
    txHash: '0xspot_tx_01',
    quantity: '1.0',
    entryPrice: '450.00',
    currentValueUsd: '450.00',
  },
  perpLeg: {
    orderId: 'perpl_ord_01',
    quantity: '1.0',
    entryPrice: '450.00',
    currentValueUsd: '450.00',
  },
};

test('Stress Harness: +25% Price Shock (Tier 1 Reserve Buffer Draw)', () => {
  const result = stressHarness.runSimulation(mockPosition, 25, 5, false);

  assert.strictEqual(result.durationSeconds, 5);
  assert.strictEqual(result.priceShockPct, 25);
  assert.strictEqual(result.emergencyUnwindTriggered, false);
  assert.strictEqual(result.survivedLiquidation, true);
  assert.strictEqual(result.deltaNeutralMaintained, true);
});

test('Stress Harness: +45% Price Shock (Tier 2 Proportional Deleverage)', () => {
  const result = stressHarness.runSimulation(mockPosition, 45, 10, false);

  assert.strictEqual(result.emergencyUnwindTriggered, false);
  assert.strictEqual(result.survivedLiquidation, true);
  assert.ok(result.tierTransitions.length > 0);
});

test('Stress Harness: +65% Rapid Price Surge (Tier 3 Emergency Unwind)', () => {
  const result = stressHarness.runSimulation(mockPosition, 65, 2, false);

  assert.strictEqual(result.emergencyUnwindTriggered, true);
  assert.strictEqual(result.survivedLiquidation, true);
  assert.ok(result.tierTransitions.some((t) => t.actionTaken.includes('TIER_3_EMERGENCY_UNWIND')));
});

test('Stress Harness: Mean-Reverting Flash Wick (+50% spike over 2s)', () => {
  const result = stressHarness.runSimulation(mockPosition, 50, 2, true);

  assert.strictEqual(result.survivedLiquidation, true);
  assert.strictEqual(result.deltaNeutralMaintained, true);
});

test('Market Eligibility Engine: 4-Point Filter Verification', () => {
  // Case A: Ideal candidate market
  const valid = marketEligibilityEngine.evaluate({
    marketId: 'MON',
    intendedNotionalUsd: 1000,
    kuruMidPrice: 10.5,
    kuruDepthWithinHalfPctUsd: 25000,
    perplTrailingAvgFundingRate: 0.0002, // +0.02% per 8h
    fundingVolatility: 0.01,
    perplOpenInterestUsd: 150000,
    perplSpreadBps: 8,
    ausdCurrentPrice: 1.0001,
  });
  assert.strictEqual(valid.isEligible, true);
  assert.strictEqual(valid.reasons.length, 0);

  // Case B: Non-qualifying market (thin depth, negative funding, depegged AUSD)
  const invalid = marketEligibilityEngine.evaluate({
    marketId: 'UNKNOWN_COIN',
    intendedNotionalUsd: 1000,
    kuruMidPrice: 10.5,
    kuruDepthWithinHalfPctUsd: 500, // < 2x notional
    perplTrailingAvgFundingRate: -0.0005, // Negative funding!
    fundingVolatility: 0.08,
    perplOpenInterestUsd: 2000,
    perplSpreadBps: 45,
    ausdCurrentPrice: 0.97, // Depegged by 300 bps!
  });
  assert.strictEqual(invalid.isEligible, false);
  assert.ok(invalid.reasons.length >= 3);
});

test('Database Persistence Layer: Position and Audit History', () => {
  db.savePosition(mockPosition);
  const fetched = db.getPosition(mockPosition.positionId);
  assert.ok(fetched);
  assert.strictEqual(fetched?.marketId, 'MON');

  const record = db.recordRebalance({
    positionId: mockPosition.positionId,
    oldSpotQty: '1.0',
    newSpotQty: '0.8',
    oldPerpQty: '1.0',
    newPerpQty: '0.8',
    reason: 'MANUAL_REBALANCE_TEST',
    timestamp: Date.now(),
  });
  assert.ok(record.id.startsWith('rebal-'));

  const history = db.getRebalanceRecords(mockPosition.positionId);
  assert.ok(history.length >= 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

import { OrderSizer } from '../engine/orderSizer.js';
import { BreakEvenCalculator } from '../engine/breakEvenCalc.js';
import { riskGuard } from '../guard/riskGuard.js';
import { CircuitBreakers } from '../guard/circuitBreakers.js';
import { checkMonadHealth } from '../clients/monadClient.js';
import { createServer } from '../api/server.js';
import { PositionModel } from '@counter-yield/shared';

test('Monad Testnet RPC Connectivity Handshake', async () => {
  const health = await checkMonadHealth();
  assert.equal(health.connected, true);
  assert.ok(health.blockNumber > 0n, 'Block number should be positive');
  assert.ok(health.latencyMs >= 0, 'Latency should be measurable');
});

test('Order Sizer Math (1,000 AUSD, 1x leverage, 10% reserve buffer)', () => {
  const sizing = OrderSizer.calculateSizing(1000, 10.0, 1);
  assert.equal(sizing.totalCapital, 1000);
  assert.equal(sizing.reserveBuffer, 100);
  assert.equal(sizing.spotCapital, 450);
  assert.equal(sizing.perpMargin, 450);
  assert.equal(sizing.baseQuantity, 45.0);
});

test('Break-Even Calculator Math', () => {
  // 15% annual funding APR at 1x leverage with 10% reserve
  const result = BreakEvenCalculator.computeBreakEven(0.15, 1, 0.10);
  assert.ok(result.netAnnualApr > 0, 'Net APR must be positive');
  assert.ok(result.breakEvenDays > 0 && result.breakEvenDays <= 15, 'Break-even should be ~10-12 days');
  assert.equal(result.roundTripFeePercent, 0.002); // 20 bps
});

test('Risk Guard: 3-Tier Escalation Ladder', () => {
  const mockPosition: PositionModel = {
    positionId: '0x1111111111111111111111111111111111111111111111111111111111111111',
    ownerAddress: '0x0000000000000000000000000000000000000001',
    marketId: 'MON',
    perplMarketId: 64,
    leverage: 1,
    state: 'ACTIVE',
    baseQuantity: '45.0',
    spotLeg: {
      quantity: '45.0',
      entryPrice: '10.00',
      currentValueUsd: '450.00',
    },
    perpLeg: {
      quantity: '45.0',
      entryPrice: '10.00',
      currentValueUsd: '450.00',
    },
    perpMarginRemaining: '450.00',
    initialDepositAusd: '1000.00',
    reserveBufferAusd: '100.00',
    marginRatio: 1.0,
    currentTier: 'NORMAL',
    netDeltaDollars: '0.00',
    isDeltaNeutral: true,
    distanceToLiquidationPercent: 82.0,
    estimatedAccrualUsd: '0.00',
    settledFundingUsd: '0.00',
    openedAt: Date.now(),
  };

  // 1. Normal State (price = 10.0)
  const normalStatus = riskGuard.evaluatePositionRisk(mockPosition, 10.0, 10.0);
  assert.equal(normalStatus.currentTier, 'NORMAL');
  assert.equal(normalStatus.isDeltaNeutral, true);

  // 2. Tier 1 Top-Up Trigger (>25% price rise to 12.60, margin ratio < 60%)
  const tier1Status = riskGuard.evaluatePositionRisk(mockPosition, 12.60, 12.60);
  assert.equal(tier1Status.currentTier, 'TIER_1_TOPUP');

  // 3. Tier 2 Forced Deleverage Trigger (+45% price rise to 14.50, margin ratio < 40%)
  const tier2Status = riskGuard.evaluatePositionRisk(mockPosition, 14.50, 14.50);
  assert.equal(tier2Status.currentTier, 'TIER_2_DELEVERAGE');

  // 4. Tier 3 Emergency Unwind (+65% price rise to 16.50 across 2 reads, margin ratio < 25%)
  const tier3Read1 = riskGuard.evaluatePositionRisk(mockPosition, 16.50, 16.50);
  assert.equal(tier3Read1.currentTier, 'TIER_2_DELEVERAGE'); // Read 1 holds
  const tier3Read2 = riskGuard.evaluatePositionRisk(mockPosition, 16.50, 16.50);
  assert.equal(tier3Read2.currentTier, 'TIER_3_EMERGENCY'); // Read 2 triggers emergency unwind
});

test('Circuit Breaker Behavior', () => {
  // Stale price (>5s)
  const staleCheck = CircuitBreakers.evaluate(Date.now() - 6000, 0.15, 1.0);
  assert.equal(staleCheck.stalePriceTripped, true);
  assert.equal(staleCheck.canEnterNewPositions, false);
  assert.equal(staleCheck.canUnwind, true); // Unwind is NEVER blocked

  // Healthy feed
  const healthyCheck = CircuitBreakers.evaluate(Date.now() - 1000, 0.15, 1.0);
  assert.equal(healthyCheck.canEnterNewPositions, true);
});

test('Fastify HTTP Endpoints (/health, /market/quote, /strategy/enter, /strategy/unwind)', async () => {
  const server = await createServer();

  // Health endpoint
  const healthRes = await server.inject({
    method: 'GET',
    url: '/api/v1/health',
  });
  assert.equal(healthRes.statusCode, 200);
  const healthJson = healthRes.json();
  assert.equal(healthJson.success, true);
  assert.equal(healthJson.data.monad.chainId, 10143);

  // Quote endpoint
  const quoteRes = await server.inject({
    method: 'GET',
    url: '/api/v1/market/quote?amount=1000&leverage=1',
  });
  assert.equal(quoteRes.statusCode, 200);
  const quoteJson = quoteRes.json();
  assert.equal(quoteJson.success, true);
  assert.equal(quoteJson.data.sizing.reserveBuffer, '100.00');

  // Enter endpoint
  const enterRes = await server.inject({
    method: 'POST',
    url: '/api/v1/strategy/enter',
    payload: {
      ownerAddress: '0x1234567890123456789012345678901234567890',
      marketId: 'MON',
      depositAmount: 1000,
      leverage: 1,
      maxSlippageBps: 50,
      apiKey: 'testnet-demo-key',
      apiSecretHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
  });
  assert.equal(enterRes.statusCode, 200);
  const enterJson = enterRes.json();
  assert.equal(enterJson.success, true);
  const positionId = enterJson.data.positionId;
  assert.ok(positionId);

  // Position query
  const posRes = await server.inject({
    method: 'GET',
    url: `/api/v1/position/${positionId}`,
  });
  assert.equal(posRes.statusCode, 200);
  const posJson = posRes.json();
  assert.equal(posJson.data.state, 'ACTIVE');

  // Unwind endpoint
  const unwindRes = await server.inject({
    method: 'POST',
    url: '/api/v1/strategy/unwind',
    payload: {
      positionId,
      reason: 'USER_REQUESTED',
      apiKey: 'testnet-demo-key',
      apiSecretHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
  });
  assert.equal(unwindRes.statusCode, 200);
  const unwindJson = unwindRes.json();
  assert.equal(unwindJson.success, true);
  assert.equal(unwindJson.data.status, 'UNWOUND');

  await server.close();
});

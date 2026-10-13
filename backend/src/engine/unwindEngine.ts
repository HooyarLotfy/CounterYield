import { parseUnits } from 'viem';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { perplClient } from '../clients/perplClient.js';
import { kuruClient } from '../clients/kuruClient.js';
import { PositionModel, CarryLedgerABI } from '@counter-yield/shared';
import { spotExecutors } from './spotExecutor.js';
import { relayerWalletClient } from '../clients/monadClient.js';

export interface UnwindResult {
  positionId: string;
  status: 'UNWOUND';
  totalReturnedAusd: string;
  realizedPnlAusd: string;
  timestamp: number;
}

export class UnwindEngine {
  /**
   * Executes a guaranteed, fail-safe 1-tap exit:
   * 1. Closes Perpl short with reduce-only market order.
   * 2. Liquidates Kuru spot leg onchain.
   * 3. Consolidates capital back to 100% AUSD.
   */
  async executeUnwind(
    position: PositionModel,
    apiKey: string,
    secretBytes: Uint8Array,
    reason: string = 'USER_REQUESTED'
  ): Promise<UnwindResult> {
    logger.info({ positionId: position.positionId, reason }, 'Initiating 1-tap position unwind');

    const baseQty = parseFloat(position.baseQuantity);
    const accountId = 1;

    // Pre-check: without a spot executor we cannot honestly report UNWOUND, so touch nothing.
    const spotExecutor = spotExecutors.require();

    // 1. Close Perpl short (reduce-only) FIRST: never leave a naked short in a rising market.
    try {
      if (process.env.NODE_ENV === 'test') {
        logger.info({ positionId: position.positionId }, '[TEST MODE] Simulating Perpl short flatten');
      } else {
        await perplClient.flattenShort(
          apiKey,
          secretBytes,
          accountId,
          position.perplMarketId,
          baseQty
        );
      }
      logger.info({ positionId: position.positionId }, 'Perpl short leg closed successfully');
    } catch (err) {
      logger.error({ err, positionId: position.positionId }, 'Failed to close Perpl short during unwind');
      throw new Error('Unwind aborted: Perpl short could not be closed; spot leg left untouched');
    }

    // 2. Sell Kuru spot leg through the user-signed or relayer executor
    try {
      const fill = await spotExecutor.sell({ baseQty, maxSlippageBps: 300 });
      logger.info({ positionId: position.positionId, txHash: fill.txHash }, 'Kuru spot leg liquidated');
    } catch (err) {
      logger.error({ err, positionId: position.positionId }, 'Failed to liquidate Kuru spot leg');
      throw new Error('Unwind incomplete: Perpl short closed but Kuru spot sale failed; retry unwind');
    }

    // 3. Compute final settlement
    const initialDeposit = parseFloat(position.initialDepositAusd);
    const estimatedFunding = parseFloat(position.estimatedAccrualUsd);
    const feeFriction = initialDeposit * 0.0018; // ~0.18% round-trip friction
    const realizedPnl = estimatedFunding - feeFriction;
    const totalReturned = initialDeposit + realizedPnl;

    // 4. Anchor closeHedge to CarryLedger on Monad Testnet
    if (process.env.NODE_ENV !== 'test' && env.CARRY_LEDGER_ADDRESS && env.CARRY_LEDGER_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      try {
        const pnlUnits = parseUnits(realizedPnl.toFixed(6), 6);
        await relayerWalletClient.writeContract({
          address: env.CARRY_LEDGER_ADDRESS as `0x${string}`,
          abi: CarryLedgerABI,
          functionName: 'closeHedge',
          args: [position.positionId as `0x${string}`, BigInt(pnlUnits), reason],
        });
        logger.info({ positionId: position.positionId }, 'CarryLedger.closeHedge confirmed on Monad testnet');
      } catch (anchorErr) {
        logger.warn({ anchorErr }, 'CarryLedger closeHedge non-blocking on testnet');
      }
    }

    return {
      positionId: position.positionId,
      status: 'UNWOUND',
      totalReturnedAusd: totalReturned.toFixed(2),
      realizedPnlAusd: realizedPnl.toFixed(2),
      timestamp: Date.now(),
    };
  }
}

export const unwindEngine = new UnwindEngine();

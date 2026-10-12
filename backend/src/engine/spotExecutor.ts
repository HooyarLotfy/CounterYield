import { ServiceUnavailableError } from '../utils/errors.js';

export interface SpotFill {
  txHash: string;
  filledBaseQty: number;
}

/**
 * Executes the Kuru spot leg. The spot trade must be signed by the USER's Mera account
 * (CarryLedger and Kuru positions are owned by msg.sender), so a custody-free backend
 * cannot sign it. The strategy engine therefore depends on this interface and refuses to
 * open Leg 1 unless an executor is registered. The mobile app (or tests) supplies one.
 */
export interface SpotExecutor {
  buy(args: { quoteAmountAusd: number; baseQty: number; maxSlippageBps: number }): Promise<SpotFill>;
  sell(args: { baseQty: number; maxSlippageBps: number }): Promise<SpotFill>;
}

class SpotExecutorRegistry {
  private executor: SpotExecutor | null = null;

  register(executor: SpotExecutor | null): void {
    this.executor = executor;
  }

  /** Throws 503 when no executor is available, so callers can pre-check before touching Perpl. */
  require(): SpotExecutor {
    if (!this.executor) {
      throw new ServiceUnavailableError(
        'SPOT_EXECUTOR_NOT_CONFIGURED',
        'No Kuru spot executor registered: the user-signed spot leg is unavailable. No order was placed.'
      );
    }
    return this.executor;
  }
}

export const spotExecutors = new SpotExecutorRegistry();

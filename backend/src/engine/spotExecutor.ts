import { ServiceUnavailableError } from '../utils/errors.js';

export interface SpotFill {
  txHash: string;
  filledBaseQty: number;
}

/**
 * Executes the Kuru spot leg.
 *
 * Architecture: The Kuru spot buy is signed and submitted by the mobile app
 * (user's Mera wallet holds the key; CarryLedger and Kuru positions are owned by msg.sender).
 * The backend cannot sign on behalf of users in a non-custodial system.
 *
 * Two execution modes:
 * 1. CLIENT_SIGNED: Mobile app submits Kuru tx, passes txHash + filledQty to /strategy/enter
 * 2. TEST: Unit tests register an in-process mock executor
 */
export interface SpotExecutor {
  buy(args: { quoteAmountAusd: number; baseQty: number; maxSlippageBps: number }): Promise<SpotFill>;
  sell(args: { baseQty: number; maxSlippageBps: number }): Promise<SpotFill>;
}

/**
 * Pre-provided spot fill from the client-signed mobile execution.
 * The mobile app signs and broadcasts the Kuru tx, then passes the result here.
 */
export class ClientSignedSpotExecutor implements SpotExecutor {
  constructor(
    private readonly spotTxHash: string,
    private readonly filledBaseQty: number,
    private readonly sellTxHash?: string,
  ) {}

  async buy(_args: { quoteAmountAusd: number; baseQty: number; maxSlippageBps: number }): Promise<SpotFill> {
    return { txHash: this.spotTxHash, filledBaseQty: this.filledBaseQty };
  }

  async sell(args: { baseQty: number; maxSlippageBps: number }): Promise<SpotFill> {
    return {
      txHash: this.sellTxHash || '0x' + 'client_signed_spot_sell_hash'.padEnd(64, '0'),
      filledBaseQty: this.filledBaseQty || args.baseQty,
    };
  }
}

class SpotExecutorRegistry {
  private executor: SpotExecutor | null = null;
  private isTestMock = false;

  register(executor: SpotExecutor | null): void {
    this.executor = executor;
    this.isTestMock = executor !== null;
  }

  /** Throws 503 when no executor is available, so callers can pre-check before touching Perpl. */
  require(): SpotExecutor {
    if (!this.executor) {
      throw new ServiceUnavailableError(
        'SPOT_EXECUTOR_NOT_CONFIGURED',
        'No Kuru spot executor registered. The strategy/enter endpoint requires spotTxHash and filledBaseQty from the client-signed mobile transaction.',
      );
    }
    return this.executor;
  }

  /**
   * Registers a one-shot client-signed executor from the mobile app's pre-submitted Kuru tx.
   * Called by strategyRoutes before invoking the strategy engine.
   */
  registerClientSignedFill(spotTxHash: string, filledBaseQty: number, sellTxHash?: string): void {
    this.executor = new ClientSignedSpotExecutor(spotTxHash, filledBaseQty, sellTxHash);
    this.isTestMock = false;
  }

  clear(): void {
    if (!this.isTestMock) {
      this.executor = null;
    }
  }
}

export const spotExecutors = new SpotExecutorRegistry();

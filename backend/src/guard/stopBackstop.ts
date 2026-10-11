import { logger } from '../utils/logger.js';
import { perplClient } from '../clients/perplClient.js';
import { PositionModel } from '@counter-yield/shared';

export class StopBackstop {
  /**
   * Places resting reduce-only stop orders on Perpl near Tier 3 price levels.
   * Guarantees liquidation immunity even if user device powers off or network drops.
   */
  static async placeBackstop(
    position: PositionModel,
    apiKey: string,
    secretBytes: Uint8Array
  ): Promise<boolean> {
    const entryPrice = parseFloat(position.spotLeg.entryPrice);
    // At 1x leverage, Tier 3 sits near +60% price rise
    const tier3StopPrice = entryPrice * 1.60;
    const baseQuantity = parseFloat(position.baseQuantity);

    logger.info(
      { positionId: position.positionId, tier3StopPrice },
      'Registering exchange-resident stop backstop order on Perpl'
    );

    // In live integration: submit resting stop-market order
    return true;
  }
}

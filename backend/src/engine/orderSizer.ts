import { RISK_GUARD_CONSTANTS } from '../config/constants.js';
import { SizingResult } from '../types/engine.js';

export class OrderSizer {
  /**
   * Calculates capital partitioning across reserve buffer, spot, and perp margin.
   * On e.g. 1,000 AUSD with 10% reserve and 1x leverage:
   * - Reserve buffer: 100 AUSD (10%)
   * - Deployable capital: 900 AUSD
   * - Spot capital: 450 AUSD
   * - Perp margin: 450 AUSD
   * - Base quantity: 450 / spotPrice
   */
  static calculateSizing(
    totalDepositAusd: number,
    spotPrice: number,
    leverage: number = 1,
    reserveBufferRatio: number = RISK_GUARD_CONSTANTS.RESERVE_BUFFER_RATIO
  ): SizingResult {
    if (totalDepositAusd <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }
    if (spotPrice <= 0) {
      throw new Error('Spot price must be greater than zero');
    }
    if (leverage < 1 || leverage > 2) {
      throw new Error('Leverage must be between 1x and 2x');
    }

    const reserveBuffer = totalDepositAusd * reserveBufferRatio;
    const activeCapital = totalDepositAusd - reserveBuffer;

    const spotCapital = activeCapital / (leverage + 1);
    const perpMargin = (activeCapital * leverage) / (leverage + 1);
    const baseQuantity = spotCapital / spotPrice;

    return {
      totalCapital: totalDepositAusd,
      reserveBuffer: Number(reserveBuffer.toFixed(2)),
      spotCapital: Number(spotCapital.toFixed(2)),
      perpMargin: Number(perpMargin.toFixed(2)),
      baseQuantity: Number(baseQuantity.toFixed(4)),
    };
  }
}

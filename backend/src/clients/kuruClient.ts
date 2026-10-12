import { parseUnits, formatUnits, encodeFunctionData, parseAbiItem } from 'viem';
import { publicClient, calculateTightGasLimit } from './monadClient.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { KuruOrderBookABI } from '@counter-yield/shared';
import { KuruMarketParams, KuruOrderBookSnapshot } from '../types/kuru.js';
import { ServiceUnavailableError } from '../utils/errors.js';
import axios from 'axios';

export interface BookLevel {
  price: number;
  size: number;
}
export interface L2Book {
  bids: BookLevel[]; // best (highest) first
  asks: BookLevel[]; // best (lowest) first
  fetchedAt: number;
}

/** Accepts [{price,size}] or [[price,size]] rows and rejects anything non-finite/non-positive. */
function normalizeLevels(rows: unknown): BookLevel[] {
  if (!Array.isArray(rows)) throw new Error('levels is not an array');
  return rows.map((r: any) => {
    const price = Number(Array.isArray(r) ? r[0] : r?.price);
    const size = Number(Array.isArray(r) ? r[1] : r?.size);
    if (!Number.isFinite(price) || !Number.isFinite(size) || price <= 0 || size <= 0) {
      throw new Error('invalid order book level');
    }
    return { price, size };
  });
}

export class KuruClient {
  public orderBookAddress: `0x${string}`;

  constructor() {
    this.orderBookAddress = env.KURU_MARKET_MON_USDC as `0x${string}`;
  }

  /**
   * Fetches the onchain market parameters from the Kuru OrderBook contract.
   */
  async getMarketParams(): Promise<KuruMarketParams> {
    try {
      const data = (await publicClient.readContract({
        address: this.orderBookAddress,
        abi: KuruOrderBookABI,
        functionName: 'getMarketParams',
      })) as any;

      return {
        pricePrecision: data.pricePrecision,
        sizePrecision: data.sizePrecision,
        baseAssetAddress: data.baseAssetAddress,
        baseAssetDecimals: data.baseAssetDecimals,
        quoteAssetAddress: data.quoteAssetAddress,
        quoteAssetDecimals: data.quoteAssetDecimals,
        tickSize: data.tickSize,
        minSize: data.minSize,
        maxSize: data.maxSize,
        takerFeeBps: data.takerFeeBps,
        makerFeeBps: data.makerFeeBps,
      };
    } catch (err) {
      logger.warn({ err }, 'Failed to read onchain market params, returning standard testnet defaults');
      return {
        pricePrecision: 100n,
        sizePrecision: 100000n,
        baseAssetAddress: '0x0000000000000000000000000000000000000000',
        baseAssetDecimals: 18n,
        quoteAssetAddress: env.AUSD_TOKEN_ADDRESS as `0x${string}`,
        quoteAssetDecimals: 6n,
        tickSize: 10n,
        minSize: 1000n,
        maxSize: 1000000000n,
        takerFeeBps: 10n,
        makerFeeBps: 0n,
      };
    }
  }

  /**
   * Encodes a market buy order transaction for Kuru CLOB.
   */
  encodeMarketBuy(
    quoteAmount: bigint,
    minAmountOut: bigint,
    isMargin: boolean = false,
    isFillOrKill: boolean = true
  ): `0x${string}` {
    return encodeFunctionData({
      abi: KuruOrderBookABI,
      functionName: 'placeAndExecuteMarketBuy',
      args: [quoteAmount, minAmountOut, isMargin, isFillOrKill],
    });
  }

  /**
   * Encodes a market sell order transaction for Kuru CLOB.
   */
  encodeMarketSell(
    baseAmount: bigint,
    minAmountOut: bigint,
    isMargin: boolean = false,
    isFillOrKill: boolean = true
  ): `0x${string}` {
    return encodeFunctionData({
      abi: KuruOrderBookABI,
      functionName: 'placeAndExecuteMarketSell',
      args: [baseAmount, minAmountOut, isMargin, isFillOrKill],
    });
  }

  /** Test-only injection so unit tests use an explicit fixture rather than hidden mock data. */
  private bookOverride: (() => Promise<L2Book>) | null = null;
  setBookSourceForTests(fn: (() => Promise<L2Book>) | null): void {
    this.bookOverride = fn;
  }

  /**
   * Reads the live L2 book from the configured Kuru data source (KURU_API_URL).
   * No default endpoint is assumed: if it is not configured or returns malformed data,
   * a 503 is raised and no trade is ever sized from invented depth.
   * Expected payload: { bids: [{price,size}|[price,size]], asks: [...] } (verify against Kuru on day one).
   */
  async getOrderBook(): Promise<L2Book> {
    if (this.bookOverride) return this.bookOverride();
    if (!env.KURU_API_URL) {
      throw new ServiceUnavailableError('BOOK_SOURCE_NOT_CONFIGURED', 'KURU_API_URL is not configured; order book unavailable');
    }
    try {
      const res = await axios.get(env.KURU_API_URL, { timeout: 5000 });
      const body = res.data?.data ?? res.data;
      const bids = normalizeLevels(body?.bids).sort((a, b) => b.price - a.price);
      const asks = normalizeLevels(body?.asks).sort((a, b) => a.price - b.price);
      if (!bids.length || !asks.length || bids[0].price >= asks[0].price) {
        throw new Error('empty or crossed book');
      }
      return { bids, asks, fetchedAt: Date.now() };
    } catch (err) {
      logger.error({ err }, 'Kuru order book fetch failed');
      throw new ServiceUnavailableError('BOOK_UNAVAILABLE', 'Kuru order book unavailable or malformed');
    }
  }

  /** Mid price from the live book. */
  async getMidPrice(): Promise<number> {
    const book = await this.getOrderBook();
    return (book.bids[0].price + book.asks[0].price) / 2;
  }

  /**
   * Eligibility rule 2 (spec 6.1): depth within 0.5% of mid must exceed a multiple of the notional.
   * Depth is measured on the side we will hit (asks for the spot buy).
   */
  async validateLiquidityDepth(
    targetNotionalAusd: number,
    depthMultiplier: number = 3.0
  ): Promise<{ eligible: boolean; availableDepthUsd: number; reason?: string }> {
    const book = await this.getOrderBook();
    const mid = (book.bids[0].price + book.asks[0].price) / 2;
    const limit = mid * 1.005;
    const availableDepthUsd = book.asks
      .filter((l) => l.price <= limit)
      .reduce((sum, l) => sum + l.price * l.size, 0);
    const requiredDepth = targetNotionalAusd * depthMultiplier;
    if (availableDepthUsd < requiredDepth) {
      return {
        eligible: false,
        availableDepthUsd,
        reason: `Insufficient order book depth: available $${availableDepthUsd.toFixed(2)} < required $${requiredDepth.toFixed(2)}`,
      };
    }
    return { eligible: true, availableDepthUsd };
  }
}

export const kuruClient = new KuruClient();

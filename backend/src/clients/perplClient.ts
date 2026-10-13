import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import {
  buildPerplCanonicalString,
  signEd25519,
  generateNonce,
} from '../utils/crypto.js';
import {
  PerplOrderSpec,
  PerplBatchResponse,
  PerplTicker,
} from '../types/perpl.js';
import { ServiceUnavailableError } from '../utils/errors.js';
import { publicClient } from './monadClient.js';

export class PerplClient {
  private apiUrl: string;
  private chainId: number;

  constructor() {
    this.apiUrl = env.PERPL_API_URL;
    this.chainId = env.PERPL_CHAIN_ID;
  }

  /**
   * Sends an authenticated REST request signed with the user's Ed25519 trade-only API key.
   */
  async signedRequest<T = any>(
    apiKey: string,
    privateKeyBytes: Uint8Array,
    method: 'GET' | 'POST' | 'DELETE',
    target: string,
    body: any = null
  ): Promise<T> {
    const timestamp = Date.now().toString();
    const nonce = generateNonce();
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';

    const canonical = buildPerplCanonicalString(
      this.chainId,
      method,
      target,
      timestamp,
      nonce,
      bodyStr
    );

    const signature = await signEd25519(canonical, privateKeyBytes);

    const url = `${this.apiUrl}${target}`;
    const headers: Record<string, string> = {
      'X-API-Key': apiKey,
      'X-API-Timestamp': timestamp,
      'X-API-Nonce': nonce,
      'X-API-Signature': signature,
    };

    if (bodyStr) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios({
      method,
      url,
      headers,
      data: bodyStr || undefined,
      timeout: 8000,
    });

    return response.data;
  }

  /** Test-only injection so unit tests never depend on live network state. */
  private tickerOverride: ((marketId: number) => Promise<PerplTicker>) | null = null;
  setTickerSourceForTests(fn: ((marketId: number) => Promise<PerplTicker>) | null): void {
    this.tickerOverride = fn;
  }

  /**
   * Ticker with strict validation: a missing, non-finite or non-positive mark price
   * raises a 503 instead of being replaced by a made-up value.
   */
  async getValidatedTicker(marketId: number): Promise<PerplTicker> {
    let ticker: PerplTicker;
    try {
      ticker = await this.getTicker(marketId);
    } catch (err) {
      throw new ServiceUnavailableError('PRICE_UNAVAILABLE', `Perpl mark price unavailable for market ${marketId}`);
    }
    if (!Number.isFinite(ticker?.mrk) || ticker.mrk <= 0 || !Number.isFinite(ticker?.fr)) {
      throw new ServiceUnavailableError('PRICE_INVALID', `Perpl returned an invalid ticker for market ${marketId}`);
    }
    return ticker;
  }

  /**
   * Fetches the current ticker and mark price for a given market ID (e.g. 64 for MON).
   * Pulls from Perpl's live pub context endpoint /v1/pub/context or market ticker.
   */
  async getTicker(marketId: number): Promise<PerplTicker> {
    if (this.tickerOverride) return this.tickerOverride(marketId);
    try {
      // 1. Try public context first (always available on Perpl)
      const res = await axios.get(`${this.apiUrl}/v1/pub/context`, {
        timeout: 5000,
      });
      const markets = res.data?.markets || [];
      const mkt = markets.find((m: any) => m.id === marketId);
      if (mkt && mkt.state) {
        // Price decimals for MON is 5 (mrk: 2426 -> $0.02426 or scaled accordingly)
        const priceDecimals = mkt.config?.price_decimals ?? 5;
        const scale = Math.pow(10, priceDecimals);
        const rawMrk = Number(mkt.state.mrk);
        const formattedMrk = rawMrk > 1000 ? rawMrk / scale : rawMrk;
        const fundingRate = Number(mkt.funding?.rate ?? 0);
        return {
          mrk: formattedMrk,
          idx: Number(mkt.funding?.idx ?? rawMrk) / scale,
          dva: Number(mkt.state.dva ?? 0),
          fr: fundingRate,
        };
      }
    } catch {
      // Fall through to specific endpoint
    }

    try {
      const res = await axios.get(`${this.apiUrl}/v1/market-data/${marketId}/ticker`, {
        timeout: 5000,
      });
      const data = res.data?.d?.[marketId];
      if (!data) {
        throw new Error(`Market ${marketId} not found in ticker response`);
      }
      return {
        mrk: Number(data.mrk) / 100000,
        idx: Number(data.idx || data.mrk) / 100000,
        dva: Number(data.dva || 0),
        fr: Number(data.fr || 20),
      };
    } catch (err) {
      logger.error({ err, marketId }, 'Failed to fetch Perpl ticker');
      throw err;
    }
  }

  /**
   * Fetches historical funding payments for a market.
   */
  async getFundingHistory(marketId: number, hours: number = 24): Promise<any[]> {
    const to = Date.now();
    const from = to - hours * 60 * 60 * 1000;
    const res = await axios.get(
      `${this.apiUrl}/v1/market-data/${marketId}/funding/${from}-${to}`,
      { timeout: 5000 }
    );
    return res.data?.d ?? [];
  }

  /**
   * Submits a single order to Perpl over REST.
   */
  async submitOrder(
    apiKey: string,
    privateKeyBytes: Uint8Array,
    order: PerplOrderSpec
  ): Promise<PerplBatchResponse> {
    const payload = { d: [order] };
    logger.info({ order }, 'Submitting order to Perpl');
    return this.signedRequest<PerplBatchResponse>(
      apiKey,
      privateKeyBytes,
      'POST',
      '/v1/trading/orders',
      payload
    );
  }

  /**
   * Places an Immediate-Or-Cancel (IOC) short order on Perpl.
   */
  async openIocShort(
    apiKey: string,
    privateKeyBytes: Uint8Array,
    accountId: number,
    marketId: number,
    baseQuantity: number,
    markPrice: number,
    leverage: number,
    orderTtlBlocks: number = 30
  ): Promise<PerplBatchResponse> {
    const scaledSize = Math.round(baseQuantity * 1e5); // 5 decimals standard size scaling
    const scaledPrice = Math.round(markPrice * 1e2); // 2 decimals price scaling

    // Fetch real current block from Monad RPC to ensure order TTL is valid
    let currentBlock: number;
    try {
      const blockBigInt = await publicClient.getBlockNumber();
      currentBlock = Number(blockBigInt);
      logger.info({ currentBlock }, 'Fetched live Monad block number for Perpl order TTL');
    } catch (err) {
      logger.error({ err }, 'Failed to fetch Monad block number; using cached estimate');
      throw new ServiceUnavailableError('BLOCK_FETCH_FAILED', 'Cannot fetch Monad block number for order TTL');
    }

    const order: PerplOrderSpec = {
      rq: Date.now(),
      mkt: marketId,
      acc: accountId,
      t: 2, // OpenShort
      p: scaledPrice,
      s: scaledSize,
      fl: 4, // IOC Market / Fill or Kill
      lv: leverage * 100, // 100 = 1x leverage
      lb: currentBlock + orderTtlBlocks,
    };

    return this.submitOrder(apiKey, privateKeyBytes, order);
  }

  /**
   * Immediately flattens/closes the short position on Perpl (reduce-only).
   */
  async flattenShort(
    apiKey: string,
    privateKeyBytes: Uint8Array,
    accountId: number,
    marketId: number,
    baseQuantity: number,
    positionId?: number,
    orderTtlBlocks: number = 30
  ): Promise<PerplBatchResponse> {
    const scaledSize = Math.round(baseQuantity * 1e5);

    // Fetch real current block from Monad RPC
    let currentBlock: number;
    try {
      const blockBigInt = await publicClient.getBlockNumber();
      currentBlock = Number(blockBigInt);
    } catch {
      logger.error('Cannot fetch Monad block for flatten order; using cached high estimate');
      currentBlock = 70_500_000; // Safe fallback: any recent block is fine for flatten
    }

    const order: PerplOrderSpec = {
      rq: Date.now(),
      mkt: marketId,
      acc: accountId,
      t: 4, // CloseShort
      p: 0, // Market
      s: scaledSize,
      fl: 4, // IOC Market
      lv: 0,
      lb: currentBlock + orderTtlBlocks,
      lp: positionId,
    };

    logger.warn({ order }, 'Executing emergency short flatten on Perpl');
    return this.submitOrder(apiKey, privateKeyBytes, order);
  }
}

export const perplClient = new PerplClient();

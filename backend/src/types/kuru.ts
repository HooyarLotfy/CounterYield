export interface KuruMarketParams {
  pricePrecision: bigint;
  sizePrecision: bigint;
  baseAssetAddress: `0x${string}`;
  baseAssetDecimals: bigint;
  quoteAssetAddress: `0x${string}`;
  quoteAssetDecimals: bigint;
  tickSize: bigint;
  minSize: bigint;
  maxSize: bigint;
  takerFeeBps: bigint;
  makerFeeBps: bigint;
}

export interface KuruOrderBookLevel {
  price: number;
  size: number;
}

export interface KuruOrderBookSnapshot {
  bids: KuruOrderBookLevel[];
  asks: KuruOrderBookLevel[];
  blockNumber: number;
  timestamp: number;
}

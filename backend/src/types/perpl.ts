export interface PerplMarketConfig {
  price_decimals: number;
  size_decimals: number;
  order_ttl_blocks: number;
  initial_margin_rate: number;
  maintenance_margin_rate: number;
}

export interface PerplMarket {
  id: number;
  name: string;
  config: PerplMarketConfig;
}

export interface PerplOrderSpec {
  rq: number; // Request ID (must be > account.lfr)
  mkt: number; // Market ID (64 for MON on testnet)
  acc: number; // Account ID
  t: 1 | 2 | 3 | 4 | 5; // 1=OpenLong, 2=OpenShort, 3=CloseLong, 4=CloseShort, 5=Cancel
  p: number; // Price (0 for market)
  s: number; // Scaled Size (size * 10^size_decimals)
  fl: 0 | 1 | 4; // 0=GTC, 1=IOC Limit, 4=IOC Market
  lv: number; // Leverage * 100 (100 for 1x)
  lb: number; // Last execution block (currentBlock + order_ttl_blocks)
  lp?: number; // Position ID (for closing)
  oid?: number; // Order ID (for cancel)
}

export interface PerplOrderStatus {
  code: number; // 0 = accepted for forwarding
  error?: string;
}

export interface PerplBatchResponse {
  status?: { code: number; error: string };
  statuses: PerplOrderStatus[];
}

export interface PerplTicker {
  mrk: number; // Mark price
  idx: number; // Index price
  dva: number; // 24h dollar volume
  fr: number; // Current funding rate (in micros)
}

export interface PerplFundingEvent {
  time: number;
  interval: number;
  ratePct: number;
  indexPrice: number;
  paymentPerLot: number;
}

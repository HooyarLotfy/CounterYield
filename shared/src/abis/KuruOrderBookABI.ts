export const KuruOrderBookABI = [
  {
    type: 'function',
    name: 'placeAndExecuteMarketBuy',
    stateMutability: 'payable',
    inputs: [
      { name: 'quoteAmount', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'isMargin', type: 'bool' },
      { name: 'isFillOrKill', type: 'bool' },
    ],
    outputs: [{ name: 'creditedSize', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'placeAndExecuteMarketSell',
    stateMutability: 'payable',
    inputs: [
      { name: 'baseAmount', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'isMargin', type: 'bool' },
      { name: 'isFillOrKill', type: 'bool' },
    ],
    outputs: [{ name: 'creditedSize', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getMarketParams',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'pricePrecision', type: 'uint256' },
          { name: 'sizePrecision', type: 'uint256' },
          { name: 'baseAssetAddress', type: 'address' },
          { name: 'baseAssetDecimals', type: 'uint256' },
          { name: 'quoteAssetAddress', type: 'address' },
          { name: 'quoteAssetDecimals', type: 'uint256' },
          { name: 'tickSize', type: 'uint256' },
          { name: 'minSize', type: 'uint256' },
          { name: 'maxSize', type: 'uint256' },
          { name: 'takerFeeBps', type: 'uint256' },
          { name: 'makerFeeBps', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'Trade',
    inputs: [
      { name: 'orderId', type: 'uint256', indexed: true },
      { name: 'maker', type: 'address', indexed: true },
      { name: 'taker', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'size', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IKuruOrderBook
 * @notice Interface for Kuru Central Limit Order Book on Monad
 * @dev Deployed at 0xa241896A7Dbe8a550D2E5fF7A914bB1989ceD2D9 (MON-USDC market)
 */
interface IKuruOrderBook {
    struct Order {
        uint64 orderId;
        address owner;
        uint64 size;
        uint64 price;
        bool isBuy;
    }

    event OrderPlaced(
        uint64 indexed orderId,
        address indexed owner,
        uint64 size,
        uint64 price,
        bool isBuy
    );

    event Trade(
        uint64 indexed tradeId,
        address indexed taker,
        address indexed maker,
        uint64 size,
        uint64 price,
        bool isBuy
    );

    function placeAndExecuteMarketBuy(
        uint256 amountIn,
        uint256 minAmountOut,
        bool isMargin,
        bool fillOrKill
    ) external payable returns (uint256 filledAmount);

    function placeAndExecuteMarketSell(
        uint256 amountIn,
        uint256 minAmountOut,
        bool isMargin,
        bool fillOrKill
    ) external returns (uint256 filledAmount);

    function getL2Book() external view returns (
        uint64[] memory buyPrices,
        uint64[] memory buySizes,
        uint64[] memory sellPrices,
        uint64[] memory sellSizes
    );
}

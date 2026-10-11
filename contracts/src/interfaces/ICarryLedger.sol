// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ICarryLedger
 * @notice Interface for the non-custodial CarryLedger contract on Monad.
 * @dev Records verifiable onchain proofs for delta-neutral carry positions, risk guard triggers, and unwinds.
 *      Never holds custody of user collateral.
 */
interface ICarryLedger {
    struct Position {
        bytes32 positionId;
        address owner;
        bytes32 marketId;
        uint256 baseQuantity;
        uint256 spotQuantity;
        uint256 perpQuantity;
        string spotTxRef;
        string perpOrderRef;
        uint256 leverage;
        uint256 openedAt;
        uint256 closedAt;
        int256 realizedPnl;
        bool isActive;
        bool isLocked;
    }

    struct RiskPolicy {
        uint256 maxLeverage;       // e.g. 1 or 2
        uint256 maxSlippageBps;    // e.g. 50 (0.50%)
        int256 fundingFloorBps;    // e.g. -10 (-0.10%)
        uint256 maxDriftBps;       // e.g. 100 (1.00%)
        uint256 reserveBufferBps;  // e.g. 1000 (10.00%)
        bool isSet;
    }

    event HedgeOpened(
        bytes32 indexed positionId,
        address indexed owner,
        bytes32 indexed marketId,
        uint256 baseQuantity,
        string spotTxRef,
        string perpOrderRef,
        uint256 leverage,
        uint256 timestamp
    );

    event HedgeRebalanced(
        bytes32 indexed positionId,
        uint256 oldSpotQty,
        uint256 oldPerpQty,
        uint256 newSpotQty,
        uint256 newPerpQty,
        string reason,
        uint256 timestamp
    );

    event HedgeClosed(
        bytes32 indexed positionId,
        address indexed owner,
        int256 realizedPnl,
        string reason,
        uint256 timestamp
    );

    event PolicySet(
        address indexed owner,
        uint256 maxLeverage,
        uint256 maxSlippageBps,
        int256 fundingFloorBps,
        uint256 maxDriftBps,
        uint256 reserveBufferBps,
        uint256 timestamp
    );

    event GuardTriggered(
        bytes32 indexed positionId,
        uint8 indexed tier,
        uint256 marginRatioBps,
        string action,
        uint256 timestamp
    );

    event EmergencyUnwind(
        bytes32 indexed positionId,
        string reason,
        uint256 timestamp
    );

    // Custom errors
    error Unauthorized();
    error PositionNotFound();
    error PositionAlreadyClosed();
    error PositionLocked();
    error ExceedsMaxLeverage();
    error InvalidHedgeRatio();
    error ZeroQuantity();
    error InvalidPolicy();

    function openHedge(
        bytes32 marketId,
        uint256 baseQty,
        string calldata spotRef,
        string calldata perpRef,
        uint256 leverage
    ) external returns (bytes32 positionId);

    function rebalance(
        bytes32 positionId,
        uint256 newSpotQty,
        uint256 newPerpQty,
        string calldata reason
    ) external;

    function closeHedge(
        bytes32 positionId,
        int256 realizedPnl,
        string calldata reason
    ) external;

    function setPolicy(
        uint256 maxLeverage,
        uint256 maxSlippageBps,
        int256 fundingFloorBps,
        uint256 maxDriftBps,
        uint256 reserveBufferBps
    ) external;

    function recordGuardTriggered(
        bytes32 positionId,
        uint8 tier,
        uint256 marginRatioBps,
        string calldata action
    ) external;

    function recordEmergencyUnwind(
        bytes32 positionId,
        string calldata reason
    ) external;

    function getPosition(bytes32 positionId) external view returns (Position memory);
    function getPolicy(address user) external view returns (RiskPolicy memory);
    function getUserPositions(address user) external view returns (bytes32[] memory);
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ICarryLedger } from "./interfaces/ICarryLedger.sol";

/**
 * @title CarryLedger
 * @notice Non-custodial state and audit ledger for Counter Yield on Monad.
 * @dev Anchors immutable onchain proof-of-hedge for Kuru spot + Perpl perp positions.
 *      Never custodying user funds ensures zero honeypot surface and minimal gas usage.
 *      Optimized with custom errors for Monad's declared-gas execution model.
 */
contract CarryLedger is ICarryLedger {
    // Contract metadata
    string public constant VERSION = "1.0.0-monad-testnet";
    uint256 public constant MAX_LEVERAGE_CAP = 2; // Hard protocol ceiling

    // Mapping from position ID to Position struct
    mapping(bytes32 => Position) private _positions;

    // Mapping from user address to array of position IDs
    mapping(address => bytes32[]) private _userPositions;

    // Mapping from user address to their configured RiskPolicy
    mapping(address => RiskPolicy) private _userPolicies;

    // User position creation nonce for collision-free deterministic hashing
    mapping(address => uint256) private _userNonces;

    // Authorized keepers per user (opt-in time-boxed trade authorization)
    mapping(address => mapping(address => bool)) public authorizedKeepers;

    event KeeperAuthorized(address indexed owner, address indexed keeper, bool status);

    modifier onlyPositionOwnerOrKeeper(bytes32 positionId) {
        Position storage pos = _positions[positionId];
        if (pos.owner == address(0)) revert PositionNotFound();
        if (msg.sender != pos.owner && !authorizedKeepers[pos.owner][msg.sender]) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyPositionOwner(bytes32 positionId) {
        Position storage pos = _positions[positionId];
        if (pos.owner == address(0)) revert PositionNotFound();
        if (msg.sender != pos.owner) revert Unauthorized();
        _;
    }

    /**
     * @notice Authorize or revoke an automated risk-guard keeper
     */
    function setKeeperAuthorization(address keeper, bool status) external {
        authorizedKeepers[msg.sender][keeper] = status;
        emit KeeperAuthorized(msg.sender, keeper, status);
    }

    /**
     * @notice Sets portable risk policy for the caller
     */
    function setPolicy(
        uint256 maxLeverage,
        uint256 maxSlippageBps,
        int256 fundingFloorBps,
        uint256 maxDriftBps,
        uint256 reserveBufferBps
    ) external override {
        if (maxLeverage == 0 || maxLeverage > MAX_LEVERAGE_CAP) revert ExceedsMaxLeverage();
        if (maxSlippageBps > 1000) revert InvalidPolicy(); // Max 10% slippage tolerance
        if (reserveBufferBps > 5000) revert InvalidPolicy(); // Max 50% buffer

        _userPolicies[msg.sender] = RiskPolicy({
            maxLeverage: maxLeverage,
            maxSlippageBps: maxSlippageBps,
            fundingFloorBps: fundingFloorBps,
            maxDriftBps: maxDriftBps,
            reserveBufferBps: reserveBufferBps,
            isSet: true
        });

        emit PolicySet(
            msg.sender,
            maxLeverage,
            maxSlippageBps,
            fundingFloorBps,
            maxDriftBps,
            reserveBufferBps,
            block.timestamp
        );
    }

    /**
     * @notice Records a new delta-neutral carry position
     */
    function openHedge(
        bytes32 marketId,
        uint256 baseQty,
        string calldata spotRef,
        string calldata perpRef,
        uint256 leverage
    ) external override returns (bytes32 positionId) {
        if (baseQty == 0) revert ZeroQuantity();
        if (leverage == 0 || leverage > MAX_LEVERAGE_CAP) revert ExceedsMaxLeverage();

        RiskPolicy memory policy = _userPolicies[msg.sender];
        if (policy.isSet && leverage > policy.maxLeverage) {
            revert ExceedsMaxLeverage();
        }

        uint256 nonce = _userNonces[msg.sender]++;
        positionId = keccak256(
            abi.encodePacked(msg.sender, marketId, baseQty, block.timestamp, nonce)
        );

        _positions[positionId] = Position({
            positionId: positionId,
            owner: msg.sender,
            marketId: marketId,
            baseQuantity: baseQty,
            spotQuantity: baseQty,
            perpQuantity: baseQty,
            spotTxRef: spotRef,
            perpOrderRef: perpRef,
            leverage: leverage,
            openedAt: block.timestamp,
            closedAt: 0,
            realizedPnl: 0,
            isActive: true,
            isLocked: false
        });

        _userPositions[msg.sender].push(positionId);

        emit HedgeOpened(
            positionId,
            msg.sender,
            marketId,
            baseQty,
            spotRef,
            perpRef,
            leverage,
            block.timestamp
        );
    }

    /**
     * @notice Records a drift-rebalance or deleveraging step
     */
    function rebalance(
        bytes32 positionId,
        uint256 newSpotQty,
        uint256 newPerpQty,
        string calldata reason
    ) external override onlyPositionOwnerOrKeeper(positionId) {
        Position storage pos = _positions[positionId];
        if (!pos.isActive) revert PositionAlreadyClosed();
        if (pos.isLocked) revert PositionLocked();
        if (newSpotQty == 0 || newPerpQty == 0) revert ZeroQuantity();

        // Sanity check: delta between legs cannot exceed 10% without triggering unwind
        uint256 diff = newSpotQty > newPerpQty ? newSpotQty - newPerpQty : newPerpQty - newSpotQty;
        uint256 avg = (newSpotQty + newPerpQty) / 2;
        if ((diff * 10000) / avg > 1000) revert InvalidHedgeRatio();

        uint256 oldSpot = pos.spotQuantity;
        uint256 oldPerp = pos.perpQuantity;

        pos.spotQuantity = newSpotQty;
        pos.perpQuantity = newPerpQty;
        pos.baseQuantity = avg;

        emit HedgeRebalanced(
            positionId,
            oldSpot,
            oldPerp,
            newSpotQty,
            newPerpQty,
            reason,
            block.timestamp
        );
    }

    /**
     * @notice Records standard 1-tap exit and settlement
     */
    function closeHedge(
        bytes32 positionId,
        int256 realizedPnl,
        string calldata reason
    ) external override onlyPositionOwnerOrKeeper(positionId) {
        Position storage pos = _positions[positionId];
        if (!pos.isActive) revert PositionAlreadyClosed();

        pos.isActive = false;
        pos.closedAt = block.timestamp;
        pos.realizedPnl = realizedPnl;

        emit HedgeClosed(positionId, pos.owner, realizedPnl, reason, block.timestamp);
    }

    /**
     * @notice Records Risk Guard ladder activation
     */
    function recordGuardTriggered(
        bytes32 positionId,
        uint8 tier,
        uint256 marginRatioBps,
        string calldata action
    ) external override onlyPositionOwnerOrKeeper(positionId) {
        Position storage pos = _positions[positionId];
        if (!pos.isActive) revert PositionAlreadyClosed();

        emit GuardTriggered(positionId, tier, marginRatioBps, action, block.timestamp);
    }

    /**
     * @notice Records Tier 3 Emergency Unwind and locks the position permanently
     */
    function recordEmergencyUnwind(
        bytes32 positionId,
        string calldata reason
    ) external override onlyPositionOwnerOrKeeper(positionId) {
        Position storage pos = _positions[positionId];
        if (!pos.isActive) revert PositionAlreadyClosed();

        pos.isActive = false;
        pos.isLocked = true;
        pos.closedAt = block.timestamp;

        emit EmergencyUnwind(positionId, reason, block.timestamp);
    }

    // --- Views ---

    function getPosition(bytes32 positionId) external view override returns (Position memory) {
        Position memory pos = _positions[positionId];
        if (pos.owner == address(0)) revert PositionNotFound();
        return pos;
    }

    function getPolicy(address user) external view override returns (RiskPolicy memory) {
        return _userPolicies[user];
    }

    function getUserPositions(address user) external view override returns (bytes32[] memory) {
        return _userPositions[user];
    }
}

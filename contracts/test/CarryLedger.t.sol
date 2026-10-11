// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, console2 } from "forge-std/Test.sol";
import { CarryLedger } from "../src/CarryLedger.sol";
import { ICarryLedger } from "../src/interfaces/ICarryLedger.sol";

contract CarryLedgerTest is Test {
    CarryLedger public ledger;
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);
    address public keeper = address(0x9999);

    bytes32 public constant MON_MARKET_ID = bytes32("MON-PERP-64");

    function setUp() public {
        ledger = new CarryLedger();
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
        vm.label(keeper, "Keeper");
    }

    function test_OpenHedge_Success() public {
        vm.startPrank(alice);
        
        bytes32 posId = ledger.openHedge(
            MON_MARKET_ID,
            1 ether,
            "0xspot_hash_1",
            "perpl_order_ref_1",
            1
        );

        ICarryLedger.Position memory pos = ledger.getPosition(posId);
        assertEq(pos.owner, alice);
        assertEq(pos.baseQuantity, 1 ether);
        assertEq(pos.spotQuantity, 1 ether);
        assertEq(pos.perpQuantity, 1 ether);
        assertEq(pos.leverage, 1);
        assertTrue(pos.isActive);
        assertFalse(pos.isLocked);

        bytes32[] memory positions = ledger.getUserPositions(alice);
        assertEq(positions.length, 1);
        assertEq(positions[0], posId);

        vm.stopPrank();
    }

    function test_OpenHedge_ExceedsMaxLeverage_Reverts() public {
        vm.startPrank(alice);
        // Protocol max leverage cap is 2
        vm.expectRevert(ICarryLedger.ExceedsMaxLeverage.selector);
        ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 3);
        vm.stopPrank();
    }

    function test_SetPolicy_EnforcesUserLeverage() public {
        vm.startPrank(alice);
        // User sets max leverage to 1x
        ledger.setPolicy(1, 50, 0, 100, 1000);

        ICarryLedger.RiskPolicy memory policy = ledger.getPolicy(alice);
        assertTrue(policy.isSet);
        assertEq(policy.maxLeverage, 1);

        // Trying 2x leverage should revert due to policy
        vm.expectRevert(ICarryLedger.ExceedsMaxLeverage.selector);
        ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 2);

        // 1x should succeed
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);
        assertTrue(posId != bytes32(0));

        vm.stopPrank();
    }

    function test_Rebalance_Success() public {
        vm.startPrank(alice);
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);

        // Rebalance to 0.95 ether on both legs (proportional deleverage)
        ledger.rebalance(posId, 0.95 ether, 0.95 ether, "DRIFT_CORRECTION");

        ICarryLedger.Position memory pos = ledger.getPosition(posId);
        assertEq(pos.spotQuantity, 0.95 ether);
        assertEq(pos.perpQuantity, 0.95 ether);

        vm.stopPrank();
    }

    function test_Rebalance_InvalidHedgeRatio_Reverts() public {
        vm.startPrank(alice);
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);

        // Legs differ by > 10% (1.0 vs 0.8) -> should revert to preserve delta neutrality
        vm.expectRevert(ICarryLedger.InvalidHedgeRatio.selector);
        ledger.rebalance(posId, 1 ether, 0.8 ether, "UNBALANCED_DRIFT");

        vm.stopPrank();
    }

    function test_CloseHedge_Success() public {
        vm.startPrank(alice);
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);

        ledger.closeHedge(posId, 25 ether, "USER_REQUESTED");

        ICarryLedger.Position memory pos = ledger.getPosition(posId);
        assertFalse(pos.isActive);
        assertEq(pos.realizedPnl, 25 ether);
        assertTrue(pos.closedAt > 0);

        // Trying to rebalance or close again reverts
        vm.expectRevert(ICarryLedger.PositionAlreadyClosed.selector);
        ledger.rebalance(posId, 0.9 ether, 0.9 ether, "FAIL");

        vm.stopPrank();
    }

    function test_GuardTriggered_And_EmergencyUnwind() public {
        vm.startPrank(alice);
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);

        // Tier 1 trigger event
        ledger.recordGuardTriggered(posId, 1, 5800, "RESERVE_TOP_UP");

        // Tier 3 Emergency Unwind event
        ledger.recordEmergencyUnwind(posId, "MARGIN_CRITICAL_BELOW_25_PCT");

        ICarryLedger.Position memory pos = ledger.getPosition(posId);
        assertFalse(pos.isActive);
        assertTrue(pos.isLocked);

        // Once locked, rebalancing reverts with PositionAlreadyClosed or PositionLocked
        vm.expectRevert(ICarryLedger.PositionAlreadyClosed.selector);
        ledger.rebalance(posId, 0.5 ether, 0.5 ether, "AFTER_LOCK");

        vm.stopPrank();
    }

    function test_AuthorizedKeeper_Can_Manage() public {
        vm.prank(alice);
        ledger.setKeeperAuthorization(keeper, true);

        vm.prank(alice);
        bytes32 posId = ledger.openHedge(MON_MARKET_ID, 1 ether, "ref1", "ref2", 1);

        // Keeper can record guard action
        vm.prank(keeper);
        ledger.recordGuardTriggered(posId, 2, 3800, "DELEVERAGE_TRIGGER");

        // Bob (unauthorized) cannot touch it
        vm.prank(bob);
        vm.expectRevert(ICarryLedger.Unauthorized.selector);
        ledger.recordGuardTriggered(posId, 2, 3800, "ATTACK");
    }
}

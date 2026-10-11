// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { CarryLedger } from "../src/CarryLedger.sol";

/**
 * @title GasBenchmark
 * @notice Measures exact gas consumption on Monad to derive declared gas limits.
 * @dev Monad charges based on declared gasLimit rather than actual gasUsed.
 *      Counter Yield uses these benchmarks to avoid gas overpayment.
 */
contract GasBenchmark is Script {
    function run() external {
        CarryLedger ledger = new CarryLedger();

        bytes32 marketId = bytes32("MON-PERP-64");

        // 1. Benchmark openHedge
        uint256 g0 = gasleft();
        bytes32 posId = ledger.openHedge(marketId, 1 ether, "0xspot1", "0xperp1", 1);
        uint256 gasOpen = g0 - gasleft();
        console2.log("Gas used for openHedge:", gasOpen);

        // 2. Benchmark rebalance
        g0 = gasleft();
        ledger.rebalance(posId, 0.98 ether, 0.98 ether, "DRIFT_CORRECTION");
        uint256 gasRebalance = g0 - gasleft();
        console2.log("Gas used for rebalance:", gasRebalance);

        // 3. Benchmark recordGuardTriggered
        g0 = gasleft();
        ledger.recordGuardTriggered(posId, 1, 5900, "RESERVE_TOP_UP");
        uint256 gasGuard = g0 - gasleft();
        console2.log("Gas used for recordGuardTriggered:", gasGuard);

        // 4. Benchmark closeHedge
        g0 = gasleft();
        ledger.closeHedge(posId, 10 ether, "USER_REQUESTED");
        uint256 gasClose = g0 - gasleft();
        console2.log("Gas used for closeHedge:", gasClose);

        console2.log("--- RECOMMENDED MONAD DECLARED GAS LIMITS ---");
        console2.log("openHedge limit:          ", (gasOpen * 115) / 100);
        console2.log("rebalance limit:          ", (gasRebalance * 115) / 100);
        console2.log("recordGuardTriggered limit:", (gasGuard * 115) / 100);
        console2.log("closeHedge limit:         ", (gasClose * 115) / 100);
    }
}

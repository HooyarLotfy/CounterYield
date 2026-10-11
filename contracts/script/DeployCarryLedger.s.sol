// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { CarryLedger } from "../src/CarryLedger.sol";

contract DeployCarryLedger is Script {
    function run() external returns (address deployedAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        CarryLedger ledger = new CarryLedger();
        console2.log("CarryLedger deployed to Monad Testnet at:", address(ledger));
        console2.log("Deployed with Version:", ledger.VERSION());

        vm.stopBroadcast();
        return address(ledger);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MerkleApp.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY"); // 从 .env 读取或 export PRIVATE_KEY=...
        vm.startBroadcast(pk);

        bytes32 root = 0x0f6ff0475dbd389bada8bd6affaac809aaa638af73cafac4a3884ef6954b0b91; // 用 Node 脚本输出的 Merkle Root
        new MerkleApp(root);

        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "../src/L1Contract.sol";
import "../src/MintToken.sol";

contract DeployBridge is Script {
    function run() external {
        
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");
        //uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        require(deployerPrivateKey != 0, "PRIVATE_KEY not set");
        vm.startBroadcast(deployerPrivateKey);
        address deployer = vm.addr(deployerPrivateKey);
        L1Contract l1Contract = new L1Contract();
        vm.stopBroadcast();
        console.log("L1Contract deployed at:", address(l1Contract));
        vm.startBroadcast(deployerPrivateKey);
        MintTokenERC20 mintToken = new MintTokenERC20();
        vm.stopBroadcast();
        console.log("MintToken deployed at:", address(mintToken));
    }
}

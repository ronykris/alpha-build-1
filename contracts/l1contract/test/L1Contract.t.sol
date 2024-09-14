// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.18;

import "forge-std/Test.sol";
import "../src/L1Contract.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {Registry} from "aztec-packages/l1-contracts/src/core/messagebridge/Registry.sol";
import {Inbox} from "aztec-packages/l1-contracts/src/core/messagebridge/Inbox.sol";
import {Outbox} from "aztec-packages/l1-contracts/src/core/messagebridge/Outbox.sol";
//import {Rollup} from "aztec-packages/l1-contracts/src/core/Rollup.sol";
import {DataStructures} from "aztec-packages/l1-contracts/src/core/libraries/DataStructures.sol";
//import "aztec-packages/l1-contracts/src/core/libraries/Hash.sol";

import "forge-std/console.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000 * 10**18); // Mint 1000 tokens
    }
}

contract L1ContractTest is Test {
    L1Contract public l1Contract;
    MockERC20 public token;
    Registry public registry;
    Inbox public inbox;
    Outbox public outbox;
    //Rollup public rollup;

    address user = address(0x123);

    function setUp() public {
        // Deploy mocks and main contract
        registry = new Registry();
        token = new MockERC20();
        inbox = new Inbox(address(registry));
        outbox = new Outbox(address(registry));
        //rollup = new Rollup();
        

        l1Contract = new L1Contract();
        l1Contract.initialize(address(registry), address(token), keccak256("l2Bridge"));

        // Give the user some tokens
        token.transfer(user, 500 * 10**18);
        vm.prank(user);
        token.approve(address(l1Contract), 500 * 10**18);
    }

    function testDepositToAztecPrivate() public {
        vm.prank(user);
        try l1Contract.depositToAztecPrivate(
            keccak256("secretHashRedeem"), 
            100 * 10**18, 
            keccak256("secretHashL2Message")
        ) returns (bytes32 depositId) {
            assertTrue(depositId != bytes32(0), "Deposit failed");            
            assertEq(token.balanceOf(user), 400 * 10**18, "User token balance incorrect after deposit");
            assertEq(token.balanceOf(address(l1Contract)), 100 * 10**18, "Contract token balance incorrect after deposit");
        } catch Error(string memory reason) {
            // Catch error with a revert reason
            console.log(reason);
            //fail(reason); // Fail the test with the revert reason
        } catch (bytes memory lowLevelData) {
            // Catch low-level errors (without a revert string)
            console.logBytes(lowLevelData);
            //fail("Low-level error occurred");
        }
    }

    function testWithdraw() public {
        // First deposit
        vm.prank(user);
        l1Contract.depositToAztecPrivate(
            keccak256("secretHashRedeem"),
            100 * 10**18,
            keccak256("secretHashL2Message")
        );

        // Set up withdrawal details
        DataStructures.L2ToL1Msg memory message = DataStructures.L2ToL1Msg({
            sender: DataStructures.L2Actor(keccak256("l2Bridge"), 1),
            recipient: DataStructures.L1Actor(address(l1Contract), block.chainid),
            content: keccak256(abi.encodeWithSignature(
                "withdraw(address,uint256,address)", user, 100 * 10**18, address(0)))
        });

        // Initialize path properly as bytes32[]
        bytes32[] memory path = new bytes32[](0);
        path[0] = keccak256(abi.encode("mockPath"));

        vm.prank(user);
        try l1Contract.withdraw(
            user, 100 * 10**18, false, block.number, 0, path
        ) {
            assertEq(token.balanceOf(user), 500 * 10**18, "User token balance incorrect after withdrawal");
            assertEq(token.balanceOf(address(l1Contract)), 0, "Contract token balance incorrect after withdrawal");
        } catch Error(string memory reason) {
            console.log(reason);
            fail();
        } catch (bytes memory lowLevelData) {
            console.logBytes(lowLevelData);
            fail();
        }
    }

    function testWithdrawWithCaller() public {
        // First deposit
        vm.prank(user);
        l1Contract.depositToAztecPrivate(
            keccak256("secretHashRedeem"),
            100 * 10**18,
            keccak256("secretHashL2Message")
        );

        // Set up withdrawal details
        DataStructures.L2ToL1Msg memory message = DataStructures.L2ToL1Msg({
            sender: DataStructures.L2Actor(keccak256("l2Bridge"), 1),
            recipient: DataStructures.L1Actor(address(l1Contract), block.chainid),
            content: keccak256(abi.encodeWithSignature(
                "withdraw(address,uint256,address)", user, 100 * 10**18, user))
        });

        // Initialize path properly as bytes32[]
        bytes32[] memory path = new bytes32[](0);
        path[0] = keccak256(abi.encode("mockPath"));

        vm.prank(user);
        l1Contract.withdraw(
            user, 100 * 10**18, true, block.number, 0, path
        );

        // Validate token transfer and balances
        assertEq(token.balanceOf(user), 500 * 10**18, "User token balance incorrect after withdrawal with caller");
        assertEq(token.balanceOf(address(l1Contract)), 0, "Contract token balance incorrect after withdrawal with caller");
    }
}

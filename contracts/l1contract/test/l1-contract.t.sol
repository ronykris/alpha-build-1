// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/l1-contract.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Registry} from "@aztec/core/messagebridge/Registry.sol";
import {Inbox} from "@aztec/core/messagebridge/Inbox.sol";
import {Outbox} from "@aztec/core/messagebridge/Outbox.sol";


contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract L1ContractTest is Test {
    L1Contract public l1Contract;
    Registry public registry;
    Inbox public inbox;
    Outbox public outbox;
    MockToken public token;
    address public user = address(0x1);
    bytes32 public l2Bridge = bytes32(uint256(uint160(address(0x2))));

    function setUp() public {
        registry = new Registry();
        inbox = new Inbox(address(registry));
        outbox = new Outbox(address(registry));
        
        token = new MockToken();
        
        l1Contract = new L1Contract();
        l1Contract.initialize(address(registry), address(token), l2Bridge);

        token.transfer(user, 1000 * 10**18);
    }

    function testInitialize() public {
        assertEq(address(l1Contract.registry()), address(registry));
        assertEq(address(l1Contract.underlying()), address(token));
        assertEq(l1Contract.l2Bridge(), l2Bridge);
    }

    function testDepositToAztecPrivate() public {
        vm.startPrank(user);
        token.approve(address(l1Contract), 100 * 10**18);

        bytes32 secretHashForRedeemingMintedNotes = keccak256("secret1");
        uint256 amount = 100 * 10**18;
        bytes32 secretHashForL2MessageConsumption = keccak256("secret2");

        uint256 balanceBefore = token.balanceOf(address(l1Contract));
        bytes32 messageHash = l1Contract.depositToAztecPrivate(
            secretHashForRedeemingMintedNotes,
            amount,
            secretHashForL2MessageConsumption
        );

        uint256 balanceAfter = token.balanceOf(address(l1Contract));
        assertEq(balanceAfter - balanceBefore, amount);
        assertTrue(messageHash != bytes32(0));

        vm.stopPrank();
    }

    function testWithdraw() public {
        uint256 withdrawAmount = 50 * 10**18;
        address recipient = address(0x3);

        // First, deposit some tokens to the contract
        token.transfer(address(l1Contract), withdrawAmount);

        // Prepare withdrawal parameters
        bool withCaller = true;
        uint256 l2BlockNumber = 1234;
        uint256 leafIndex = 5678;
        bytes32[] memory path = new bytes32[](0);

        uint256 recipientBalanceBefore = token.balanceOf(recipient);
        
        l1Contract.withdraw(
            recipient,
            withdrawAmount,
            withCaller,
            l2BlockNumber,
            leafIndex,
            path
        );

        uint256 recipientBalanceAfter = token.balanceOf(recipient);
        assertEq(recipientBalanceAfter - recipientBalanceBefore, withdrawAmount);
    }

    function testWithdrawUnauthorized() public {
        uint256 withdrawAmount = 50 * 10**18;
        address recipient = address(0x3);

        // First, deposit some tokens to the contract
        token.transfer(address(l1Contract), withdrawAmount);

        // Prepare withdrawal parameters
        bool withCaller = true;
        uint256 l2BlockNumber = 1234;
        uint256 leafIndex = 5678;
        bytes32[] memory path = new bytes32[](0);

        // Try to withdraw as an unauthorized user
        vm.prank(address(0x4));
        vm.expectRevert();
        l1Contract.withdraw(
            recipient,
            withdrawAmount,
            withCaller,
            l2BlockNumber,
            leafIndex,
            path
        );
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@aztec/protocol/contracts/interfaces/IVerifier.sol";

contract AztecBridge is ReentrancyGuard {
    IERC20 public token;
    IVerifier public verifier;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
}
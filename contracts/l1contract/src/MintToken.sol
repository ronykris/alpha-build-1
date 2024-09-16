// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintTokenERC20 is ERC20 {
  constructor() ERC20("Portal", "PORTAL") {}

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
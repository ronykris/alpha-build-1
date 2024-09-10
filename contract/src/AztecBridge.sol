// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAztecVerifier {
    function verifyProof(
        uint256[] calldata publicInputs,
        bytes calldata proof
    ) external view returns (bool);
}

contract AztecBridge is ReentrancyGuard {
    IERC20 public token;
    IAztecVerifier public aztecVerifier;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(address _token, address _aztecVerifier) {
        token = IERC20(_token);
        aztecVerifier = IAztecVerifier(_aztecVerifier);
    }

    function deposit(uint256 amount) external nonReentrant{
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed!");
        emit Deposit(msg.sender, amount);
    }

    function withdrawal(uint256 amount, bytes calldata aztecProof) external nonReentrant{
        require(verifyAztecProof(aztecProof, amount, msg.sender), "Invalid proof!");
        require(token.transfer(msg.sender, amount), "Transfer failed!");
        emit Withdrawal(msg.sender, amount);
    }

    function verifyAztecProof(bytes calldata proof, uint256 amount, address user) internal view returns (bool) {
        uint256[] memory publicInputs = new uint256[](3);
        publicInputs[0] = uint256(uint160(user));
        publicInputs[1] = amount;
        publicInputs[2] = uint256(block.timestamp); 
        bool isValid = aztecVerifier.verifyProof(publicInputs, proof);
        return isValid;
    }
}
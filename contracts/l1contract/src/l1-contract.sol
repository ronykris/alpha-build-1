// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Messaging
import {IRegistry} from "aztec-packages/l1-contracts/src/core/interfaces/messagebridge/IRegistry.sol";
import {IInbox} from "aztec-packages/l1-contracts/src/core/interfaces/messagebridge/IInbox.sol";
import {IOutbox} from "aztec-packages/l1-contracts/src/core/interfaces/messagebridge/IOutbox.sol";
import {DataStructures} from "aztec-packages/l1-contracts/src/core/libraries/DataStructures.sol";
import {Hash} from "aztec-packages/l1-contracts/src/core/libraries/Hash.sol";

contract L1Contract {
    using SafeERC20 for IERC20;

    IRegistry public registry;
    IERC20 public underlying;
    bytes32 public l2Bridge;

    function initialize(address _registry, address _underlying, bytes32 _l2Bridge) external {
        registry = IRegistry(_registry);
        underlying = IERC20(_underlying);
        l2Bridge = _l2Bridge;
    }

    function depositToAztecPrivate(
        bytes32 _secretHashForRedeemingMintedNotes,
        uint256 _amount,
        bytes32 _secretHashForL2MessageConsumption
    ) external returns (bytes32) {
        // Preamble
        //IInbox inbox = registry.getRollup().INBOX();
        IInbox inbox = registry.getInbox();
        DataStructures.L2Actor memory actor = DataStructures.L2Actor(l2Bridge, 1);

        // Hash the message content to be reconstructed in the receiving contract
        bytes32 contentHash = Hash.sha256ToField(
            abi.encodeWithSignature(
                "mint_private(bytes32,uint256)", _secretHashForRedeemingMintedNotes, _amount
            )
        );

        // Hold the tokens in the portal
        underlying.safeTransferFrom(msg.sender, address(this), _amount);

        // Send message to rollup
        uint32 deadline = uint32(block.timestamp + 1 days);
        return inbox.sendL2Message(actor, deadline, contentHash, _secretHashForL2MessageConsumption);
    }

    function withdraw(
        address _recipient,
        uint256 _amount,
        bool _withCaller,
        uint256 _l2BlockNumber,
        uint256 _leafIndex,
        bytes32[] calldata _path
    ) external {
        DataStructures.L2ToL1Msg memory message = DataStructures.L2ToL1Msg({
            sender: DataStructures.L2Actor(l2Bridge, 1),
            recipient: DataStructures.L1Actor(address(this), block.chainid),
            content: Hash.sha256ToField(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                _recipient,
                _amount,
                _withCaller ? msg.sender : address(0)
            ))
        });

        IOutbox outbox = registry.getOutbox();

        //outbox.consume(message, _l2BlockNumber, _leafIndex, _path);
        outbox.consume(message);

        underlying.transfer(_recipient, _amount);
    }
}
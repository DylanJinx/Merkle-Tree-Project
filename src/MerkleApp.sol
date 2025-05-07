// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleApp is Ownable {
    bytes32 public merkleRoot;
    address public latest_user;

    event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);
    event LatestUserUpdated(address indexed user);

    constructor(bytes32 _root) Ownable(msg.sender) {
        merkleRoot = _root;
    }

    function setRoot(bytes32 _root) external onlyOwner {
        bytes32 oldRoot = merkleRoot;
        merkleRoot = _root;
        emit RootUpdated(oldRoot, _root);
    }

    function updateLatestUser(bytes32[] calldata proof) external {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verifyCalldata(proof, merkleRoot, leaf), "NotAuthorized");
        latest_user = msg.sender;
        emit LatestUserUpdated(msg.sender);
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }
}

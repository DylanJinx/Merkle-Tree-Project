// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MerkleApp.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/Hashes.sol";

contract MerkleAppTest is Test {
    MerkleApp internal app;

    address internal owner = address(0xABCD);
    address internal user1 = address(0x1234);
    address internal user2 = address(0x5678);
    address internal outsider = address(0x9ABC);

    bytes32 internal leaf1;
    bytes32 internal leaf2;
    bytes32 internal root;

    function setUp() public {
        // leaves
        leaf1 = keccak256(abi.encodePacked(user1));
        leaf2 = keccak256(abi.encodePacked(user2));

        // root
        root = Hashes.commutativeKeccak256(leaf1, leaf2);

        vm.prank(owner);
        app = new MerkleApp(root);
    }

    function _proofForUser1() internal view returns (bytes32[] memory) {
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leaf2;
        return proof;
    }

    function testConstructor() public view {
        assertEq(app.owner(), owner);
        assertEq(app.merkleRoot(), root);
    }

    function testOwnerCanSetRoot() public {
        bytes32 newRoot = keccak256(abi.encodePacked("new-root"));
        vm.prank(owner);
        app.setRoot(newRoot);
        assertEq(app.merkleRoot(), newRoot);
    }

    function testNonOwnerCannotSetRoot() public {
        bytes32 newRoot = keccak256(abi.encodePacked("new-root"));
        vm.prank(outsider);
        vm.expectRevert();
        app.setRoot(newRoot);
    }

    function testUpdateLatestUserSuccess() public {
        bytes32[] memory proof = _proofForUser1();
        vm.prank(user1);
        app.updateLatestUser(proof);
        assertEq(app.latest_user(), user1);
    }

    function testUpdateFail_NotInTree() public {
        bytes32[] memory emptyProof = new bytes32[](0);
        vm.prank(outsider);
        vm.expectRevert(bytes("NotAuthorized"));
        app.updateLatestUser(emptyProof);
    }

    function testUpdateFail_BadProof() public {
        // 给 user1 一个空 proof
        bytes32[] memory badProof = new bytes32[](0);
        vm.prank(user1);
        vm.expectRevert(bytes("NotAuthorized"));
        app.updateLatestUser(badProof);
    }
}

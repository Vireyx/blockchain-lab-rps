// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RockPaperScissors is ReentrancyGuard {
    address public owner;
    uint256 public minBet = 1000000000000 wei; // 0.000001 BNB

    event GamePlayed(
        address player,
        uint8 playerChoice,
        uint8 computerChoice,
        string result,
        uint256 reward
    );

    constructor() payable {
        owner = msg.sender;
    }

    function playGame(uint8 _choice) public payable nonReentrant returns (string memory) {
        require(_choice <= 2, "Choice must be 0, 1 or 2");
        require(msg.value >= minBet, "Bet is too small");

        // 0 = rock, 1 = scissors, 2 = paper
        uint8 computerChoice = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
                )
            ) % 3
        );

        string memory result;
        uint256 reward = 0;

        if (_choice == computerChoice) {
            result = "draw";
            reward = msg.value;
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
        } else if (
            (_choice == 0 && computerChoice == 1) ||
            (_choice == 1 && computerChoice == 2) ||
            (_choice == 2 && computerChoice == 0)
        ) {
            result = "win";
            reward = msg.value * 2;
            require(address(this).balance >= reward, "Not enough contract balance");
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
        } else {
            result = "lose";
            reward = 0;
        }

        emit GamePlayed(msg.sender, _choice, computerChoice, result, reward);
        return result;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public nonReentrant {
        require(msg.sender == owner, "Only owner");
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract coinFlipper is ReentrancyGuard {

    address public owner;
    uint public randomNumber;

    event GamePlayed(address player, bool isWinner);

    // payable — чтобы при деплое можно было сразу отправить BNB на контракт
    constructor() payable {
        owner = msg.sender;
    }

    function playGame(uint _side) public nonReentrant payable returns (bool) {
        require(msg.value >= 1000000000000 wei, "safe your balance");
        require(_side == 0 || _side == 1, "Side must be 0 or 1");

        randomNumber = block.timestamp % 2;

        if (randomNumber == _side) {
            require(address(this).balance >= msg.value * 2, "Not enough balance");

            (bool success, ) = payable(msg.sender).call{value: msg.value * 2}("");
            require(success, "Transfer failed");

            emit GamePlayed(msg.sender, true);
            return true;
        } else {
            emit GamePlayed(msg.sender, false);
            return false;
        }
    }

    function withdraw() public nonReentrant {
        require(msg.sender == owner, "You are not owner");

        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    receive() external payable {}
}

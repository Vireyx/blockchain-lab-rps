// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Note {
    string private note;

    event NoteUpdated(string newNote, uint256 timestamp);

    function setNote(string memory _note) public {
        note = _note;
        emit NoteUpdated(_note, block.timestamp);
    }

    function getNote() public view returns (string memory) {
        return note;
    }
}

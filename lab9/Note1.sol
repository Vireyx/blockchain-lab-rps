// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Note {
    string private note;
    
    function setNote(string memory _note) public {
        note = _note;
    }
    
    function getNote() public view returns (string memory) {
        return note;
    }
}

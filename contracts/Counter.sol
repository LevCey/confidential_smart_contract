// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint32 private _count;

    function getCount() external view returns (uint32) {
        return _count;
    }

    function increment(uint32 value) external {
        _count += value;
    }

    function decrement(uint32 value) external {
        require(_count >= value, "Counter: cannot decrement below zero");
        _count -= value;
    }
}

pragma solidity ^0.5.0;

contract ContractOne {
    uint256 public lucky_number = 10; // State variable

    constructor() public {}

    function update_number(uint256 num) internal {
        // modify state
        lucky_number = num;
    }

    function getResult() public returns (uint256) {
        uint256 a = 1;
        uint256 b = 2;
        uint256 result = a + b;
        update_number(result);
        return result;
    }
}

contract ContractTwo {
    constructor() public {}

    function check_bool(bool val) public pure returns (bool) {
        if (val == true) {
            return true;
        }

        if (val == false) {
            return false;
        }
    }

    function check_size(uint256 a, uint256 b) public pure returns (bool) {
        if (a >= b) {
            return true;
        }

        if (a <= b) {
            return false;
        }
    }
}

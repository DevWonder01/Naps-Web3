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
    uint public fixedBalanceExplicit[10] = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0];


    
    function testArray() public pure {
        uint256 len = 7;

        //dynamic array
        uint256[] memory a = new uint256[](7);

        //bytes is same as byte[]
        bytes memory b = new bytes(len);

        assert(a.length == 7);
        assert(b.length == len);

        //access array variable
        a[6] = 8;

        //test array variable
        assert(a[6] == 8);

        //static array
        uint256[3] memory c = [uint256(1), 2, 3];
        assert(c.length == 3);
    }

}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

c// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CustomArray {
    uint256[] public array = new uint256[](7);

    function get_array_length() public view returns (uint256) {
        return array.length;
    }

    function update_array() public {
        array[1] = 1;
        array[1] = 2;
        array[2] = 3;
        array[3] = 4;
        array[4] = 5;
        array[5] = 6;
        array[6] = 7;
    }


    function get_element(uint256 val) public view returns (uint256) {
        require(val < array.length, "Index out of bounds");

        return array[val];
    }

    function set_element(uint256 index, uint256 val) public returns (uint256) {
        require(index < array.length, "Index out of bounds");
        array[index] = val;
        return array[index];
    }

 
}

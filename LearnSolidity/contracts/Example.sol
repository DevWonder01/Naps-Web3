// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Example {
    int public age = 50;
    int shoeSize = 25;
    uint beltSize = 40;
    string  name = "Taiwo";    
    bool status = true;

    function sumOf2Numbers (int256 a, int256 b) public
     pure returns (int256) {
        int256 c = a + b;
        return c;
    }


}

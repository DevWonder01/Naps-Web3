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



contract CustomArray {
    uint256[] public array = new uint256[](7);

    function get_array_length() public view returns (uint256) {
        return array.length;
    }

    function update_array() public {
        array[0] = 1;
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


contract Structs {
    struct Book {
        string title;
        string author;
        uint256 book_id;
    }

    // Access starts here 👇👇👇
    // structname and struct variable name
    Book myBook;

    function setBook(
        string memory _title,
        string memory _author,
        uint256 _id
    ) public {
        myBook = Book(_title, _author, _id);
    }

    function getBookId() public view returns (uint256) {
        return myBook.book_id;
    }
}

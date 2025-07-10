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


contract Mappings {
    // A basic mapping:
    // This maps an address (the key) to a uint (the value).
    // It can be used to store a balance for each address, for example.
    mapping(address => uint) public balances;

    // A mapping of mappings:
    // This allows us to store data for a specific item owned by a specific user.
    // For example, mapping(address => mapping(uint => string))
    // could map a user's address to a mapping that maps an item ID (uint) to its name (string).
    mapping(address => mapping(uint => bool)) public userItemOwnership;

    // A struct to represent a product
    struct Product {
        string name;
        uint price;
        address owner;
        bool exists; // To check if the product ID is actually used
    }

    // A mapping to store product details based on a product ID
    mapping(uint => Product) public products;
    uint public nextProductId = 1; // Counter for new product IDs

    // Event to log product creation
    event ProductCreated(uint productId, string name, uint price, address owner);
    // Event to log product ownership transfer
    event ProductOwnershipTransferred(uint productId, address from, address to);

    constructor() public {
        // Optionally, you can initialize some values in the constructor
        // For example, give the deployer some initial balance
        balances[msg.sender] = 1000;
    }

    // Function to set a balance for a given address
    function setBalance(address _user, uint _amount) public {
        balances[_user] = _amount;
    }

    // Function to get the balance of a given address
    function getBalance(address _user) public view returns (uint) {
        return balances[_user];
    }

    // Function to set user item ownership
    function setUserItemOwnership(address _user, uint _itemId, bool _owns) public {
        userItemOwnership[_user][_itemId] = _owns;
    }

    // Function to check user item ownership
    function getUserItemOwnership(address _user, uint _itemId) public view returns (bool) {
        return userItemOwnership[_user][_itemId];
    }

    // Function to create a new product
    function createProduct(string memory _name, uint _price) public {
        uint currentProductId = nextProductId;
        products[currentProductId] = Product({
            name: _name,
            price: _price,
            owner: msg.sender,
            exists: true
        });
        nextProductId++;
        emit ProductCreated(currentProductId, _name, _price, msg.sender);
    }

    // Function to get product details
    function getProduct(uint _productId) public view returns (string memory, uint, address, bool) {
        Product storage product = products[_productId];
        require(product.exists, "Product does not exist.");
        return (product.name, product.price, product.owner, product.exists);
    }

    // Function to transfer product ownership
    function transferProductOwnership(uint _productId, address _newOwner) public {
        Product storage product = products[_productId];
        require(product.exists, "Product does not exist.");
        require(product.owner == msg.sender, "You are not the owner of this product.");

        address oldOwner = product.owner;
        product.owner = _newOwner;
        emit ProductOwnershipTransferred(_productId, oldOwner, _newOwner);
    }
}
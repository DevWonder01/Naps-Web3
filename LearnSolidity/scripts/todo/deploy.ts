import {ethers} from 'hardhat'

async function main() {
  const TodoList = await ethers.getContractFactory("TodoList");
  const todoList = await TodoList.deploy();

  await todoList.deployed();

  console.log("TodoList deployed to:", todoList.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
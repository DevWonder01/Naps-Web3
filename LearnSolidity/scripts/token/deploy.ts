// scripts/deploy.js
import {ethers} from 'hardhat'

async function main() {
  const initialSupply = ethers.utils.parseEther("1000000"); // 1 million tokens

  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(initialSupply);

  await myToken.deployed();

  console.log("MyToken deployed to:", myToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


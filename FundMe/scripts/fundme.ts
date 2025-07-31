import { ethers } from "hardhat";
const hre = require("hardhat");


const deployContracts = async () => {
  const [signer] = await ethers.getSigners();

  let fundMe;

  const fundMeContract = await ethers.getContractFactory("FundMe");

  // base
  const amountRaise = String(1.5 * 10 **18);
    const deadLine = 1756673493
  fundMe = await fundMeContract.deploy(amountRaise,deadLine);


//   await hre.run("verify:verify", {
//     address: fundMe.address,
//     constructorArguments: [amountRaise,deadLine],
//   });


  console.table({
    FundMe: fundMe.address,
  });

};

const main = async () => {
  await deployContracts();
};

main();
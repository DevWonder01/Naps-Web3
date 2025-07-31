import { ethers } from "hardhat";
const hre = require("hardhat");


const deployContracts = async () => {
  const [signer] = await ethers.getSigners();

  let fundMe;

  const fundMeContract = await ethers.getContractFactory("FundMe");

  // base
  const amountRaise = String(10 * 10 **18);
    const deadLine = 1757100816
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
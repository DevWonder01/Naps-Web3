const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  it("Should initialize with a default value of 0", async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();

    expect(await simpleStorage.get()).to.equal(0);
  });

  it("Should set and get the stored data", async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();

    const newValue = 42;
    await simpleStorage.set(newValue);
    expect(await simpleStorage.get()).to.equal(newValue);
  });
});
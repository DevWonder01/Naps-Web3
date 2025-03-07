// test/SimpleStorage.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  it("Should store and retrieve a value", async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();

    const initialValue = 42;
    await simpleStorage.set(initialValue);

    const storedValue = await simpleStorage.get();
    expect(storedValue).to.equal(initialValue);

    const newValue = 100;
    await simpleStorage.set(newValue);

    const newStoredValue = await simpleStorage.get();
    expect(newStoredValue).to.equal(newValue);
  });
});
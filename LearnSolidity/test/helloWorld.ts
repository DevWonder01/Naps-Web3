const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HelloWorld", function () {
  it("Should return the greeting set in the constructor", async function () {
    const greeting = "Hello, world!";
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const helloWorld = await HelloWorld.deploy(greeting);
    await helloWorld.waitForDeployment();

    expect(await helloWorld.getGreeting()).to.equal(greeting);
  });
});
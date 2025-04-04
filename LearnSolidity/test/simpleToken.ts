const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let SimpleToken, simpleToken, owner, addr1, addr2;
  const initialSupply = ethers.parseUnits("1000", 18);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(initialSupply);
    await simpleToken.waitForDeployment();
  });

  it("Should have the correct total supply", async function () {
    expect(await simpleToken.totalSupply()).to.equal(initialSupply);
  });

  it("Should assign the initial supply to the owner", async function () {
    expect(await simpleToken.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should transfer tokens correctly", async function () {
    const transferAmount = ethers.parseUnits("100", 18);

    await simpleToken.transfer(addr1.address, transferAmount);
    expect(await simpleToken.balanceOf(owner.address)).to.equal(initialSupply - transferAmount);
    expect(await simpleToken.balanceOf(addr1.address)).to.equal(transferAmount);

    await simpleToken.connect(addr1).transfer(addr2.address, transferAmount);
    expect(await simpleToken.balanceOf(addr1.address)).to.equal(0);
    expect(await simpleToken.balanceOf(addr2.address)).to.equal(transferAmount);
  });

  it("Should emit a Transfer event on transfer", async function () {
    const transferAmount = ethers.parseUnits("50", 18);

    await expect(simpleToken.transfer(addr1.address, transferAmount))
      .to.emit(simpleToken, "Transfer")
      .withArgs(owner.address, addr1.address, transferAmount);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const transferAmount = ethers.parseUnits("1001", 18);
    await expect(simpleToken.transfer(addr1.address, transferAmount)).to.be.revertedWith("Insufficient balance.");
  });
});
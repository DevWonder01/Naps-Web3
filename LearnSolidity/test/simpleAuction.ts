const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleAuction", function () {
  let SimpleAuction, simpleAuction, beneficiary, bidder1, bidder2;
  const biddingTime = 60; // seconds
  const initialBid = "1";
  const higherBid = "2";

  beforeEach(async function () {
    [beneficiary, bidder1, bidder2] = await ethers.getSigners();
    const endTime = Math.floor(Date.now() / 1000) + biddingTime;
    SimpleAuction = await ethers.getContractFactory("SimpleAuction");
    simpleAuction = await SimpleAuction.deploy(biddingTime, beneficiary.address);
    await simpleAuction.waitForDeployment();
  });

  it("Should set the beneficiary and auction end time correctly", async function () {
    expect(await simpleAuction.beneficiary()).to.equal(beneficiary.address);
    expect(await simpleAuction.auctionEndTime()).to.be.closeTo(Math.floor(Date.now() / 1000) + biddingTime, 5); // Allow some time drift
  });

  it("Should allow a bidder to place a bid", async function () {
    await simpleAuction.connect(bidder1).bid({ value: initialBid });
    expect(await simpleAuction.highestBidder()).to.equal(bidder1.address);
    expect(await simpleAuction.highestBid()).to.equal(initialBid);
  });

  it("Should allow a higher bid to replace the current highest bid", async function () {
    await simpleAuction.connect(bidder1).bid({ value: initialBid });
    await simpleAuction.connect(bidder2).bid({ value: higherBid });
    expect(await simpleAuction.highestBidder()).to.equal(bidder2.address);
    expect(await simpleAuction.highestBid()).to.equal(higherBid);
    expect(await simpleAuction.pendingReturns(bidder1.address)).to.equal(initialBid);
  });

  it("Should revert if a bid is not higher than the current highest bid", async function () {
    await simpleAuction.connect(bidder1).bid({ value: higherBid });
    await expect(simpleAuction.connect(bidder2).bid({ value: initialBid })).to.be.revertedWith("There already is a higher bid.");
  });

  it("Should revert if bidding after the auction end time", async function () {
    await ethers.provider.send("evm_increaseTime", [biddingTime + 1]);
    await expect(simpleAuction.connect(bidder1).bid({ value: initialBid })).to.be.revertedWith("Auction ended.");
  });

  it("Should allow the beneficiary to end the auction after the end time", async function () {
    await simpleAuction.connect(bidder1).bid({ value: higherBid });
    await ethers.provider.send("evm_increaseTime", [biddingTime + 1]);
    await expect(simpleAuction.auctionEnd())
      .to.emit(simpleAuction, "AuctionEnded")
      .withArgs(bidder1.address, higherBid);
    expect(await simpleAuction.ended()).to.equal(true);
    expect(await ethers.provider.getBalance(simpleAuction.target)).to.equal(higherBid); // Check contract balance
  });

  it("Should allow the previous bidder to withdraw their overbid", async function () {
    await simpleAuction.connect(bidder1).bid({ value: initialBid });
    await simpleAuction.connect(bidder2).bid({ value: higherBid });
    expect(await simpleAuction.pendingReturns(bidder1.address)).to.equal(initialBid);

    const initialBalance = await ethers.provider.getBalance(bidder1.address);
    const tx = await simpleAuction.connect(bidder1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(tx.gasPrice);

    expect(await ethers.provider.getBalance(bidder1.address)).to.equal(initialBalance.add(initialBid).sub(gasUsed));
    expect(await simpleAuction.pendingReturns(bidder1.address)).to.equal(0);
  });

  it("Should revert if trying to end the auction before the end time", async function () {
    await expect(simpleAuction.auctionEnd()).to.be.revertedWith("Auction not yet ended.");
  });

  it("Should revert if trying to end the auction after it has already ended", async function () {
    await ethers.provider.send("evm_increaseTime", [biddingTime + 1]);
    await simpleAuction.auctionEnd();
    await expect(simpleAuction.auctionEnd()).to.be.revertedWith("auctionEnd has already been called.");
  });

  it("Should not allow withdrawing if there are no pending returns", async function () {
    await expect(simpleAuction.connect(bidder1).withdraw()).to.not.emit(simpleAuction, "Transfer"); // Assuming no Transfer event on failed withdraw
    expect(await simpleAuction.pendingReturns(bidder1.address)).to.equal(0);
  });
});
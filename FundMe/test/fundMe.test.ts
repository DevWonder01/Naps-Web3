// Import necessary modules from Hardhat and Chai
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FundMe } from "../types/FundMe"; // Typechain generated types for your contract

describe("FundMe", function () {
    let fundMe: FundMe; // Declare contract instance
    let deployer: SignerWithAddress; // Declare deployer address
    let user1: SignerWithAddress; // Declare a test user address
    let user2: SignerWithAddress; // Declare another test user address

    // Define constants for testing
    const GOAL_AMOUNT_ETH = "10"; // 10 Ether
    const FUNDING_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days in seconds
    const MIN_FUND_AMOUNT_ETH = "0.01"; // Minimum fund amount for testing

    // `beforeEach` will run before each test in this describe block
    beforeEach(async function () {
        // Get signers (accounts) from Hardhat's local blockchain
        [deployer, user1, user2] = await ethers.getSigners();

        // Deploy the FundMe contract
        const FundMeFactory = await ethers.getContractFactory("FundMe", deployer);
        fundMe = await FundMeFactory.deploy(
            ethers.parseEther(GOAL_AMOUNT_ETH), // Convert Ether to Wei
            FUNDING_DURATION_SECONDS
        );
        // Ensure the contract is deployed and its address is available
        await fundMe.waitForDeployment();
    });

    // --- Constructor Tests ---
    describe("constructor", function () {
        it("sets the owner correctly", async function () {
            // Check if the owner set in the constructor matches the deployer's address
            expect(await fundMe.i_owner()).to.equal(deployer.address);
        });

        it("sets the goal amount correctly", async function () {
            // Check if the goal amount is set as expected (in Wei)
            expect(await fundMe.s_goalAmount()).to.equal(ethers.parseEther(GOAL_AMOUNT_ETH));
        });

        it("sets the deadline correctly", async function () {
            // Get the current block timestamp and calculate the expected deadline
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore!.timestamp; // Use '!' for non-null assertion

            // The deadline should be approximately `timestampBefore + FUNDING_DURATION_SECONDS`
            // We use `closeTo` for time-based checks due to slight variations in block timestamps
            expect(await fundMe.s_deadline()).to.be.closeTo(
                timestampBefore + FUNDING_DURATION_SECONDS,
                2 // Allow a difference of up to 2 seconds
            );
        });

        it("initializes total funds raised to zero", async function () {
            expect(await fundMe.s_totalFundsRaised()).to.equal(0);
        });

        it("initializes goalReached to false", async function () {
            expect(await fundMe.s_goalReached()).to.be.false;
        });

        it("initializes fundsClaimed to false", async function () {
            expect(await fundMe.s_fundsClaimed()).to.be.false;
        });
    });

    // --- fund() function tests ---
    describe("fund", function () {
        it("reverts if 0 Ether is sent", async function () {
            // Attempt to send 0 Ether and expect a revert with a specific message
            await expect(fundMe.fund({ value: 0 })).to.be.revertedWith(
                "FundMe: Must send more than 0 Ether."
            );
        });

        it("reverts if called after the deadline", async function () {
            // Advance time past the deadline
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []); // Mine a new block to apply time change

            // Attempt to fund and expect a revert
            await expect(
                fundMe.connect(user1).fund({ value: ethers.parseEther(MIN_FUND_AMOUNT_ETH) })
            ).to.be.revertedWith("FundMe: Campaign has ended.");
        });

        it("updates the total funds raised", async function () {
            const fundAmount = ethers.parseEther("1");
            const initialTotalFunds = await fundMe.s_totalFundsRaised();

            await fundMe.connect(user1).fund({ value: fundAmount });

            // Check if total funds raised increased by the fund amount
            expect(await fundMe.s_totalFundsRaised()).to.equal(initialTotalFunds + fundAmount);
        });

        it("records the amount funded by each donor", async function () {
            const fundAmount1 = ethers.parseEther("0.5");
            const fundAmount2 = ethers.parseEther("0.7");

            await fundMe.connect(user1).fund({ value: fundAmount1 });
            await fundMe.connect(user2).fund({ value: fundAmount2 });

            // Verify individual donations are recorded correctly
            expect(await fundMe.s_donations(user1.address)).to.equal(fundAmount1);
            expect(await fundMe.s_donations(user2.address)).to.equal(fundAmount2);
        });

        it("emits a FundReceived event", async function () {
            const fundAmount = ethers.parseEther("0.1");
            // Expect an event to be emitted with specific arguments
            await expect(fundMe.connect(user1).fund({ value: fundAmount }))
                .to.emit(fundMe, "FundReceived")
                .withArgs(user1.address, fundAmount, fundAmount); // newTotal will be fundAmount initially
        });

        it("sets goalReached to true when goal is met", async function () {
            const fundAmount = ethers.parseEther(GOAL_AMOUNT_ETH); // Send exactly the goal amount
            await fundMe.connect(user1).fund({ value: fundAmount });
            expect(await fundMe.s_goalReached()).to.be.true;
        });

        it("emits GoalReached event when goal is met", async function () {
            const fundAmount = ethers.parseEther(GOAL_AMOUNT_ETH);
            await expect(fundMe.connect(user1).fund({ value: fundAmount }))
                .to.emit(fundMe, "GoalReached")
                .withArgs(fundAmount);
        });

        it("does not set goalReached to true if already true", async function () {
            // Fund to reach goal
            await fundMe.connect(user1).fund({ value: ethers.parseEther(GOAL_AMOUNT_ETH) });
            expect(await fundMe.s_goalReached()).to.be.true;

            // Fund again (should not re-emit GoalReached or change s_goalReached)
            await expect(
                fundMe.connect(user2).fund({ value: ethers.parseEther("1") })
            ).to.not.emit(fundMe, "GoalReached");
            expect(await fundMe.s_goalReached()).to.be.true; // Should remain true
        });
    });

    // --- withdrawFunds() function tests ---
    describe("withdrawFunds", function () {
        beforeEach(async function () {
            // Fund the contract to meet the goal before withdrawal tests
            await fundMe.connect(user1).fund({ value: ethers.parseEther(GOAL_AMOUNT_ETH) });
            // Advance time past the deadline for withdrawal
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []);
        });

        it("reverts if called by non-owner", async function () {
            await expect(fundMe.connect(user1).withdrawFunds()).to.be.revertedWith(
                "FundMe: Only owner can call this function."
            );
        });

        it("reverts if called before the deadline", async function () {
            // Re-deploy contract to reset time for this specific test
            const FundMeFactory = await ethers.getContractFactory("FundMe", deployer);
            fundMe = await FundMeFactory.deploy(
                ethers.parseEther(GOAL_AMOUNT_ETH),
                FUNDING_DURATION_SECONDS
            );
            await fundMe.waitForDeployment();
            await fundMe.connect(user1).fund({ value: ethers.parseEther(GOAL_AMOUNT_ETH) });

            await expect(fundMe.withdrawFunds()).to.be.revertedWith(
                "FundMe: Campaign has not ended yet."
            );
        });

        it("reverts if goal was not met", async function () {
            // Re-deploy contract with a higher goal to ensure it's not met
            const FundMeFactory = await ethers.getContractFactory("FundMe", deployer);
            fundMe = await FundMeFactory.deploy(
                ethers.parseEther("100"), // High goal
                FUNDING_DURATION_SECONDS
            );
            await fundMe.waitForDeployment();
            await fundMe.connect(user1).fund({ value: ethers.parseEther("1") }); // Only fund a small amount

            // Advance time past deadline
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []);

            await expect(fundMe.withdrawFunds()).to.be.revertedWith(
                "FundMe: Goal not met, cannot withdraw."
            );
        });

        it("transfers all funds to the owner", async function () {
            const initialOwnerBalance = await ethers.provider.getBalance(deployer.address);
            const contractBalance = await ethers.provider.getBalance(await fundMe.getAddress());

            // Withdraw funds
            const txResponse = await fundMe.withdrawFunds();
            const txReceipt = await txResponse.wait();

            // Calculate gas cost
            const gasUsed = txReceipt!.gasUsed;
            const gasPrice = txReceipt!.gasPrice;
            const gasCost = gasUsed * gasPrice;

            const finalOwnerBalance = await ethers.provider.getBalance(deployer.address);

            // Owner's balance should increase by contract balance minus gas cost
            expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance - gasCost);
            expect(await ethers.provider.getBalance(await fundMe.getAddress())).to.equal(0); // Contract should be empty
        });

        it("sets fundsClaimed to true", async function () {
            await fundMe.withdrawFunds();
            expect(await fundMe.s_fundsClaimed()).to.be.true;
        });

        it("reverts if funds already claimed", async function () {
            await fundMe.withdrawFunds(); // First withdrawal
            await expect(fundMe.withdrawFunds()).to.be.revertedWith(
                "FundMe: Funds already claimed."
            );
        });

        it("emits FundsWithdrawn and CampaignEnded events", async function () {
            const contractBalance = await ethers.provider.getBalance(await fundMe.getAddress());

            await expect(fundMe.withdrawFunds())
                .to.emit(fundMe, "CampaignEnded")
                .and.to.emit(fundMe, "FundsWithdrawn")
                .withArgs(deployer.address, contractBalance);
        });
    });

    // --- requestRefund() function tests ---
    describe("requestRefund", function () {
        beforeEach(async function () {
            // Fund the contract (but not enough to meet the goal)
            await fundMe.connect(user1).fund({ value: ethers.parseEther("0.1") });
            await fundMe.connect(user2).fund({ value: ethers.parseEther("0.2") });

            // Advance time past the deadline
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []);
        });

        it("reverts if goal was met", async function () {
            // Re-deploy and fund to meet goal
            const FundMeFactory = await ethers.getContractFactory("FundMe", deployer);
            fundMe = await FundMeFactory.deploy(
                ethers.parseEther("0.1"), // Low goal
                FUNDING_DURATION_SECONDS
            );
            await fundMe.waitForDeployment();
            await fundMe.connect(user1).fund({ value: ethers.parseEther("0.1") });

            // Advance time past deadline
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []);

            await expect(fundMe.connect(user1).requestRefund()).to.be.revertedWith(
                "FundMe: Goal was met, no refunds."
            );
        });

        it("reverts if called before the deadline", async function () {
            // Re-deploy contract to reset time for this specific test
            const FundMeFactory = await ethers.getContractFactory("FundMe", deployer);
            fundMe = await FundMeFactory.deploy(
                ethers.parseEther(GOAL_AMOUNT_ETH),
                FUNDING_DURATION_SECONDS
            );
            await fundMe.waitForDeployment();
            await fundMe.connect(user1).fund({ value: ethers.parseEther("0.1") });

            await expect(fundMe.connect(user1).requestRefund()).to.be.revertedWith(
                "FundMe: Campaign has not ended yet."
            );
        });

        it("reverts if donor has no funds to refund", async function () {
            await expect(fundMe.connect(deployer).requestRefund()).to.be.revertedWith(
                "FundMe: You have no funds to refund."
            );
        });

        it("transfers the correct amount back to the donor", async function () {
            const user1Donation = await fundMe.s_donations(user1.address);
            const initialUser1Balance = await ethers.provider.getBalance(user1.address);
            const initialContractBalance = await ethers.provider.getBalance(await fundMe.getAddress());

            const txResponse = await fundMe.connect(user1).requestRefund();
            const txReceipt = await txResponse.wait();

            const gasUsed = txReceipt!.gasUsed;
            const gasPrice = txReceipt!.gasPrice;
            const gasCost = gasUsed * gasPrice;

            const finalUser1Balance = await ethers.provider.getBalance(user1.address);
            const finalContractBalance = await ethers.provider.getBalance(await fundMe.getAddress());

            // User's balance should increase by their donation minus gas cost
            expect(finalUser1Balance).to.equal(initialUser1Balance + user1Donation - gasCost);
            // Contract balance should decrease by the refunded amount
            expect(finalContractBalance).to.equal(initialContractBalance - user1Donation);
        });

        it("resets the donor's contribution to zero after refund", async function () {
            await fundMe.connect(user1).requestRefund();
            expect(await fundMe.s_donations(user1.address)).to.equal(0);
        });

        it("emits a RefundIssued event", async function () {
            const user1Donation = await fundMe.s_donations(user1.address);
            await expect(fundMe.connect(user1).requestRefund())
                .to.emit(fundMe, "RefundIssued")
                .withArgs(user1.address, user1Donation);
        });

        it("cannot refund twice", async function () {
            await fundMe.connect(user1).requestRefund();
            await expect(fundMe.connect(user1).requestRefund()).to.be.revertedWith(
                "FundMe: You have no funds to refund."
            );
        });
    });

    // --- View Functions Tests ---
    describe("view functions", function () {
        it("getRemainingTime returns correct time before deadline", async function () {
            // Get current timestamp
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore!.timestamp;

            // Calculate expected remaining time
            const expectedRemainingTime = (await fundMe.s_deadline()) - timestampBefore;

            // Check if getRemainingTime is close to the expected value
            expect(await fundMe.getRemainingTime()).to.be.closeTo(expectedRemainingTime, 2);
        });

        it("getRemainingTime returns 0 after deadline", async function () {
            // Advance time past the deadline
            await ethers.provider.send("evm_increaseTime", [FUNDING_DURATION_SECONDS + 1]);
            await ethers.provider.send("evm_mine", []);

            expect(await fundMe.getRemainingTime()).to.equal(0);
        });

        it("getMyDonation returns correct amount for a donor", async function () {
            const fundAmount = ethers.parseEther("0.3");
            await fundMe.connect(user1).fund({ value: fundAmount });
            expect(await fundMe.getMyDonation(user1.address)).to.equal(fundAmount);
        });

        it("getMyDonation returns 0 for non-donor", async function () {
            expect(await fundMe.getMyDonation(user2.address)).to.equal(0);
        });
    });

    // --- Fallback Functions Tests ---
    describe("receive and fallback", function () {
        it("receive function reverts when direct Ether sent without data", async function () {
            // Attempt to send Ether directly to the contract address without specifying a function
            await expect(
                deployer.sendTransaction({
                    to: await fundMe.getAddress(),
                    value: ethers.parseEther("0.001"),
                })
            ).to.be.revertedWith("FundMe: Please call the 'fund' function to donate.");
        });

        it("fallback function reverts when calling non-existent function", async function () {
            // Attempt to call a non-existent function on the contract
            // This is a low-level call to simulate calling a function that doesn't exist
            await expect(
                deployer.sendTransaction({
                    to: await fundMe.getAddress(),
                    data: "0x12345678", // Random function selector
                    value: ethers.parseEther("0.001"),
                })
            ).to.be.revertedWith("FundMe: Invalid function call.");
        });
    });
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Specify a modern Solidity version

/**
 * @title FundMe
 * @dev A simple crowdfunding smart contract where users can donate Ether
 * and the project creator can withdraw funds if the goal is met by the deadline.
 * If the goal is not met, donors can request a refund.
 */
contract FundMe {
    // --- State Variables ---
    address public immutable i_owner; // The address of the project creator (immutable for security)
    uint256 public s_goalAmount; // The target amount in Wei (1 Ether = 10^18 Wei)
    uint256 public s_deadline; // Timestamp when the funding period ends 
    uint256 public s_totalFundsRaised; // Accumulates all donated funds
    bool public s_goalReached; // True if the goal was met
    bool public s_fundsClaimed; // True if the owner has claimed the funds

    // Mapping to store how much each address has contributed
    mapping(address => uint256) public s_donations;


    // --- Events ---
    // Events are crucial for frontend applications to listen for changes on-chain
    event FundReceived(address indexed donor, uint256 amount, uint256 newTotal);
    event GoalReached(uint256 totalFunds);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event RefundIssued(address indexed donor, uint256 amount);
    event CampaignEnded();

    // --- Modifiers ---
    // Modifiers are reusable code blocks that can be applied to functions
    modifier onlyOwner() {
        require(msg.sender == i_owner, "FundMe: Only owner can call this function.");
        _; // Placeholder for the function's original code
    }

    modifier beforeDeadline() {
        require(block.timestamp < s_deadline, "FundMe: Campaign has ended.");
        _;
    }

    modifier afterDeadline() {
        require(block.timestamp >= s_deadline, "FundMe: Campaign has not ended yet.");
        _;
    }

    // --- Constructor ---
    // This function runs only once when the contract is deployed
    constructor(uint256 _goalAmountInWei, uint256 _fundingDurationInSeconds) {
        require(block.timestamp >= _fundingDurationInSeconds);
        i_owner = msg.sender; // The deployer of the contract is the owner
        s_goalAmount = _goalAmountInWei;
        s_deadline =  _fundingDurationInSeconds; // Deadline is current time + duration
        s_totalFundsRaised = 0;
        s_goalReached = false;
        s_fundsClaimed = false;
    }

    // --- Public Functions ---

    /**
     * @dev Allows users to send Ether to fund the campaign.
     * Requires that the campaign is still active (before deadline).
     */
    function fund() public payable beforeDeadline {
        require(msg.value > 0, "FundMe: Must send more than 0 Ether.");

        s_donations[msg.sender] += msg.value; // Add contribution to donor's record
        s_totalFundsRaised += msg.value; // Increase total funds raised

        emit FundReceived(msg.sender, msg.value, s_totalFundsRaised);

        // Check if goal is reached immediately after funding
        if (s_totalFundsRaised >= s_goalAmount && !s_goalReached) {
            s_goalReached = true;
            emit GoalReached(s_totalFundsRaised);
        }
    }

    /**
     * @dev Allows the owner to withdraw all funds if the goal was met and funds haven't been claimed.
     * Can only be called after the deadline.
     */
    function withdrawFunds() public onlyOwner afterDeadline {
        require(s_goalReached, "FundMe: Goal not met, cannot withdraw.");
        require(!s_fundsClaimed, "FundMe: Funds already claimed.");

        s_fundsClaimed = true; // Mark funds as claimed to prevent re-withdrawal
        emit CampaignEnded(); // Announce campaign conclusion

        // Transfer all collected funds to the owner
        (bool success, ) = payable(i_owner).call{value: address(this).balance}("");
        require(success, "FundMe: Failed to withdraw funds.");

        emit FundsWithdrawn(i_owner, address(this).balance);
    }

    /**
     * @dev Allows a donor to request a refund if the goal was NOT met by the deadline.
     * Can only be called after the deadline.
     */
    function requestRefund() public afterDeadline {
        require(!s_goalReached, "FundMe: Goal was met, no refunds.");
        require(s_donations[msg.sender] > 0, "FundMe: You have no funds to refund.");

        uint256 amountToRefund = s_donations[msg.sender];
        s_donations[msg.sender] = 0; // Reset donor's contribution to prevent double refund

        (bool success, ) = payable(msg.sender).call{value: amountToRefund}("");
        require(success, "FundMe: Failed to send refund.");

        emit RefundIssued(msg.sender, amountToRefund);
    }

    /**
     * @dev Gets the remaining time until the campaign deadline.
     * @return The number of seconds remaining. Returns 0 if deadline passed.
     */
    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp >= s_deadline) {
            return 0;
        }
        return s_deadline - block.timestamp;
    }

    /**
     * @dev Gets the amount contributed by a specific address.
     * @param _donor The address to query.
     * @return The amount in Wei contributed by _donor.
     */
    function getMyDonation(address _donor) public view returns (uint256) {
        return s_donations[_donor];
    }

    /**
     * @dev Fallback function to receive Ether if no other function matches.
     * Reverts if Ether is sent without calling `fund()`.
     */
    receive() external payable {
        revert("FundMe: Please call the 'fund' function to donate.");
    }

    /**
     * @dev Fallback function for calls to non-existent functions.
     */
    fallback() external payable {
        revert("FundMe: Invalid function call.");
    }
}

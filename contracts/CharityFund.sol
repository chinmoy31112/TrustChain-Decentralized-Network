// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CharityFund
 * @dev Decentralized charity platform for Mantle Network with campaigns, donations, voting, and NFT receipts
 * @notice Uses MNT as native token on Mantle
 */
interface ICharityNFT {
    function mintReceipt(
        address to,
        uint256 campaignId,
        uint256 amount,
        string memory tier
    ) external returns (uint256);

    function getTier(uint256 amount) external view returns (string memory);
}

contract CharityFund is ReentrancyGuard, Ownable, Pausable {
    // Campaign status enum
    enum CampaignStatus { Active, Completed, Cancelled, Withdrawn }

    // Campaign struct
    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        string category;
        string imageUrl;
        string ipfsHash;
        uint256 goal;
        uint256 raised;
        uint256 deadline;
        bool withdrawn;
        bool active;
        uint256 donorCount;
        uint256 voteCount;
        uint256 againstCount;
        uint256 createdAt;
        CampaignStatus status;
    }

    // Donor struct
    struct Donor {
        address wallet;
        uint256 totalDonated;
        uint256 donationCount;
        uint256 firstDonation;
        uint256 nftCount;
    }

    // Donation record
    struct DonationRecord {
        uint256 campaignId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 nftTokenId;
    }

    // State variables
    ICharityNFT public nftContract;
    uint256 public campaignCount;
    uint256 public totalDonationsGlobal;
    uint256 public totalDonorsGlobal;

    // Platform configuration
    uint256 public platformFeePercent = 250; // 2.5% in basis points
    uint256 public constant MAX_FEE = 1000; // 10% max
    uint256 public totalPlatformFees;
    uint256 public minGoal = 0.01 ether;
    uint256 public maxGoal = 100000 ether;
    uint256 public minDuration = 1 days;
    uint256 public maxDuration = 365 days;

    // Mappings
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donationsByAddress;
    mapping(uint256 => address[]) public campaignDonors;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => DonationRecord[]) public campaignDonationRecords;
    mapping(address => Donor) public donorStats;
    mapping(address => uint256[]) public donorCampaigns;
    mapping(address => DonationRecord[]) public donorDonationHistory;
    address[] public allDonors;
    mapping(address => bool) public isDonor;
    mapping(uint256 => mapping(address => uint256)) public donationNFT;

    // Events
    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string category,
        uint256 goal,
        uint256 deadline
    );

    event DonationMade(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 tokenId,
        string tier
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount,
        uint256 platformFee
    );

    event VoteCast(
        uint256 indexed campaignId,
        address indexed voter,
        bool support
    );

    event CampaignCancelled(uint256 indexed campaignId, address indexed creator);
    event CampaignStatusChanged(uint256 indexed campaignId, CampaignStatus newStatus);
    event NFTContractSet(address indexed oldContract, address indexed newContract);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier campaignExists(uint256 _id) {
        require(_id > 0 && _id <= campaignCount, "Campaign does not exist");
        _;
    }

    modifier onlyCreator(uint256 _id) {
        require(msg.sender == campaigns[_id].creator, "Not campaign creator");
        _;
    }

    modifier campaignActive(uint256 _id) {
        require(campaigns[_id].active, "Campaign not active");
        require(block.timestamp < campaigns[_id].deadline, "Campaign ended");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // Admin functions
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address");
        address oldContract = address(nftContract);
        nftContract = ICharityNFT(_nftContract);
        emit NFTContractSet(oldContract, _nftContract);
    }

    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_FEE, "Fee too high");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _feePercent;
        emit PlatformFeeUpdated(oldFee, _feePercent);
    }

    function setGoalLimits(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Invalid limits");
        minGoal = _min;
        maxGoal = _max;
    }

    function setDurationLimits(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Invalid limits");
        minDuration = _min;
        maxDuration = _max;
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees to withdraw");
        totalPlatformFees = 0;

        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");

        emit PlatformFeesWithdrawn(owner(), amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Campaign functions
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageUrl,
        string memory _ipfsHash,
        uint256 _goal,
        uint256 _durationDays
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(_goal >= minGoal && _goal <= maxGoal, "Invalid goal");
        require(
            _durationDays * 1 days >= minDuration &&
            _durationDays * 1 days <= maxDuration,
            "Invalid duration"
        );

        campaignCount++;
        uint256 id = campaignCount;
        uint256 deadline = block.timestamp + (_durationDays * 1 days);

        campaigns[id] = Campaign({
            id: id,
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            category: _category,
            imageUrl: _imageUrl,
            ipfsHash: _ipfsHash,
            goal: _goal,
            raised: 0,
            deadline: deadline,
            withdrawn: false,
            active: true,
            donorCount: 0,
            voteCount: 0,
            againstCount: 0,
            createdAt: block.timestamp,
            status: CampaignStatus.Active
        });

        donorCampaigns[msg.sender].push(id);

        emit CampaignCreated(id, msg.sender, _title, _category, _goal, deadline);
        return id;
    }

    function donate(uint256 _campaignId)
        external
        payable
        nonReentrant
        whenNotPaused
        campaignExists(_campaignId)
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Donation must be > 0");

        Campaign storage c = campaigns[_campaignId];

        // Track first-time donor for this campaign
        if (donationsByAddress[_campaignId][msg.sender] == 0) {
            campaignDonors[_campaignId].push(msg.sender);
            c.donorCount++;
        }

        // Update campaign
        donationsByAddress[_campaignId][msg.sender] += msg.value;
        c.raised += msg.value;
        totalDonationsGlobal += msg.value;

        // Global donor stats
        if (!isDonor[msg.sender]) {
            allDonors.push(msg.sender);
            isDonor[msg.sender] = true;
            donorStats[msg.sender].wallet = msg.sender;
            donorStats[msg.sender].firstDonation = block.timestamp;
            totalDonorsGlobal++;
        }
        donorStats[msg.sender].totalDonated += msg.value;
        donorStats[msg.sender].donationCount++;

        // Mint NFT receipt if contract is set
        uint256 tokenId = 0;
        string memory tier = "";
        if (address(nftContract) != address(0)) {
            tier = nftContract.getTier(msg.value);
            tokenId = nftContract.mintReceipt(
                msg.sender,
                _campaignId,
                msg.value,
                tier
            );
            donationNFT[_campaignId][msg.sender] = tokenId;
            donorStats[msg.sender].nftCount++;
        }

        // Record donation
        DonationRecord memory record = DonationRecord({
            campaignId: _campaignId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            nftTokenId: tokenId
        });
        campaignDonationRecords[_campaignId].push(record);
        donorDonationHistory[msg.sender].push(record);

        // Check if goal met
        if (c.raised >= c.goal) {
            c.status = CampaignStatus.Completed;
            emit CampaignStatusChanged(_campaignId, CampaignStatus.Completed);
        }

        emit DonationMade(_campaignId, msg.sender, msg.value, tokenId, tier);
    }

    function withdraw(uint256 _campaignId)
        external
        nonReentrant
        whenNotPaused
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];

        require(!c.withdrawn, "Already withdrawn");
        require(c.raised > 0, "Nothing to withdraw");
        require(
            c.raised >= c.goal || block.timestamp >= c.deadline,
            "Goal not met and deadline not reached"
        );

        c.withdrawn = true;
        c.active = false;
        c.status = CampaignStatus.Withdrawn;

        uint256 platformFee = (c.raised * platformFeePercent) / 10000;
        uint256 creatorAmount = c.raised - platformFee;
        totalPlatformFees += platformFee;

        (bool success, ) = c.creator.call{value: creatorAmount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_campaignId, msg.sender, creatorAmount, platformFee);
        emit CampaignStatusChanged(_campaignId, CampaignStatus.Withdrawn);
    }

    function vote(uint256 _campaignId, bool _support)
        external
        whenNotPaused
        campaignExists(_campaignId)
    {
        require(!hasVoted[_campaignId][msg.sender], "Already voted");
        require(campaigns[_campaignId].active, "Campaign not active");

        hasVoted[_campaignId][msg.sender] = true;

        if (_support) {
            campaigns[_campaignId].voteCount++;
        } else {
            campaigns[_campaignId].againstCount++;
        }

        emit VoteCast(_campaignId, msg.sender, _support);
    }

    function cancelCampaign(uint256 _campaignId)
        external
        nonReentrant
        campaignExists(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];

        require(
            msg.sender == c.creator || msg.sender == owner(),
            "Not authorized"
        );
        require(c.active, "Already inactive");
        require(!c.withdrawn, "Already withdrawn");

        c.active = false;
        c.status = CampaignStatus.Cancelled;

        // Refund all donors
        if (c.raised > 0) {
            address[] memory donors = campaignDonors[_campaignId];
            for (uint256 i = 0; i < donors.length; i++) {
                uint256 amount = donationsByAddress[_campaignId][donors[i]];
                if (amount > 0) {
                    donationsByAddress[_campaignId][donors[i]] = 0;
                    (bool success, ) = payable(donors[i]).call{value: amount}("");
                    require(success, "Refund failed");
                }
            }
            c.raised = 0;
        }

        emit CampaignCancelled(_campaignId, msg.sender);
        emit CampaignStatusChanged(_campaignId, CampaignStatus.Cancelled);
    }

    // View functions
    function getCampaign(uint256 _id)
        external
        view
        campaignExists(_id)
        returns (Campaign memory)
    {
        return campaigns[_id];
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint256 i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }

    function getActiveCampaigns() external view returns (Campaign[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].active && block.timestamp < campaigns[i].deadline) {
                activeCount++;
            }
        }

        Campaign[] memory active = new Campaign[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].active && block.timestamp < campaigns[i].deadline) {
                active[idx] = campaigns[i];
                idx++;
            }
        }
        return active;
    }

    function getCampaignsByCategory(string memory _category)
        external
        view
        returns (Campaign[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (keccak256(bytes(campaigns[i].category)) == keccak256(bytes(_category))) {
                count++;
            }
        }

        Campaign[] memory result = new Campaign[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (keccak256(bytes(campaigns[i].category)) == keccak256(bytes(_category))) {
                result[idx] = campaigns[i];
                idx++;
            }
        }
        return result;
    }

    function getCampaignDonors(uint256 _id)
        external
        view
        campaignExists(_id)
        returns (address[] memory)
    {
        return campaignDonors[_id];
    }

    function getCampaignDonations(uint256 _id)
        external
        view
        campaignExists(_id)
        returns (DonationRecord[] memory)
    {
        return campaignDonationRecords[_id];
    }

    function getUserCampaigns(address _user) external view returns (uint256[] memory) {
        return donorCampaigns[_user];
    }

    function getUserDonations(address _user) external view returns (DonationRecord[] memory) {
        return donorDonationHistory[_user];
    }

    function getDonorStats(address _donor) external view returns (Donor memory) {
        return donorStats[_donor];
    }

    function getLeaderboard(uint256 _limit)
        external
        view
        returns (address[] memory wallets, uint256[] memory amounts)
    {
        uint256 len = allDonors.length < _limit ? allDonors.length : _limit;
        wallets = new address[](len);
        amounts = new uint256[](len);

        // Simple bubble sort for top N (use events/indexing for production scale)
        address[] memory sorted = new address[](allDonors.length);
        for (uint256 i = 0; i < allDonors.length; i++) {
            sorted[i] = allDonors[i];
        }

        for (uint256 i = 0; i < sorted.length && i < len; i++) {
            for (uint256 j = i + 1; j < sorted.length; j++) {
                if (donorStats[sorted[j]].totalDonated > donorStats[sorted[i]].totalDonated) {
                    address tmp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = tmp;
                }
            }
        }

        for (uint256 i = 0; i < len; i++) {
            wallets[i] = sorted[i];
            amounts[i] = donorStats[sorted[i]].totalDonated;
        }
    }

    function getStats()
        external
        view
        returns (
            uint256 totalCampaigns,
            uint256 totalRaised,
            uint256 totalDonors
        )
    {
        return (campaignCount, totalDonationsGlobal, totalDonorsGlobal);
    }

    function calculatePlatformFee(uint256 _amount) external view returns (uint256) {
        return (_amount * platformFeePercent) / 10000;
    }

    // Prevent direct ETH transfers
    receive() external payable {
        revert("Use donate function");
    }

    fallback() external payable {
        revert("Use donate function");
    }
}

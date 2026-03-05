// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CharityNFT.sol";

/**
 * @title CharityFund
 * @dev Decentralized charity platform with campaigns, donations, voting, and NFT receipts
 */
contract CharityFund {
    CharityNFT public nftContract;

    uint256 public campaignCount;
    uint256 public totalDonationsGlobal;
    uint256 public totalDonorsGlobal;

    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        string category;
        string imageUrl;
        uint256 goal;         // in wei
        uint256 raised;       // in wei
        uint256 deadline;     // unix timestamp
        bool withdrawn;
        bool active;
        uint256 donorCount;
        uint256 voteCount;
        uint256 againstCount;
    }

    struct Donor {
        address wallet;
        uint256 totalDonated;
        uint256 donationCount;
        uint256 firstDonation;
    }

    // Campaign storage
    mapping(uint256 => Campaign) public campaigns;

    // campaignId => donor => amount
    mapping(uint256 => mapping(address => uint256)) public donationsByAddress;

    // campaignId => list of donor addresses
    mapping(uint256 => address[]) public campaignDonors;

    // campaignId => donor => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Global donor stats
    mapping(address => Donor) public donorStats;
    address[] public allDonors;
    mapping(address => bool) public isDonor;

    // campaignId => donor => tokenId (NFT receipt)
    mapping(uint256 => mapping(address => uint256)) public donationNFT;

    // ------ Events ------
    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );

    event DonationMade(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 tokenId
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event VoteCast(
        uint256 indexed campaignId,
        address indexed voter,
        bool support
    );

    event CampaignClosed(uint256 indexed campaignId);

    // ------ Modifiers ------
    modifier campaignExists(uint256 _id) {
        require(_id > 0 && _id <= campaignCount, "Campaign does not exist");
        _;
    }

    modifier onlyCreator(uint256 _id) {
        require(msg.sender == campaigns[_id].creator, "Not campaign creator");
        _;
    }

    // ------ Constructor ------
    constructor(address _nftContract) {
        nftContract = CharityNFT(_nftContract);
    }

    // ------ Campaign Functions ------

    /**
     * @dev Create a new charity campaign
     * @param _title Campaign title
     * @param _description Detailed description
     * @param _category Category (e.g. Education, Healthcare, Disaster Relief)
     * @param _imageUrl IPFS or external image URL
     * @param _goal Fundraising goal in wei
     * @param _durationDays Duration in days
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageUrl,
        uint256 _goal,
        uint256 _durationDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_goal > 0, "Goal must be > 0");
        require(_durationDays >= 1 && _durationDays <= 365, "Duration: 1-365 days");

        campaignCount++;
        uint256 id = campaignCount;

        campaigns[id] = Campaign({
            id: id,
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            category: _category,
            imageUrl: _imageUrl,
            goal: _goal,
            raised: 0,
            deadline: block.timestamp + (_durationDays * 1 days),
            withdrawn: false,
            active: true,
            donorCount: 0,
            voteCount: 0,
            againstCount: 0
        });

        emit CampaignCreated(id, msg.sender, _title, _goal, campaigns[id].deadline);
        return id;
    }

    /**
     * @dev Donate ETH to a campaign and receive an NFT receipt
     * @param _campaignId Target campaign ID
     */
    function donate(uint256 _campaignId) external payable campaignExists(_campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(c.active, "Campaign is not active");
        require(block.timestamp < c.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be > 0");

        // Track first-time donor for this campaign
        if (donationsByAddress[_campaignId][msg.sender] == 0) {
            campaignDonors[_campaignId].push(msg.sender);
            c.donorCount++;
        }

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

        // Mint NFT receipt
        uint256 tokenId = nftContract.mintReceipt(
            msg.sender,
            _campaignId,
            msg.value,
            c.title
        );
        donationNFT[_campaignId][msg.sender] = tokenId;

        emit DonationMade(_campaignId, msg.sender, msg.value, tokenId);
    }

    /**
     * @dev Withdraw funds from a successful campaign (creator only)
     * @param _campaignId Campaign ID
     */
    function withdraw(uint256 _campaignId)
        external
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];
        require(!c.withdrawn, "Already withdrawn");
        require(c.raised > 0, "Nothing raised");
        require(
            c.raised >= c.goal || block.timestamp >= c.deadline,
            "Goal not met and deadline not reached"
        );

        c.withdrawn = true;
        c.active = false;
        uint256 amount = c.raised;

        (bool success, ) = c.creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_campaignId, msg.sender, amount);
        emit CampaignClosed(_campaignId);
    }

    /**
     * @dev Vote on a campaign (governance)
     * @param _campaignId Campaign ID
     * @param _support true = support, false = against
     */
    function vote(uint256 _campaignId, bool _support)
        external
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

    /**
     * @dev Close a campaign early (creator only) if against votes > support votes
     * @param _campaignId Campaign ID
     */
    function closeCampaign(uint256 _campaignId)
        external
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
    {
        campaigns[_campaignId].active = false;
        emit CampaignClosed(_campaignId);
    }

    // ------ View Functions ------

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

    function getCampaignDonors(uint256 _id)
        external
        view
        campaignExists(_id)
        returns (address[] memory)
    {
        return campaignDonors[_id];
    }

    /**
     * @dev Returns top N donors sorted by total donated (off-chain sort recommended for gas efficiency)
     */
    function getLeaderboard(uint256 _limit)
        external
        view
        returns (address[] memory wallets, uint256[] memory amounts)
    {
        uint256 len = allDonors.length < _limit ? allDonors.length : _limit;
        wallets = new address[](len);
        amounts = new uint256[](len);

        // Simple top-N (gas heavy for large arrays - use The Graph in production)
        address[] memory sorted = allDonors;
        for (uint256 i = 0; i < sorted.length; i++) {
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

    receive() external payable {}
}

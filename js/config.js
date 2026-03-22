/**
 * config.js — Contract ABIs, addresses, and network config for TrustChain
 * Configured for Mantle Network (Mainnet & Sepolia Testnet)
 */

// ── Network Configuration ──────────────────────────────────
window.NETWORKS = {
  5000: {
    name: 'Mantle Mainnet',
    shortName: 'Mantle',
    currency: 'MNT',
    decimals: 18,
    explorer: 'https://mantlescan.xyz',
    rpcUrl: 'https://rpc.mantle.xyz',
    isTestnet: false
  },
  5003: {
    name: 'Mantle Sepolia',
    shortName: 'Mantle Sepolia',
    currency: 'MNT',
    decimals: 18,
    explorer: 'https://sepolia.mantlescan.xyz',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    isTestnet: true
  },
  31337: {
    name: 'Localhost',
    shortName: 'Local',
    currency: 'ETH',
    decimals: 18,
    explorer: '',
    rpcUrl: 'http://127.0.0.1:8545',
    isTestnet: true
  }
};

// Default network (Mantle Sepolia for testing)
window.DEFAULT_CHAIN_ID = 5003;

// ── Deployed Contract Addresses — UPDATE AFTER DEPLOYMENT ──────────
window.CONTRACT_ADDRESSES = {
  // Mantle Mainnet
  5000: {
    CharityFund: '',
    CharityNFT: ''
  },
  // Mantle Sepolia Testnet
  5003: {
    CharityFund: '',
    CharityNFT: ''
  },
  // Localhost (Hardhat)
  31337: {
    CharityFund: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    CharityNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  }
};

// ── CharityFund ABI ────────────────────────────────────────
window.CHARITY_FUND_ABI = [
  // Write functions
  "function createCampaign(string _title, string _description, string _category, string _imageUrl, string _ipfsHash, uint256 _goal, uint256 _durationDays) returns (uint256)",
  "function donate(uint256 _campaignId) payable",
  "function withdraw(uint256 _campaignId)",
  "function vote(uint256 _campaignId, bool _support)",
  "function cancelCampaign(uint256 _campaignId)",

  // Read functions
  "function getCampaign(uint256 _id) view returns (tuple(uint256 id, address creator, string title, string description, string category, string imageUrl, string ipfsHash, uint256 goal, uint256 raised, uint256 deadline, bool withdrawn, bool active, uint256 donorCount, uint256 voteCount, uint256 againstCount, uint256 createdAt, uint8 status))",
  "function getAllCampaigns() view returns (tuple(uint256 id, address creator, string title, string description, string category, string imageUrl, string ipfsHash, uint256 goal, uint256 raised, uint256 deadline, bool withdrawn, bool active, uint256 donorCount, uint256 voteCount, uint256 againstCount, uint256 createdAt, uint8 status)[])",
  "function getActiveCampaigns() view returns (tuple(uint256 id, address creator, string title, string description, string category, string imageUrl, string ipfsHash, uint256 goal, uint256 raised, uint256 deadline, bool withdrawn, bool active, uint256 donorCount, uint256 voteCount, uint256 againstCount, uint256 createdAt, uint8 status)[])",
  "function getCampaignsByCategory(string _category) view returns (tuple(uint256 id, address creator, string title, string description, string category, string imageUrl, string ipfsHash, uint256 goal, uint256 raised, uint256 deadline, bool withdrawn, bool active, uint256 donorCount, uint256 voteCount, uint256 againstCount, uint256 createdAt, uint8 status)[])",
  "function getCampaignDonors(uint256 _id) view returns (address[])",
  "function getCampaignDonations(uint256 _id) view returns (tuple(uint256 campaignId, address donor, uint256 amount, uint256 timestamp, uint256 nftTokenId)[])",
  "function getUserCampaigns(address _user) view returns (uint256[])",
  "function getUserDonations(address _user) view returns (tuple(uint256 campaignId, address donor, uint256 amount, uint256 timestamp, uint256 nftTokenId)[])",
  "function getDonorStats(address _donor) view returns (tuple(address wallet, uint256 totalDonated, uint256 donationCount, uint256 firstDonation, uint256 nftCount))",
  "function getLeaderboard(uint256 _limit) view returns (address[] wallets, uint256[] amounts)",
  "function getStats() view returns (uint256 totalCampaigns, uint256 totalRaised, uint256 totalDonors)",
  "function donationsByAddress(uint256, address) view returns (uint256)",
  "function hasVoted(uint256, address) view returns (bool)",
  "function campaignCount() view returns (uint256)",
  "function calculatePlatformFee(uint256 _amount) view returns (uint256)",
  "function platformFeePercent() view returns (uint256)",
  "function minGoal() view returns (uint256)",
  "function maxGoal() view returns (uint256)",

  // Events
  "event CampaignCreated(uint256 indexed id, address indexed creator, string title, string category, uint256 goal, uint256 deadline)",
  "event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 tokenId, string tier)",
  "event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount, uint256 platformFee)",
  "event VoteCast(uint256 indexed campaignId, address indexed voter, bool support)",
  "event CampaignCancelled(uint256 indexed campaignId, address indexed creator)",
  "event CampaignStatusChanged(uint256 indexed campaignId, uint8 newStatus)"
];

// ── CharityNFT ABI ─────────────────────────────────────────
window.CHARITY_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getReceipt(uint256 _tokenId) view returns (tuple(address donor, uint256 campaignId, uint256 amount, uint256 timestamp, string campaignTitle, string tier))",
  "function getDonorTokens(address _donor) view returns (uint256[])",
  "function getTier(uint256 _amount) view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "event ReceiptMinted(address indexed donor, uint256 indexed campaignId, uint256 indexed tokenId, string tier, uint256 amount)"
];

// ── Categories ─────────────────────────────────────────────
window.CATEGORIES = [
  { label: 'All', icon: '🌍', value: 'all' },
  { label: 'Education', icon: '📚', value: 'Education' },
  { label: 'Healthcare', icon: '🏥', value: 'Healthcare' },
  { label: 'Disaster Relief', icon: '🆘', value: 'Disaster Relief' },
  { label: 'Environment', icon: '🌿', value: 'Environment' },
  { label: 'Hunger', icon: '🍱', value: 'Hunger' },
  { label: 'Animal Welfare', icon: '🐾', value: 'Animal Welfare' },
  { label: 'Community', icon: '🤝', value: 'Community' },
  { label: 'Technology', icon: '💻', value: 'Technology' },
  { label: 'Other', icon: '💡', value: 'Other' }
];

// ── NFT Tier Thresholds (in MNT) ───────────────────────────
window.NFT_TIERS = {
  bronze: { min: 0.001, label: 'Bronze', color: '#CD7F32' },
  silver: { min: 0.01, label: 'Silver', color: '#C0C0C0' },
  gold: { min: 0.1, label: 'Gold', color: '#FFD700' },
  diamond: { min: 1, label: 'Diamond', color: '#00D4AA' }
};

// ── Demo/Mock Data (shown when not connected or no contract data) ─────
window.DEMO_CAMPAIGNS = [
  {
    id: 1,
    creator: '0x1234567890123456789012345678901234567890',
    title: 'Clean Water for Rural Kenya',
    category: 'Healthcare',
    description: 'Providing clean, safe drinking water to 5 remote villages in rural Kenya that currently rely on contaminated water sources. This project will install solar-powered water purification systems.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format',
    ipfsHash: '',
    goal: '5000000000000000000',
    raised: '3200000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 864000,
    active: true,
    withdrawn: false,
    donorCount: 142,
    voteCount: 98,
    againstCount: 4,
    createdAt: Math.floor(Date.now() / 1000) - 604800,
    status: 0
  },
  {
    id: 2,
    creator: '0x2345678901234567890123456789012345678901',
    title: 'Education Fund for Orphaned Children',
    category: 'Education',
    description: 'Funding school supplies, uniforms, and tuition fees for 200 orphaned children in Southeast Asia. Every child deserves the right to quality education regardless of their circumstances.',
    imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format',
    ipfsHash: '',
    goal: '10000000000000000000',
    raised: '10000000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 259200,
    active: true,
    withdrawn: false,
    donorCount: 389,
    voteCount: 312,
    againstCount: 2,
    createdAt: Math.floor(Date.now() / 1000) - 1209600,
    status: 1
  },
  {
    id: 3,
    creator: '0x3456789012345678901234567890123456789012',
    title: 'Wildfire Emergency Relief Fund',
    category: 'Disaster Relief',
    description: 'Emergency support for 1,200 families displaced by recent wildfires. Funds cover temporary shelter, food, clothing, and medical assistance for those who lost everything.',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format',
    ipfsHash: '',
    goal: '20000000000000000000',
    raised: '8750000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 432000,
    active: true,
    withdrawn: false,
    donorCount: 521,
    voteCount: 445,
    againstCount: 8,
    createdAt: Math.floor(Date.now() / 1000) - 432000,
    status: 0
  },
  {
    id: 4,
    creator: '0x4567890123456789012345678901234567890123',
    title: 'Ocean Plastic Cleanup Initiative',
    category: 'Environment',
    description: 'Deploying automated ocean cleanup vessels to remove plastic waste from the Pacific. Every MNT donated removes approximately 2kg of plastic from our oceans.',
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&auto=format',
    ipfsHash: '',
    goal: '15000000000000000000',
    raised: '4100000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 1728000,
    active: true,
    withdrawn: false,
    donorCount: 203,
    voteCount: 176,
    againstCount: 12,
    createdAt: Math.floor(Date.now() / 1000) - 259200,
    status: 0
  },
  {
    id: 5,
    creator: '0x5678901234567890123456789012345678901234',
    title: 'Tech Education for Underserved Youth',
    category: 'Technology',
    description: 'Providing coding bootcamps and computer equipment to underprivileged teenagers. Building the next generation of developers from communities that lack access to tech education.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format',
    ipfsHash: '',
    goal: '8000000000000000000',
    raised: '5600000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 2592000,
    active: true,
    withdrawn: false,
    donorCount: 187,
    voteCount: 164,
    againstCount: 3,
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    status: 0
  },
  {
    id: 6,
    creator: '0x6789012345678901234567890123456789012345',
    title: 'Reforestation — Amazon Rainforest',
    category: 'Environment',
    description: 'Planting 100,000 native trees in deforested areas of the Amazon in collaboration with indigenous communities who will maintain and protect the ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format',
    ipfsHash: '',
    goal: '12000000000000000000',
    raised: '11800000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 86400,
    active: true,
    withdrawn: false,
    donorCount: 678,
    voteCount: 590,
    againstCount: 5,
    createdAt: Math.floor(Date.now() / 1000) - 2592000,
    status: 0
  }
];

window.DEMO_LEADERBOARD = [
  { address: '0xAbCd1234567890abcdef1234567890AbCd123456', total: '12500000000000000000', count: 23, badge: 'Diamond' },
  { address: '0xBcDe2345678901bcdef2345678901BcDe234567', total: '8200000000000000000', count: 15, badge: 'Diamond' },
  { address: '0xCdEf3456789012cdef3456789012CdEf345678', total: '5400000000000000000', count: 31, badge: 'Gold' },
  { address: '0xDeF04567890123def04567890123DeF0456789', total: '3100000000000000000', count: 9, badge: 'Gold' },
  { address: '0xEf015678901234ef015678901234Ef01567890', total: '1750000000000000000', count: 7, badge: 'Gold' },
  { address: '0xF0126789012345f0126789012345F012678901', total: '950000000000000000', count: 12, badge: 'Silver' },
  { address: '0x01237890123456012378901234560123789012', total: '420000000000000000', count: 4, badge: 'Silver' },
  { address: '0x12348901234567123489012345671234890123', total: '180000000000000000', count: 2, badge: 'Bronze' }
];

// ── Utility: Get tier for amount ───────────────────────────
window.getTierForAmount = function(amountWei) {
  const eth = parseFloat(amountWei) / 1e18;
  if (eth >= window.NFT_TIERS.diamond.min) return window.NFT_TIERS.diamond;
  if (eth >= window.NFT_TIERS.gold.min) return window.NFT_TIERS.gold;
  if (eth >= window.NFT_TIERS.silver.min) return window.NFT_TIERS.silver;
  return window.NFT_TIERS.bronze;
};

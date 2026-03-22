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
    CharityFund: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CharityNFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
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
    title: 'UNICEF Emergency Children\'s Fund 2025',
    category: 'Healthcare',
    description: 'UNICEF\'s emergency response fund provides life-saving support to children caught in crises — from war zones to natural disasters. Every donation provides vaccines, nutrition, clean water, and safe spaces for children in over 190 countries.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format',
    ipfsHash: '',
    goal: '50000000000000000000',
    raised: '38200000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 2592000,
    active: true, withdrawn: false,
    donorCount: 4821, voteCount: 3980, againstCount: 12,
    createdAt: Math.floor(Date.now() / 1000) - 1296000, status: 0
  },
  {
    id: 2,
    creator: '0x2345678901234567890123456789012345678901',
    title: 'Doctors Without Borders — Gaza Crisis Response',
    category: 'Healthcare',
    description: 'Médecins Sans Frontières (MSF) delivers emergency medical aid in the world\'s most dangerous conflict zones. Funds support surgical care, trauma treatment, and mental health services for civilians injured in active conflict.',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format',
    ipfsHash: '',
    goal: '100000000000000000000',
    raised: '71500000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 1728000,
    active: true, withdrawn: false,
    donorCount: 8230, voteCount: 7200, againstCount: 5,
    createdAt: Math.floor(Date.now() / 1000) - 864000, status: 0
  },
  {
    id: 3,
    creator: '0x3456789012345678901234567890123456789012',
    title: 'WWF Amazon & Congo Rainforest Protection',
    category: 'Environment',
    description: 'The World Wildlife Fund is protecting the world\'s two largest rainforests from illegal logging, agriculture expansion, and climate change. Your donation funds ranger patrols, satellite monitoring, and indigenous land rights advocacy.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format',
    ipfsHash: '',
    goal: '75000000000000000000',
    raised: '52100000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 3888000,
    active: true, withdrawn: false,
    donorCount: 3412, voteCount: 3100, againstCount: 18,
    createdAt: Math.floor(Date.now() / 1000) - 2592000, status: 0
  },
  {
    id: 4,
    creator: '0x4567890123456789012345678901234567890123',
    title: 'Red Cross Ukraine Humanitarian Relief',
    category: 'Disaster Relief',
    description: 'The International Red Cross is providing urgent humanitarian assistance to millions of Ukrainians displaced by conflict. Funds cover food, shelter, medical care, and family reunification services across the region.',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format',
    ipfsHash: '',
    goal: '200000000000000000000',
    raised: '168000000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 5184000,
    active: true, withdrawn: false,
    donorCount: 15820, voteCount: 14100, againstCount: 23,
    createdAt: Math.floor(Date.now() / 1000) - 3888000, status: 0
  },
  {
    id: 5,
    creator: '0x5678901234567890123456789012345678901234',
    title: 'WHO Global Health for All Initiative',
    category: 'Healthcare',
    description: 'The World Health Organization\'s Health for All initiative expands access to primary healthcare in low-income countries. Funding supports vaccine deployment, disease surveillance, clean water programs, and training of 50,000 community health workers.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format',
    ipfsHash: '',
    goal: '80000000000000000000',
    raised: '47300000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 7776000,
    active: true, withdrawn: false,
    donorCount: 6100, voteCount: 5400, againstCount: 8,
    createdAt: Math.floor(Date.now() / 1000) - 1728000, status: 0
  },
  {
    id: 6,
    creator: '0x6789012345678901234567890123456789012345',
    title: 'Save the Children — Syria Education Access',
    category: 'Education',
    description: 'Save the Children is rebuilding schools, training teachers, and providing psychological first aid to children traumatized by war in Syria. Over 2.4 million Syrian children are currently out of school and need your help.',
    imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format',
    ipfsHash: '',
    goal: '40000000000000000000',
    raised: '27800000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 4320000,
    active: true, withdrawn: false,
    donorCount: 2890, voteCount: 2600, againstCount: 6,
    createdAt: Math.floor(Date.now() / 1000) - 2160000, status: 0
  },
  {
    id: 7,
    creator: '0x7890123456789012345678901234567890123456',
    title: 'Habitat for Humanity — Africa Housing Project',
    category: 'Community',
    description: 'Habitat for Humanity is building affordable, durable homes for families living in informal settlements across Kenya, Ethiopia, and South Africa. Each home costs approximately 3,500 USD and transforms a family\'s future.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format',
    ipfsHash: '',
    goal: '30000000000000000000',
    raised: '19600000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 6480000,
    active: true, withdrawn: false,
    donorCount: 1740, voteCount: 1550, againstCount: 4,
    createdAt: Math.floor(Date.now() / 1000) - 1080000, status: 0
  },
  {
    id: 8,
    creator: '0x8901234567890123456789012345678901234567',
    title: 'Ocean Conservancy — Great Pacific Cleanup 2025',
    category: 'Environment',
    description: 'Ocean Conservancy launched the largest coordinated ocean cleanup in history, targeting the Great Pacific Garbage Patch and coastlines in 60 countries. Your donation deploys cleanup vessels and funds local volunteer training.',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format',
    ipfsHash: '',
    goal: '60000000000000000000',
    raised: '34100000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 8640000,
    active: true, withdrawn: false,
    donorCount: 4230, voteCount: 3800, againstCount: 15,
    createdAt: Math.floor(Date.now() / 1000) - 432000, status: 0
  },
  {
    id: 9,
    creator: '0x9012345678901234567890123456789012345678',
    title: 'Khan Academy — Free Education for 1 Billion',
    category: 'Education',
    description: 'Khan Academy provides free, world-class education for anyone, anywhere. This campaign funds content translation into 40+ languages, AI tutoring tools for underserved students, and computing infrastructure for 1 billion learners.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format',
    ipfsHash: '',
    goal: '25000000000000000000',
    raised: '25000000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 259200,
    active: true, withdrawn: false,
    donorCount: 9870, voteCount: 9200, againstCount: 2,
    createdAt: Math.floor(Date.now() / 1000) - 5184000, status: 1
  },
  {
    id: 10,
    creator: '0xa012345678901234567890123456789012345678',
    title: 'Feeding America — End Childhood Hunger',
    category: 'Hunger',
    description: 'Feeding America\'s national network of 200 food banks is fighting childhood hunger across the United States. 1 in 5 American children faces food insecurity — your donation provides 10 meals per dollar to families in need.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format',
    ipfsHash: '',
    goal: '45000000000000000000',
    raised: '31200000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 3024000,
    active: true, withdrawn: false,
    donorCount: 5630, voteCount: 5100, againstCount: 7,
    createdAt: Math.floor(Date.now() / 1000) - 691200, status: 0
  },
  {
    id: 11,
    creator: '0xb012345678901234567890123456789012345678',
    title: 'Global Fund — End AIDS, TB & Malaria',
    category: 'Healthcare',
    description: 'The Global Fund finances programs to defeat AIDS, tuberculosis, and malaria — three of the world\'s most devastating diseases. Funded programs have saved 55 million lives. Help us reach the next 55 million.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format',
    ipfsHash: '',
    goal: '150000000000000000000',
    raised: '110000000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 10368000,
    active: true, withdrawn: false,
    donorCount: 12400, voteCount: 11000, againstCount: 9,
    createdAt: Math.floor(Date.now() / 1000) - 4320000, status: 0
  },
  {
    id: 12,
    creator: '0xc012345678901234567890123456789012345678',
    title: 'Girls Who Code — Close the Gender Gap in Tech',
    category: 'Technology',
    description: 'Girls Who Code runs after-school clubs and summer programs teaching girls to code across 50+ countries. This campaign funds scholarships, mentorship, and job placement support so women can thrive in the tech industry.',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format',
    ipfsHash: '',
    goal: '20000000000000000000',
    raised: '14700000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 5616000,
    active: true, withdrawn: false,
    donorCount: 2180, voteCount: 1900, againstCount: 3,
    createdAt: Math.floor(Date.now() / 1000) - 345600, status: 0
  },
  {
    id: 13,
    creator: '0xd012345678901234567890123456789012345678',
    title: 'Amnesty International — Defend Human Rights Defenders',
    category: 'Community',
    description: 'Amnesty International campaigns for the release of political prisoners, investigates human rights abuses, and provides legal support to activists facing persecution. Over 3,000 people are listed as prisoners of conscience worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format',
    ipfsHash: '',
    goal: '18000000000000000000',
    raised: '9800000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 7200000,
    active: true, withdrawn: false,
    donorCount: 3210, voteCount: 2900, againstCount: 45,
    createdAt: Math.floor(Date.now() / 1000) - 2246400, status: 0
  },
  {
    id: 14,
    creator: '0xe012345678901234567890123456789012345678',
    title: 'Wikimedia Foundation — Keep Knowledge Free',
    category: 'Technology',
    description: 'Wikipedia is the world\'s largest free knowledge base, used by 1.5 billion people every month. The Wikimedia Foundation needs funding to maintain servers, fight misinformation, and expand content into underrepresented languages.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format',
    ipfsHash: '',
    goal: '12000000000000000000',
    raised: '8900000000000000000',
    deadline: Math.floor(Date.now() / 1000) + 4752000,
    active: true, withdrawn: false,
    donorCount: 7650, voteCount: 7100, againstCount: 11,
    createdAt: Math.floor(Date.now() / 1000) - 1555200, status: 0
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

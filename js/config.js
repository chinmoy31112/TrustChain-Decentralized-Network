/**
 * config.js — Contract ABIs, addresses, and network config
 * Replace CONTRACT_ADDRESSES with your deployed contract addresses
 */

// ── Network Configuration ──────────────────────────────────
window.NETWORKS = {
  1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  5: { name: 'Goerli Testnet',   explorer: 'https://goerli.etherscan.io' },
  11155111: { name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  137: { name: 'Polygon',        explorer: 'https://polygonscan.com' },
  31337: { name: 'Localhost (Hardhat)', explorer: '' },
};

// ── Deployed Addresses — UPDATE AFTER DEPLOYMENT ──────────
window.CONTRACT_ADDRESSES = {
  1:        { CharityFund: '', CharityNFT: '' },
  5:        { CharityFund: '0xYourGoerliCharityFundAddress',  CharityNFT: '0xYourGoerliNFTAddress' },
  11155111: { CharityFund: '0xYourSepoliaCharityFundAddress', CharityNFT: '0xYourSepoliaNFTAddress' },
  31337:    { CharityFund: '0x5FbDB2315678afecb367f032d93F642f64180aa3', CharityNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' },
};

// ── CharityFund ABI ────────────────────────────────────────
window.CHARITY_FUND_ABI = [
  "function createCampaign(string,string,string,string,uint256,uint256) returns (uint256)",
  "function donate(uint256) payable",
  "function withdraw(uint256)",
  "function vote(uint256,bool)",
  "function closeCampaign(uint256)",
  "function getCampaign(uint256) view returns (tuple(uint256 id,address creator,string title,string description,string category,string imageUrl,uint256 goal,uint256 raised,uint256 deadline,bool withdrawn,bool active,uint256 donorCount,uint256 voteCount,uint256 againstCount))",
  "function getAllCampaigns() view returns (tuple(uint256 id,address creator,string title,string description,string category,string imageUrl,uint256 goal,uint256 raised,uint256 deadline,bool withdrawn,bool active,uint256 donorCount,uint256 voteCount,uint256 againstCount)[])",
  "function getCampaignDonors(uint256) view returns (address[])",
  "function getLeaderboard(uint256) view returns (address[],uint256[])",
  "function getStats() view returns (uint256,uint256,uint256)",
  "function donorStats(address) view returns (address wallet,uint256 totalDonated,uint256 donationCount,uint256 firstDonation)",
  "function donationsByAddress(uint256,address) view returns (uint256)",
  "function hasVoted(uint256,address) view returns (bool)",
  "function campaignCount() view returns (uint256)",
  "event CampaignCreated(uint256 indexed id,address indexed creator,string title,uint256 goal,uint256 deadline)",
  "event DonationMade(uint256 indexed campaignId,address indexed donor,uint256 amount,uint256 tokenId)",
  "event FundsWithdrawn(uint256 indexed campaignId,address indexed creator,uint256 amount)",
  "event VoteCast(uint256 indexed campaignId,address indexed voter,bool support)",
  "event CampaignClosed(uint256 indexed campaignId)"
];

// ── CharityNFT ABI ─────────────────────────────────────────
window.CHARITY_NFT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function tokenURI(uint256) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function receipts(uint256) view returns (address donor,uint256 campaignId,uint256 amount,uint256 timestamp,string campaignTitle,string badge)",
  "function ownerOf(uint256) view returns (address)",
  "event ReceiptMinted(address indexed donor,uint256 indexed campaignId,uint256 tokenId,string badge)"
];

// ── Demo/Mock Data (shown when no wallet is connected) ─────
window.DEMO_CAMPAIGNS = [
  {
    id: 1, creator: '0x1234567890123456789012345678901234567890',
    title: 'Clean Water for Rural Kenya', category: 'Healthcare',
    description: 'Providing clean, safe drinking water to 5 remote villages in rural Kenya that currently rely on contaminated water sources. This project will install solar-powered water purification systems.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format',
    goal: '5000000000000000000', raised: '3200000000000000000',
    deadline: Math.floor(Date.now()/1000) + 864000,
    active: true, withdrawn: false, donorCount: 142, voteCount: 98, againstCount: 4
  },
  {
    id: 2, creator: '0x2345678901234567890123456789012345678901',
    title: 'Education Fund for Orphaned Children', category: 'Education',
    description: 'Funding school supplies, uniforms, and tuition fees for 200 orphaned children in Southeast Asia. Every child deserves the right to quality education regardless of their circumstances.',
    imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format',
    goal: '10000000000000000000', raised: '10000000000000000000',
    deadline: Math.floor(Date.now()/1000) + 259200,
    active: true, withdrawn: false, donorCount: 389, voteCount: 312, againstCount: 2
  },
  {
    id: 3, creator: '0x3456789012345678901234567890123456789012',
    title: 'Wildfire Emergency Relief Fund', category: 'Disaster Relief',
    description: 'Emergency support for 1,200 families displaced by recent wildfires. Funds cover temporary shelter, food, clothing, and medical assistance for those who lost everything.',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format',
    goal: '20000000000000000000', raised: '8750000000000000000',
    deadline: Math.floor(Date.now()/1000) + 432000,
    active: true, withdrawn: false, donorCount: 521, voteCount: 445, againstCount: 8
  },
  {
    id: 4, creator: '0x4567890123456789012345678901234567890123',
    title: 'Ocean Plastic Cleanup Initiative', category: 'Environment',
    description: 'Deploying automated ocean cleanup vessels to remove plastic waste from the Pacific Ocean Garbage Patch. Every ETH donated removes approximately 2kg of plastic from our oceans.',
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&auto=format',
    goal: '15000000000000000000', raised: '4100000000000000000',
    deadline: Math.floor(Date.now()/1000) + 1728000,
    active: true, withdrawn: false, donorCount: 203, voteCount: 176, againstCount: 12
  },
  {
    id: 5, creator: '0x5678901234567890123456789012345678901234',
    title: 'Mental Health Crisis Hotline Network', category: 'Healthcare',
    description: 'Expanding a 24/7 mental health crisis helpline to 12 additional countries where mental health services are severely underfunded. Trained counselors available in 30+ languages.',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format',
    goal: '8000000000000000000', raised: '2300000000000000000',
    deadline: Math.floor(Date.now()/1000) + 2592000,
    active: true, withdrawn: false, donorCount: 87, voteCount: 64, againstCount: 3
  },
  {
    id: 6, creator: '0x6789012345678901234567890123456789012345',
    title: 'Reforestation — Amazon Rainforest', category: 'Environment',
    description: 'Planting 100,000 native trees in deforested areas of the Amazon Rainforest in collaboration with indigenous communities who will maintain and protect the ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format',
    goal: '12000000000000000000', raised: '11800000000000000000',
    deadline: Math.floor(Date.now()/1000) + 86400,
    active: true, withdrawn: false, donorCount: 678, voteCount: 590, againstCount: 5
  }
];

window.DEMO_LEADERBOARD = [
  { address: '0xAbCd1234567890abcdef1234567890AbCd123456', total: '12500000000000000000', count: 23, badge: 'Diamond' },
  { address: '0xBcDe2345678901bcdef2345678901BcDe234567', total: '8200000000000000000',  count: 15, badge: 'Diamond' },
  { address: '0xCdEf3456789012cdef3456789012CdEf345678', total: '5400000000000000000',  count: 31, badge: 'Gold' },
  { address: '0xDeF04567890123def04567890123DeF0456789', total: '3100000000000000000',  count: 9,  badge: 'Gold' },
  { address: '0xEf015678901234ef015678901234Ef01567890', total: '1750000000000000000',  count: 7,  badge: 'Gold' },
  { address: '0xF0126789012345f0126789012345F012678901', total: '950000000000000000',   count: 12, badge: 'Silver' },
  { address: '0x01237890123456012378901234560123789012', total: '420000000000000000',   count: 4,  badge: 'Silver' },
  { address: '0x12348901234567123489012345671234890123', total: '180000000000000000',   count: 2,  badge: 'Bronze' },
];

window.CATEGORIES = [
  { label: 'All',           icon: '🌍', value: 'all' },
  { label: 'Education',     icon: '📚', value: 'Education' },
  { label: 'Healthcare',    icon: '🏥', value: 'Healthcare' },
  { label: 'Disaster Relief', icon: '🆘', value: 'Disaster Relief' },
  { label: 'Environment',   icon: '🌿', value: 'Environment' },
  { label: 'Hunger',        icon: '🍱', value: 'Hunger' },
  { label: 'Animal Welfare', icon: '🐾', value: 'Animal Welfare' },
  { label: 'Community',     icon: '🤝', value: 'Community' },
  { label: 'Other',         icon: '💡', value: 'Other' },
];

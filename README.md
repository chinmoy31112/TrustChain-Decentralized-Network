# 🔗 TrustChain — Decentralized Charity Platform

A fully decentralized charity fundraising platform built on **Mantle Network**. All funds, campaigns, and donor records are stored immutably on-chain with low gas fees. Donors receive on-chain NFT receipts for every donation.

![Platform](https://img.shields.io/badge/Platform-Mantle%20Network-00D4AA?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## ✨ Features

### 🔗 Blockchain Features
- **Smart Contract Based**: All campaigns secured by Solidity smart contracts on Mantle Network
- **NFT Receipts**: Automatic NFT minting for donors with 4 tiers (Bronze/Silver/Gold/Diamond)
- **Multi-Wallet Support**: MetaMask, Phantom (EVM), OKX, Coinbase, Brave wallets
- **Low Gas Fees**: Built on Mantle Network for affordable transactions
- **On-Chain Governance**: Community voting system for campaigns
- **100% Transparent**: All transactions verifiable on Mantle blockchain

### 💎 Platform Features
- **Campaign Creation**: Multi-step form with image URL & IPFS hash support
- **Live Search System**: Real-time search with autocomplete suggestions
- **Advanced Filters**: Category filters, status filters, and sorting options
- **Donor Leaderboard**: Global rankings by total contributions
- **Personal Dashboard**: Track your campaigns, donations, and NFT collection
- **Campaign Management**: Withdraw funds, cancel campaigns, vote on causes
- **Platform Fee**: 2.5% fee system with configurable limits

### 🎨 UI/UX Features
- **Glassmorphism Design**: Modern, premium dark theme interface
- **Animated Backgrounds**: Particle systems and gradient orbs
- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **Toast Notifications**: Real-time user feedback
- **Smooth Animations**: Polished transitions and loading states
- **Modern Components**: Cards, badges, modals, tabs, filters

---

## 📁 Project Structure

```
Charity-with-decentralized-Network/
├── index.html                 # Landing page with hero, stats, featured campaigns
├── campaigns.html             # Browse & filter campaigns with live search
├── campaign-detail.html       # View campaign, donate, vote, and withdraw
├── create-campaign.html       # Multi-step campaign creation form
├── dashboard.html             # User dashboard with donations & NFTs
├── leaderboard.html           # Top donors and campaigns rankings
├── profile.html               # View any user's profile and activity
│
├── css/
│   └── styles.css             # Complete styling with glassmorphism theme
│
├── js/
│   ├── config.js              # Contract ABIs, addresses, network config
│   └── web3.js                # Web3 connection, wallet detection, utilities
│
├── contracts/
│   ├── CharityFund.sol        # Main contract: campaigns, donations, withdrawals
│   └── CharityNFT.sol         # ERC721 NFT receipt contract with on-chain SVG
│
├── scripts/
│   └── deploy.js              # Hardhat deployment script for Mantle
│
├── hardhat.config.js          # Hardhat config with Mantle networks
├── package.json               # Dependencies and npm scripts
└── .env.example               # Environment template
```

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 16.0.0
npm >= 8.0.0
```

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your private key (without 0x prefix)
```

3. **Compile contracts**
```bash
npm run compile
```

### Local Development

Start a local web server to view the frontend:

```bash
npm run dev
# Opens on http://localhost:3000
```

Or use any static server:
```bash
python -m http.server 3000
# or
npx serve
```

---

## 🔧 Smart Contract Deployment

### Deploy to Mantle Sepolia Testnet

```bash
npm run deploy:testnet
```

### Deploy to Mantle Mainnet

```bash
npm run deploy:mainnet
```

### After Deployment

1. **Copy contract addresses** from the console output
2. **Update `js/config.js`** with your deployed addresses:

```javascript
window.CONTRACT_ADDRESSES = {
  5003: { // Mantle Sepolia
    CharityFund: '0xYOUR_FUND_CONTRACT_ADDRESS',
    CharityNFT: '0xYOUR_NFT_CONTRACT_ADDRESS'
  },
  5000: { // Mantle Mainnet
    CharityFund: '0xYOUR_FUND_CONTRACT_ADDRESS',
    CharityNFT: '0xYOUR_NFT_CONTRACT_ADDRESS'
  }
};
```

3. **Test the platform** by connecting your wallet and creating a campaign

---

## 🌍 Network Configuration

### Mantle Mainnet
- **Chain ID**: 5000
- **RPC URL**: https://rpc.mantle.xyz
- **Explorer**: https://mantlescan.xyz
- **Currency**: MNT

### Mantle Sepolia Testnet
- **Chain ID**: 5003
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Explorer**: https://sepolia.mantlescan.xyz
- **Faucet**: Get test MNT from Mantle faucet

The platform automatically adds Mantle Network to your wallet when you connect!

---

## 💡 How to Use

### For Donors

1. **Connect Wallet**: Click "Connect Wallet" (supports MetaMask, Phantom, OKX, Coinbase, Brave)
2. **Browse Campaigns**: Use search, filters, and categories to find causes
3. **Donate**:
   - Open any active campaign
   - Click "Donate Now"
   - Enter amount in MNT
   - Confirm transaction
4. **Receive NFT**: Automatic NFT receipt minted to your wallet based on donation amount
5. **View Dashboard**: Check your donations, NFTs, and stats

### For Campaign Creators

1. **Connect Wallet**: Ensure you're on Mantle Network
2. **Create Campaign**:
   - Click "Start Campaign"
   - Complete 3-step form:
     - Step 1: Title, category, description
     - Step 2: Image URL, goal, duration
     - Step 3: Preview and deploy
3. **Share Campaign**: Use social sharing buttons
4. **Monitor Progress**: Track in Dashboard
5. **Withdraw Funds**: After goal met or deadline reached, click "Withdraw Funds"

---

## 🏅 NFT Tier System

Donors receive NFT receipts based on their donation amount:

| Tier | Threshold | Visual |
|------|-----------|--------|
| 🥉 Bronze | 0.001+ MNT | Bronze gradient |
| 🥈 Silver | 0.01+ MNT | Silver gradient |
| 🥇 Gold | 0.1+ MNT | Gold gradient |
| 💎 Diamond | 1+ MNT | Diamond gradient |

NFTs are:
- Fully on-chain (SVG metadata)
- Enumerable (track all user NFTs)
- Transferable (ERC-721 standard)
- Immutable proof of donation

---

## 🔒 Security Features

### Smart Contract Security
- ✅ **ReentrancyGuard**: Prevents reentrancy attacks on donations/withdrawals
- ✅ **Checks-Effects-Interactions**: Safe order of operations
- ✅ **Access Control** (Ownable): Admin functions protected
- ✅ **Pausable**: Emergency pause mechanism
- ✅ **Input Validation**: All parameters validated
- ✅ **Safe Math**: Overflow protection (Solidity 0.8+)
- ✅ **Platform Fee Limits**: Maximum 10% cap
- ✅ **Refund Mechanism**: Automatic refunds on campaign cancellation

### Campaign Security
- Only campaign owners can withdraw their funds
- Withdrawals only allowed after goal met OR deadline passed
- Each address can vote only once per campaign
- NFT minting restricted to CharityFund contract
- Campaign cancellation refunds all donors automatically

---

## 🎨 Supported Wallets

The platform detects and supports multiple wallets:

- **MetaMask** (Browser extension)
- **Phantom** (EVM mode)
- **OKX Wallet**
- **Coinbase Wallet**
- **Brave Wallet**
- Any browser wallet with `window.ethereum`

### Wallet Features
- Auto-detection of installed wallets
- Network switching with `wallet_switchEthereumChain`
- Permission requests with `wallet_requestPermissions`
- Auto-add Mantle Network if not present
- Multi-wallet support simultaneous installation handling

---

## 📊 Platform Statistics

Track global platform metrics:
- Total MNT raised across all campaigns
- Total number of campaigns created
- Total unique donors
- Active campaigns count
- Top donor rankings
- Most funded campaigns

All stats are calculated on-chain in real-time!

---

## 🛠️ Contract Functions

### CharityFund.sol

**Create Campaign**
```solidity
createCampaign(string title, string description, string category,
               string imageUrl, string ipfsHash, uint256 goal, uint256 durationDays)
```

**Donate**
```solidity
donate(uint256 campaignId) payable
// Automatically mints NFT receipt
```

**Withdraw**
```solidity
withdraw(uint256 campaignId)
// Only owner, after goal or deadline
```

**Vote**
```solidity
vote(uint256 campaignId, bool support)
// Community governance voting
```

**Cancel**
```solidity
cancelCampaign(uint256 campaignId)
// Refunds all donors automatically
```

### CharityNFT.sol

**Mint Receipt**
```solidity
mintReceipt(address to, uint256 campaignId, uint256 amount, string tier)
// Called automatically by CharityFund during donation
```

**Get Donor NFTs**
```solidity
getDonorTokens(address donor) returns (uint256[])
```

**Token URI**
```solidity
tokenURI(uint256 tokenId) returns (string)
// Returns base64-encoded on-chain SVG metadata
```

---

## 🧪 Testing

### Run Tests
```bash
npx hardhat test
```

### Local Blockchain Testing
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Configure MetaMask:
# - Network: Localhost
# - RPC URL: http://127.0.0.1:8545
# - Chain ID: 31337
# - Import Hardhat test account private key
```

---

## 📦 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run compile` | `npx hardhat compile` | Compile smart contracts |
| `npm run deploy:testnet` | Deploy to Mantle Sepolia | Deploy contracts to testnet |
| `npm run deploy:mainnet` | Deploy to Mantle Mainnet | Deploy contracts to mainnet |
| `npm run test` | `npx hardhat test` | Run contract tests |
| `npm run dev` | `npx http-server . -p 3000` | Start local dev server |
| `npm run clean` | `npx hardhat clean` | Clean build artifacts |

---

## 🐛 Troubleshooting

### "Contract not available" Error
- ✅ Verify you're connected to Mantle Network (Chain ID 5000 or 5003)
- ✅ Check contract addresses are updated in `js/config.js`
- ✅ Ensure contracts are deployed to the network you're connected to

### Wallet Not Connecting
- ✅ Install wallet extension (MetaMask, etc.)
- ✅ Unlock your wallet
- ✅ Refresh the page
- ✅ Check browser console for errors

### "Network not supported" Warning
- ✅ Click "Switch Network" button in wallet menu
- ✅ Platform will auto-add Mantle Network to your wallet
- ✅ Or manually add Mantle in wallet settings

### Transaction Failing
- ✅ Ensure sufficient MNT balance for gas fees
- ✅ Check campaign is still active (not ended/cancelled)
- ✅ Verify you meet requirements (e.g., haven't voted already)
- ✅ Try increasing gas limit if needed

### NFT Not Showing
- ✅ Wait for transaction confirmation
- ✅ Refresh dashboard page
- ✅ Check NFT contract address is correct
- ✅ View on MantleScan explorer to verify minting

---

## 🚢 Deployment Checklist

Before going live:

- [ ] Deploy CharityFund contract to desired network
- [ ] Deploy CharityNFT contract to same network
- [ ] Link contracts (setNFTContract & setFundContract)
- [ ] Update `js/config.js` with correct contract addresses
- [ ] Test wallet connection on target network
- [ ] Test campaign creation end-to-end
- [ ] Test donation flow and NFT minting
- [ ] Test withdrawal functionality
- [ ] Verify all pages load correctly
- [ ] Test on multiple browsers
- [ ] Test with different wallet types
- [ ] Test on mobile devices
- [ ] Deploy frontend to hosting (Vercel, Netlify, IPFS, etc.)
- [ ] Update social media preview images
- [ ] Test share functionality

---

## 🎯 Gas Optimization

Contracts are optimized for minimal gas usage on Mantle:

**Estimated Gas Costs (Mantle Network)**:
- Create Campaign: ~0.0001-0.0003 MNT
- Donate (with NFT): ~0.00008-0.00015 MNT
- Vote: ~0.00003-0.00006 MNT
- Withdraw: ~0.0001-0.0002 MNT
- Cancel Campaign: Varies by donor count

Optimization techniques:
- Efficient storage patterns
- Minimal external calls
- Batch operations where possible
- Optimized compiler settings (200 runs)

---

## 🔗 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Blockchain | Mantle Network | Mainnet/Testnet |
| Smart Contracts | Solidity | 0.8.20 |
| Web3 Library | ethers.js | 6.9.0 |
| Development | Hardhat | 2.19.4+ |
| Frontend | HTML5, CSS3, JavaScript | ES2020+ |
| UI Framework | Vanilla JS | - |
| Styling | Custom CSS (Glassmorphism) | - |
| NFT Standard | ERC-721 Enumerable | OpenZeppelin 5.0 |
| Security | ReentrancyGuard, Pausable, Ownable | OpenZeppelin 5.0 |

---

## 🛣️ Roadmap

Future enhancements:

- [ ] ERC20 token donations (USDC, USDT)
- [ ] Built-in IPFS image uploads via web3.storage
- [ ] The Graph subgraph for efficient querying
- [ ] Campaign milestones and updates
- [ ] Social media authentication integration
- [ ] Email notifications (off-chain service)
- [ ] Mobile-responsive PWA
- [ ] WalletConnect integration
- [ ] Multi-signature campaign verification
- [ ] DAO governance for featured campaigns
- [ ] Recurring donations
- [ ] Campaign analytics dashboard
- [ ] CSV export for tax purposes

---

## 🤝 Contributing

Contributions welcome! Areas to improve:

1. **Smart Contracts**: Additional features, optimizations, security audits
2. **Frontend**: New pages, improved UX, accessibility
3. **Documentation**: Tutorials, guides, translations
4. **Testing**: More comprehensive test coverage
5. **Integrations**: IPFS, TheGraph, additional chains

---

## 📜 License

MIT License — Open source and free to use. See LICENSE file for details.

---

## 📚 Resources

- **Mantle Network**: [mantle.xyz](https://mantle.xyz) | [Docs](https://docs.mantle.xyz)
- **Hardhat**: [hardhat.org](https://hardhat.org)
- **ethers.js v6**: [docs.ethers.org](https://docs.ethers.org/v6/)
- **OpenZeppelin**: [docs.openzeppelin.com](https://docs.openzeppelin.com/contracts)
- **Solidity**: [docs.soliditylang.org](https://docs.soliditylang.org)

---

## 💬 Support

Need help?

1. Check the **Troubleshooting** section above
2. Review **Mantle Network documentation**
3. Check browser developer console for errors
4. Verify wallet configuration
5. Test on Sepolia testnet first before mainnet

---

**Built with ❤️ for transparent, decentralized charity**

**Powered by Mantle Network 🔗**

*No love icons, just trustless code.*

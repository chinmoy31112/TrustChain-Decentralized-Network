# 💚 CharityFund — Decentralized Charity Platform

A fully decentralized charity fundraising platform built on Ethereum. All funds, campaigns, and donor records are stored immutably on-chain. Donors receive on-chain NFT receipts for every donation.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌍 Create Campaigns | Deploy charity campaigns as on-chain smart contract entries |
| 💎 Donate with ETH | Send ETH directly to campaigns, secured by smart contract |
| 🏅 NFT Receipts | Receive on-chain SVG NFTs (Bronze / Silver / Gold / Diamond) |
| 📊 Transparent Tracking | Every donation is publicly visible on Ethereum |
| 🗳️ Governance Voting | Community votes to support or oppose campaigns |
| 🏆 Donor Leaderboard | Global ranking by total ETH contributed |
| 🦊 MetaMask Login | No signup — just connect your wallet |

---

## 📁 Project Structure

```
Fund/
├── index.html              # Landing page with hero, stats, featured campaigns
├── campaigns.html          # Browse & filter all campaigns
├── create-campaign.html    # Create a new campaign
├── campaign-detail.html    # Individual campaign with donate/vote/withdraw
├── dashboard.html          # Donor dashboard, NFT gallery, leaderboard
│
├── css/
│   └── styles.css          # Global stylesheet (dark glassmorphism theme)
│
├── js/
│   ├── config.js           # Contract ABIs, addresses, demo data
│   ├── web3.js             # MetaMask connection, ethers.js, utilities
│   ├── campaigns.js        # Campaigns page logic (filter, search)
│   ├── create.js           # Create campaign form & submission
│   ├── detail.js           # Campaign detail page (donate, vote, withdraw)
│   └── dashboard.js        # Dashboard (stats, NFTs, leaderboard)
│
└── contracts/
    ├── CharityFund.sol     # Main contract: campaigns, donations, governance
    └── CharityNFT.sol      # ERC721 on-chain SVG NFT receipt contract
```

---

## 🚀 Quick Start (View Demo Without Wallet)

1. Open `Fund/` folder in VS Code
2. Install the **Live Server** extension (or any HTTP server)
3. Right-click `index.html` → **Open with Live Server**
4. The site loads with 6 demo campaigns (no wallet needed to browse)

> To interact (donate, create, vote) you need MetaMask and a deployed contract.

---

## 🔧 Smart Contract Deployment

### Prerequisites

```bash
npm install -g hardhat
npm init -y
npm install --save-dev hardhat @openzeppelin/contracts
```

### Initialize Hardhat

```bash
npx hardhat init
# Choose: "Create a JavaScript project"
```

### Copy Contracts

Copy `contracts/CharityFund.sol` and `contracts/CharityNFT.sol` into your Hardhat `contracts/` folder.

### Create Deploy Script

Create `scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy NFT contract
  const CharityNFT = await ethers.getContractFactory("CharityNFT");
  const nft = await CharityNFT.deploy();
  await nft.deployed();
  console.log("CharityNFT deployed to:", nft.address);

  // 2. Deploy main fund contract
  const CharityFund = await ethers.getContractFactory("CharityFund");
  const fund = await CharityFund.deploy(nft.address);
  await fund.deployed();
  console.log("CharityFund deployed to:", fund.address);

  // 3. Authorize the fund contract to mint NFTs
  await nft.setFundContract(fund.address);
  console.log("NFT minter set to CharityFund");
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
```

### Configure Network (hardhat.config.js)

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
  },
};
```

### Deploy to Sepolia Testnet

```bash
# Get test ETH from https://sepoliafaucet.com
npx hardhat run scripts/deploy.js --network sepolia
```

### Update Frontend Config

After deployment, edit `js/config.js`:

```javascript
window.CONTRACT_ADDRESSES = {
  11155111: {   // Sepolia chain ID
    CharityFund: "0xYOUR_CHARITY_FUND_ADDRESS",
    CharityNFT:  "0xYOUR_NFT_ADDRESS",
  },
};
```

---

## 🧪 Local Testing with Hardhat Node

```bash
# Start local blockchain
npx hardhat node

# Deploy to localhost (new terminal)
npx hardhat run scripts/deploy.js --network localhost

# Add localhost network to MetaMask:
# RPC URL: http://127.0.0.1:8545
# Chain ID: 31337
# Import a Hardhat test account using its private key
```

---

## 🔗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML5, CSS3, JavaScript (ES2020+) |
| Blockchain | Ethereum (Solidity 0.8.19) |
| Web3 Library | ethers.js v5.7 |
| Wallet | MetaMask |
| NFT Standard | ERC-721 (on-chain SVG metadata) |
| Deployment | Hardhat |

---

## 🔒 Security Features

- **Reentrancy protection**: Funds marked as withdrawn before transfer (checks-effects-interactions)
- **Access control**: Only campaign creators can withdraw
- **NFT authorization**: Only the CharityFund contract can mint receipts
- **Vote-once**: Each address can cast one vote per campaign
- **Goal enforcement**: Withdrawal requires goal met OR deadline passed

---

## 🛣️ Roadmap

- [ ] ERC20 token donations (USDC, DAI)
- [ ] IPFS image uploads via web3.storage
- [ ] The Graph indexer for gas-efficient leaderboard
- [ ] Multi-sig campaign verification
- [ ] DAO governance for featured campaigns
- [ ] Mobile app (React Native + WalletConnect)

---

## 📄 License

MIT License — Open source, auditable, and free to use.

---

*Built with ❤️ for a more transparent world.*

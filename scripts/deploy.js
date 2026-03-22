const hre = require("hardhat");

async function main() {
  console.log("\n========================================");
  console.log("  TrustChain Web3 Charity - Deployment");
  console.log("========================================\n");

  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log("Network:", network);
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MNT\n");

  // Deploy CharityNFT
  console.log("Deploying CharityNFT...");
  const CharityNFT = await hre.ethers.getContractFactory("CharityNFT");
  const charityNFT = await CharityNFT.deploy();
  await charityNFT.waitForDeployment();
  const nftAddress = await charityNFT.getAddress();
  console.log("CharityNFT deployed to:", nftAddress);

  // Deploy CharityFund
  console.log("\nDeploying CharityFund...");
  const CharityFund = await hre.ethers.getContractFactory("CharityFund");
  const charityFund = await CharityFund.deploy();
  await charityFund.waitForDeployment();
  const fundAddress = await charityFund.getAddress();
  console.log("CharityFund deployed to:", fundAddress);

  // Link contracts
  console.log("\nLinking contracts...");

  // Set NFT contract in CharityFund
  const setNFTTx = await charityFund.setNFTContract(nftAddress);
  await setNFTTx.wait();
  console.log("CharityFund.setNFTContract() done");

  // Set CharityFund in CharityNFT
  const setFundTx = await charityNFT.setFundContract(fundAddress);
  await setFundTx.wait();
  console.log("CharityNFT.setFundContract() done");

  // Summary
  console.log("\n========================================");
  console.log("  Deployment Complete!");
  console.log("========================================\n");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log("CharityNFT:  ", nftAddress);
  console.log("CharityFund: ", fundAddress);
  console.log("\nNetwork:", network);

  // Generate config snippet
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log("\n// Add to js/config.js CONTRACT_ADDRESSES:");
  console.log(`${chainId}: { CharityFund: '${fundAddress}', CharityNFT: '${nftAddress}' },`);

  // Verify instructions
  console.log("\n========================================");
  console.log("  Verification Commands");
  console.log("========================================\n");
  console.log(`npx hardhat verify --network ${network} ${nftAddress}`);
  console.log(`npx hardhat verify --network ${network} ${fundAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

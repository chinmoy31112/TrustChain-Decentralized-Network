require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const rawKey = (process.env.PRIVATE_KEY || "").trim();
const PRIVATE_KEY = rawKey.length > 0 ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : "0x0000000000000000000000000000000000000000000000000000000000000001";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun",
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    mantleSepolia: {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: [PRIVATE_KEY],
    },
    mantleMainnet: {
      url: "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts: [PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      mantleSepolia: process.env.MANTLESCAN_API_KEY || "",
      mantleMainnet: process.env.MANTLESCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz"
        }
      },
      {
        network: "mantleMainnet",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

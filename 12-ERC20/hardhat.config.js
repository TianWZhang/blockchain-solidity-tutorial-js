require("hardhat-deploy");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-toolbox");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.17",

  namedAccounts: {
    deployer: {
      default: 0,
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another

      /* 
      Error: ERROR processing skip func of /home/amey/hardhat/hardhat-fund-me/deploy/01-deploy-fund-me.js:
      TypeError: Cannot read properties of undefined (reading 'ethUsdPriceFeed') without adding "1: 0"
      */
    },
    player: {
      default: 1,
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },

  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
  },

  mocha: {
    timeout: 300000, //300 seconds max
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

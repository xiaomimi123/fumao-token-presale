// Hardhat 配置文件
// 使用说明: npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

// 从环境变量读取私钥（更安全）
// 创建 .env 文件: PRIVATE_KEY=你的私钥
// npm install dotenv
// require("dotenv").config();
// const PRIVATE_KEY = process.env.PRIVATE_KEY;

// 或者直接在这里配置（不推荐，仅用于测试）
const PRIVATE_KEY = "abfcd24e2148903d3213ecb152c12e55f48e7bdabd9fc3dc0dce874bc8131ccb"; // ⚠️ 记得替换！

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    // BSC 主网
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000 // 5 Gwei
    },

    // BSC 测试网（推荐先在这里测试）
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: [PRIVATE_KEY],
      gasPrice: 10000000000 // 10 Gwei
    },

    // 本地开发网络
    hardhat: {
      chainId: 1337
    },

    // Localhost（如果你运行本地节点）
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },

  // 路径配置
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Etherscan API（用于验证合约）
  etherscan: {
    apiKey: {
      bsc: "8X1RWQPQR8PCBMTFVWTEDF4CSS8H9VKC9J",
      bscTestnet: "8X1RWQPQR8PCBMTFVWTEDF4CSS8H9VKC9J"
    }
  },
  sourcify: {
    enabled: true
  }
};


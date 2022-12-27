import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const { METAMASK_PRIVATE_KEY, ALCHEMY_GOERLI_URL, ETHERSCAN_API_URL } =
  process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: ALCHEMY_GOERLI_URL,
      accounts: [METAMASK_PRIVATE_KEY!],
    },
  },
  paths: {
    artifacts: "./client/artifacts",
  },
  etherscan: {
    apiKey: ETHERSCAN_API_URL,
  },
};

export default config;

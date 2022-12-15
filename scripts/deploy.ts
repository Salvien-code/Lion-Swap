import { ethers, run } from "hardhat";
import { setTimeout } from "timers/promises";
import { TOKEN_CONTRACT_ADDRESS } from "../client/Constants";

async function main() {
  const exchangeFactory = await ethers.getContractFactory("Exchange");
  const exchangeContract = await exchangeFactory.deploy(TOKEN_CONTRACT_ADDRESS);
  await exchangeContract.deployed();

  console.log(`Exchange Contract Address: ${exchangeContract.address}`);

  console.log(`Waiting for a minute before verifying Exchange contract`);
  await setTimeout(60000);

  await run("verify:verify", {
    address: exchangeContract.address,
    constructorArguments: [TOKEN_CONTRACT_ADDRESS],
  });
  console.log(`Verified Exchange contract on Etherscan`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

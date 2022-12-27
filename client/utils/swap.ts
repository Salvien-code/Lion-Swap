import { BigNumber, Contract, Signer } from "ethers";
import {
  EXCHANGE_ABI,
  EXCHANGE_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
} from "../Constants";
import { Web3Provider } from "@ethersproject/providers";

export const getAmountOfTokenReceivedFromSwap = async (
  _swapAmountWei: BigNumber,
  provider: Web3Provider,
  ethSelected: boolean,
  ethBalance: number,
  reservedCD: number
) => {
  const exchangeContract = new Contract(
    EXCHANGE_ADDRESS,
    EXCHANGE_ABI,
    provider
  );

  let amountOfTokens;

  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethBalance,
      reservedCD
    );
  } else {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedCD,
      ethBalance
    );
  }

  return amountOfTokens;
};

export const swapTokens = async (
  signer: Signer,
  swapAmountWei: BigNumber,
  tokenToBeReceivedAfterSwap: BigNumber,
  ethSelected: boolean
) => {
  const exchangeContract = new Contract(EXCHANGE_ADDRESS, EXCHANGE_ABI, signer);

  const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

  let tx;

  if (ethSelected) {
    tx = await exchangeContract.ethToLionToken(tokenToBeReceivedAfterSwap, {
      value: swapAmountWei,
    });
  } else {
    tx = await tokenContract.approve(
      EXCHANGE_ADDRESS,
      swapAmountWei.toString()
    );

    await tx.wait();

    tx = await exchangeContract.lionTokenToEth(
      swapAmountWei,
      tokenToBeReceivedAfterSwap
    );
  }

  await tx.wait();
};

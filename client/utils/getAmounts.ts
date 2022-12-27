import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";
import {
  EXCHANGE_ABI,
  EXCHANGE_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
} from "../Constants";

export const getEtherBalance = async (
  provider: Web3Provider,
  address: string | null,
  contract = false
) => {
  try {
    if (contract) {
      const balance = await provider.getBalance(EXCHANGE_ADDRESS);
      return balance;
    } else {
      const balance = await provider.getBalance(address!);
      return balance;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getLionTokensBalance = async (
  provider: Web3Provider,
  address: string
) => {
  try {
    const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const balanceOfLionTokens = await tokenContract.balanceOf(address);

    return balanceOfLionTokens;
  } catch (err) {
    console.error(err);
  }
};

export const getLPTokensBalance = async (
  provider: Web3Provider,
  address: string
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_ADDRESS,
      EXCHANGE_ABI,
      provider
    );
    const balanceOfLPTokens = await exchangeContract.balanceOf(address);
    return balanceOfLPTokens;
  } catch (err) {
    console.error(err);
  }
};

export const getReserveOfLTokens = async (provider: Web3Provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_ADDRESS,
      EXCHANGE_ABI,
      provider
    );
    const reserve = await exchangeContract.getReserve();
    return reserve;
  } catch (err) {
    console.error(err);
  }
};

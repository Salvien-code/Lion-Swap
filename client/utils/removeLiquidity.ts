import { Contract, BigNumber, Signer } from "ethers";
import { EXCHANGE_ABI, EXCHANGE_ADDRESS } from "../Constants";
import { Web3Provider } from "@ethersproject/providers";

export const removeLiquidity = async (
  signer: Signer,
  removeLPTokensWei: BigNumber
) => {
  const exchangeContract = new Contract(EXCHANGE_ADDRESS, EXCHANGE_ABI, signer);

  const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
  await tx.wait();
};

export const getTokenAfterRemove = async (
  provider: Web3Provider,
  removeLPTokenWei: BigNumber,
  _ethBalance: BigNumber,
  lionTokenReserve: BigNumber
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_ADDRESS,
      EXCHANGE_ABI,
      provider
    );

    const _totalSupply = await exchangeContract.totalSupply();

    const _removeEther = _ethBalance.mul(removeLPTokenWei).div(_totalSupply);
    const _removeCD = lionTokenReserve.mul(removeLPTokenWei).div(_totalSupply);

    return {
      _removeEther,
      _removeCD,
    };
  } catch (err) {
    console.error(err);
  }
};

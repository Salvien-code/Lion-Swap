import { BigNumber, Contract, Signer, utils } from "ethers";
import {
  EXCHANGE_ABI,
  EXCHANGE_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
} from "../Constants";

export const addLiquidity = async (
  signer: Signer,
  addLTAmountWei: BigNumber,
  addEtherAmountWei: BigNumber
) => {
  try {
    const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    const exchangeContract = new Contract(
      EXCHANGE_ADDRESS,
      EXCHANGE_ABI,
      signer
    );

    let tx = await tokenContract.approve(
      EXCHANGE_ADDRESS,
      addLTAmountWei.toString()
    );
    await tx.wait();

    tx = await exchangeContract.addLiquidity(addLTAmountWei, {
      value: addEtherAmountWei,
    });
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};

export const calculateCD = async (
  _addEther = "0",
  etherBalanceContract: BigNumber,
  ltTokenReserve: BigNumber
) => {
  const _addEtherAmountWei = utils.parseEther(_addEther);

  const lionTokenAmount = _addEtherAmountWei
    .mul(ltTokenReserve)
    .div(etherBalanceContract);
  return lionTokenAmount;
};

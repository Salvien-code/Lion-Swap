import { BigNumber, Signer, providers, utils } from "ethers";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { addLiquidity, calculateLT } from "../utils/addLiquidity";
import {
  getLionTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfLTokens,
} from "../utils/getAmounts";
import { getTokenAfterRemove, removeLiquidity } from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokenReceivedFromSwap } from "../utils/swap";
import { Web3Provider } from "@ethersproject/providers";

export default function Home() {
  const zero = BigNumber.from(0);

  const [loading, setLoading] = useState(false);
  const [removeLT, setRemoveLT] = useState(zero);
  const [addEther, setAddEther] = useState<BigNumber | string>(zero);
  const [ltBalance, setLtBalance] = useState(zero);
  const [lpBalance, setLpBalance] = useState(zero);

  const [swapAmount, setSwapAmount] = useState("");
  const [ethBalance, setEthBalance] = useState<BigNumber | 0>(zero);
  const [reservedLT, setReservedLT] = useState(zero);
  const [addLtTokens, setAddLtTokens] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);

  const [ethSelected, setEthSelected] = useState(true);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  const [etherBalanceContract, setEtherBalanceContract] = useState<
    BigNumber | 0
  >(zero);
  const [tokenToBeReceivedAfterSwap, setTokenToBeReceivedAfterSwap] =
    useState(zero);

  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  const getAmounts = async () => {
    try {
      const provider = (await getProviderOrSigner(false)) as Web3Provider;
      const signer = (await getProviderOrSigner(true)) as Signer;
      const address = await signer.getAddress();

      const _ethBalance = await getEtherBalance(provider, address);
      const _ltBalance = await getLionTokensBalance(provider, address);

      const _lpBalance = await getLPTokensBalance(provider, address);
      const _reservedLT = await getReserveOfLTokens(provider);

      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEthBalance(_ethBalance);
      setLtBalance(_ltBalance);
      setLpBalance(_lpBalance);

      setReservedLT(_reservedLT);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  };

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);

      if (!swapAmountWei.eq(zero)) {
        const signer = (await getProviderOrSigner(true)) as Signer;
        setLoading(true);

        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );

        setLoading(false);

        await getAmounts();
        setSwapAmount("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const _getAmountOfTokenReceivedFromSwap = async (_swapAmount: number) => {
    try {
      const _swapAmountWei = utils.parseEther(_swapAmount.toString());

      if (!_swapAmountWei.eq(zero)) {
        const provider = (await getProviderOrSigner()) as Web3Provider;

        const _ethBalance: BigNumber | 0 = await getEtherBalance(
          provider,
          null,
          true
        );

        const amountOfTokens = await getAmountOfTokenReceivedFromSwap(
          _swapAmountWei,
          provider,
          ethSelected,
          _ethBalance,
          reservedLT
        );
        setTokenToBeReceivedAfterSwap(amountOfTokens);
      } else {
        setTokenToBeReceivedAfterSwap(zero);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const _addLiquidty = async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());

      if (!addLtTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = (await getProviderOrSigner(true)) as Signer;
        setLoading(true);
        await addLiquidity(signer, addLtTokens, addEtherWei);
        setLoading(false);

        setAddLtTokens(zero);
        await getAmounts();
      } else {
        setAddLtTokens(zero);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddLtTokens(zero);
    }
  };

  const _removeLiquidity = async () => {
    try {
      const signer = (await getProviderOrSigner(true)) as Signer;
      const removeLPTokensWei = utils.parseEther(removeLPTokens);

      setLoading(true);
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);

      await getAmounts();
      setRemoveLT(zero);
      setRemoveEther(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveLT(zero);
      setRemoveEther(zero);
    }
  };

  const _getTokenAfterRemove = async (_removeLPTokens: string) => {
    try {
      const provider = (await getProviderOrSigner()) as Web3Provider;
      const removeLPTokensWei = utils.parseEther(_removeLPTokens);

      const _ethBalance: BigNumber | 0 = await getEtherBalance(
        provider,
        null,
        true
      );
      const lionTokenReserve = await getReserveOfLTokens(provider);

      // @ts-ignore
      const { _removeEther, _removeLT } = await getTokenAfterRemove(
        provider,
        removeLPTokensWei,
        _ethBalance as BigNumber,
        lionTokenReserve
      );

      setRemoveEther(_removeEther);
      setRemoveLT(_removeLT);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // @ts-ignore
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 5) {
      window.alert("Please connect to Goerli Testnet");
      throw new Error("Please connect to Goerli Testnet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if (!walletConnected) {
      // @ts-ignore
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(ltBalance)} Lion Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Lion LP Tokens
          </div>

          <div>
            {utils.parseEther(reservedLT.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of Lion Tokens"
                  onChange={(e) =>
                    setAddLtTokens(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.input}
                />
                <button className={styles.button} onClick={_addLiquidty}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    const _addLTTokens = await calculateLT(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedLT
                    );
                    setAddLtTokens(_addLTTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {`You will need ${utils.formatEther(
                    addLtTokens
                  )} Lion Tokens`}
                </div>
                <button className={styles.button} onClick={_addLiquidty}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of Lion LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokenAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {`You will get ${utils.formatEther(
                  removeLT
                )} Lion Tokens and ${utils.formatEther(removeEther)} Ether`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              await _getAmountOfTokenReceivedFromSwap(
                e.target.value !== null ? 0 : e.target.value
              );
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              await _getAmountOfTokenReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="LionToken">Lion Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Lion Tokens`
              : `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Ether`}
          </div>
          <button className={styles.button} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Lion Swap</title>
        <meta name="description" content="Lion Swap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to the Lion Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Lion Token
          </div>

          <div>
            <button
              className={styles.button}
              onClick={() => setLiquidityTab(true)}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <Image
            width="70"
            height="70"
            src="/Lions.svg"
            alt="lion"
            className={styles.image}
          />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Simon Samuel
      </footer>
    </div>
  );
}

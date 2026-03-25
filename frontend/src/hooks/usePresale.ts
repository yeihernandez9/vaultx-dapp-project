import { useState, useEffect } from "react";
import { Contract, formatEther, parseEther, JsonRpcProvider, BrowserProvider } from "ethers";
import { useWeb3React } from "./useWeb3React";
import { PRESALE_ADDRESS, PRESALE_ABI } from "../constants";

// Read-only: reads contract data without needing MetaMask connected
const readOnlyProvider = new JsonRpcProvider("http://127.0.0.1:7545");

export function usePresale() {
  const { provider, account } = useWeb3React();

  const [currentRound, setCurrentRound] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<string>("0");
  const [totalRaised, setTotalRaised] = useState<string>("0");
  const [userAllocation, setUserAllocation] = useState<string>("0");
  const [userClaimed, setUserClaimed] = useState<string>("0");
  const [userVested, setUserVested] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    // ALWAYS read from direct RPC to avoid MetaMask interception bugs on local networks
    try {
      const presale = new Contract(PRESALE_ADDRESS, PRESALE_ABI, readOnlyProvider);
      const round = await presale.currentRound();
      setCurrentRound(Number(round));

      if (Number(round) === 1) {
        setTokenPrice(formatEther(await presale.preSeedPrice()));
      } else if (Number(round) === 2) {
        setTokenPrice(formatEther(await presale.seedPrice()));
      } else if (Number(round) === 3) {
        setTokenPrice(formatEther(await presale.publicPrice()));
      }

      setTotalRaised(formatEther(await presale.totalAllocatedTokens() || "0"));

      if (account) {
        const schedule = await presale.vestingSchedules(account);
        setUserAllocation(formatEther(schedule.totalAllocated));
        setUserClaimed(formatEther(schedule.totalClaimed));

        const vested = await presale.getVestedAmount(account);
        setUserVested(formatEther(vested));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, [provider, account]);

  const buyTokens = async (ethAmount: string) => {
    if (!window.ethereum) throw new Error("Wallet not MetaMask");
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    const presale = new Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    // Passing empty proof for now. A real app would compute this.
    await presale.buyTokens([], { value: parseEther(ethAmount) });
    // Ganache mines instantly, tx.wait() can sometimes hang in ethers v6 with local nodes.
    // Instead of waiting, we just delay 1.5 seconds and fetch the new state.
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchState();
  };

  const claimTokens = async () => {
    if (!window.ethereum) throw new Error("Wallet not MetaMask");
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    const presale = new Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    await presale.claimVested();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchState();
  };

  return {
    currentRound,
    tokenPrice,
    totalRaised,
    userAllocation,
    userClaimed,
    userVested,
    loading,
    buyTokens,
    claimTokens,
    refresh: fetchState,
  };
}

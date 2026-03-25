import { useState, useEffect } from "react";
import { Contract, formatEther, parseEther, JsonRpcProvider, BrowserProvider } from "ethers";
import { useWeb3React } from "./useWeb3React";
import { STAKING_ADDRESS, STAKING_ABI, TOKEN_ADDRESS, TOKEN_ABI } from "../constants";

const readOnlyProvider = new JsonRpcProvider("http://127.0.0.1:7545");

export interface Position {
  positionId: string;
  amount: string;
  lockDuration: string;
  startTimestamp: string;
  endTimestamp: string;
  multiplier: string;
  isOpen: boolean;
  pendingReward: string;
}

export function useStaking() {
  const { account } = useWeb3React();

  const [positions, setPositions] = useState<Position[]>([]);
  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [vltxBalance, setVltxBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, readOnlyProvider);
      const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, readOnlyProvider);

      const total = await staking.totalStaked();
      setTotalStaked(formatEther(total));

      if (account) {
        const balance = await token.balanceOf(account);
        setVltxBalance(formatEther(balance));

        const rawPositions = await staking.getUserPositions(account);
        const parsedPositions: Position[] = [];

        for (let i = 0; i < rawPositions.length; i++) {
          const p = rawPositions[i];
          let reward = 0n;
          if (p.isOpen) {
            reward = await staking.pendingRewards(account, p.positionId);
          }
          parsedPositions.push({
            positionId: p.positionId.toString(),
            amount: formatEther(p.amount),
            lockDuration: p.lockDuration.toString(),
            startTimestamp: p.startTimestamp.toString(),
            endTimestamp: p.endTimestamp.toString(),
            multiplier: p.multiplier.toString(),
            isOpen: p.isOpen,
            pendingReward: formatEther(reward)
          });
        }
        setPositions(parsedPositions);
      } else {
        setPositions([]);
        setVltxBalance("0");
      }
    } catch (error) {
      console.error("Failed to fetch staking state", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, [account]);

  const stake = async (amount: string, lockDurationDays: number) => {
    if (!window.ethereum) throw new Error("Wallet not connected");
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    
    const amountWei = parseEther(amount);
    const lockDurationSecs = lockDurationDays * 24 * 3600;

    const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);

    const allowance = await token.allowance(account, STAKING_ADDRESS);
    if (allowance < amountWei) {
      const txApprove = await token.approve(STAKING_ADDRESS, amountWei);
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait for Ganache to mine
    }

    const txStake = await staking.stake(amountWei, lockDurationSecs);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchState();
  };

  const unstake = async (positionId: string) => {
    if (!window.ethereum) throw new Error("Wallet not connected");
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();

    const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    const tx = await staking.unstake(positionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchState();
  };

  const claimRewards = async (positionId: string) => {
    if (!window.ethereum) throw new Error("Wallet not connected");
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();

    const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    const tx = await staking.claimRewards(positionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchState();
  };

  return { 
    positions, 
    totalStaked, 
    vltxBalance, 
    loading, 
    stake, 
    unstake, 
    claimRewards,
    refreshParams: fetchState
  };
}

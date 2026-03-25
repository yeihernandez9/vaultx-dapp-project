import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const StakingModule = buildModule("StakingModule", (m) => {
  // Using the VaultXToken deployed during the Presale setup
  const TOKEN_ADDRESS = "0x5F2756D38c20a2B84D6F6Cd03424f90188a9d93b";
  
  // Treasury can be the deployer or any other address, we use a placeholder here for the deployer.
  const TREASURY_ADDRESS = m.getAccount(0);
  
  // 1 VLTX per block per staked VLTX
  const baseRewardRate = parseEther("1");

  const staking = m.contract("VaultXStaking", [
    TOKEN_ADDRESS,
    TOKEN_ADDRESS, // using the same token for staking and rewards
    TREASURY_ADDRESS,
    baseRewardRate,
  ]);

  return { staking };
});

export default StakingModule;

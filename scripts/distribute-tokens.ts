import { network } from "hardhat";
import { parseEther } from "viem";

const TOKEN_ADDRESS = "0x5F2756D38c20a2B84D6F6Cd03424f90188a9d93b";
const STAKING_ADDRESS = "0x5212aC21cC4f74f976081CDA60ab49DbC8AB0974";

async function main() {
  const hw = await network.connect();
  // @ts-ignore
  const viemContext = hw.viem;
  const wallets = await viemContext.getWalletClients();

  const token = await viemContext.getContractAt("VaultXToken", TOKEN_ADDRESS);
  const staking = await viemContext.getContractAt("VaultXStaking", STAKING_ADDRESS);

  console.log("Distributing VLTX tokens to test accounts...");

  // Send 10,000 VLTX to the Staking contract as the reward pool
  await token.write.approve([STAKING_ADDRESS, parseEther("10000")], { account: wallets[0].account });
  await staking.write.fundRewardPool([parseEther("10000")], { account: wallets[0].account });
  console.log("✅ Funded Reward Pool with 10,000 VLTX");

  // Send 1,000 VLTX to the first 5 Ganache wallets so they can test staking
  for (let i = 0; i < 5; i++) {
    const receiver = wallets[i].account.address;
    await token.write.transfer([receiver, parseEther("1000")], { account: wallets[0].account });
    console.log(`✅ Sent 1,000 VLTX to Account ${i}: ${receiver}`);
  }

  console.log("🎉 Test setup complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

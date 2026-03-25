import { network } from "hardhat";

const PRESALE_ADDRESS = "0x04729D2Aca46502d415DD3744186Da89560c5f6e";

async function main() {
  const hw = await network.connect();
  // @ts-ignore
  const viemContext = hw.viem;
  const wallets = await viemContext.getWalletClients();

  const presale = await viemContext.getContractAt("PresaleVault", PRESALE_ADDRESS);

  // We are going to simulate that the token was "launched" 2 months ago (60 days)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const vestingStartTime = BigInt(currentTimestamp - (60 * 24 * 3600)); // Started 60 days ago
  const cliffDuration = BigInt(30 * 24 * 3600); // 30 days cliff
  const vestingDuration = BigInt(180 * 24 * 3600); // 6 months vesting (180 days)

  console.log("Activating the Vesting Schedule into the past to allow immediate claiming...");
  
  await presale.write.setVestingParams(
    [vestingStartTime, cliffDuration, vestingDuration],
    { account: wallets[0].account }
  );

  console.log("✅ Vesting is now ACTIVE!");
  console.log("Any user who bought tokens can now claim their proportional matured amount.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

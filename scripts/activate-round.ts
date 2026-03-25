import { network } from "hardhat";
import { parseEther } from "viem";

const PRESALE_ADDRESS = "0x04729D2Aca46502d415DD3744186Da89560c5f6e";

async function main() {
  const hw = await network.connect();
  // @ts-ignore
  const viem = hw.viem;

  const presale = await viem.getContractAt("PresaleVault", PRESALE_ADDRESS as `0x${string}`);

  // 1. Check current state
  const round = await presale.read.currentRound();
  console.log("Current Round:", round);

  const preSeedPrice = await presale.read.preSeedPrice();
  const seedPrice = await presale.read.seedPrice();
  const publicPrice = await presale.read.publicPrice();
  console.log("Pre-Seed Price:", preSeedPrice, "wei");
  console.log("Seed Price:    ", seedPrice, "wei");
  console.log("Public Price:  ", publicPrice, "wei");

  // 2. Activate the Public Round (round = 3)
  console.log("\nActivating Public Round (3)...");
  const tx = await presale.write.setRound([3]);
  console.log("✅ Round set to PUBLIC. TX:", tx);

  const newRound = await presale.read.currentRound();
  console.log("New Current Round:", newRound, "(3 = PUBLIC)");
}

main().catch(console.error);

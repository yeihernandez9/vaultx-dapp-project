import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const PresaleModule = buildModule("PresaleModule", (m) => {
  const token = m.contract("VaultXToken");

  const preSeedPrice = parseEther("0.05");
  const seedPrice = parseEther("0.1");
  const publicPrice = parseEther("0.2");

  const presale = m.contract("PresaleVault", [
    token,
    preSeedPrice,
    seedPrice,
    publicPrice,
  ]);

  // Transfer 10,000,000 tokens to the presale vault
  m.call(token, "transfer", [presale, parseEther("10000000")]);

  return { token, presale };
});

export default PresaleModule;

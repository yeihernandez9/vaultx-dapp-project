import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("VaultXStaking", async function () {
    let viemContext: any;
    let publicClient: any;
    let testClient: any;
    let owner: any;
    let user1: any;
    let treasury: any;
    
    // Base reward rate: 1 VLTX per block per staked VLTX
    const baseRewardRate = parseEther("1");

    before(async () => {
        const hwConnection = await network.connect();
        // @ts-ignore
        viemContext = hwConnection.viem;
        publicClient = await viemContext.getPublicClient();
        testClient = await viemContext.getTestClient();
        const wallets = await viemContext.getWalletClients();
        owner = wallets[0];
        user1 = wallets[1];
        treasury = wallets[2];
    });

    async function deploy() {
        const token = await viemContext.deployContract("VaultXToken");
        const staking = await viemContext.deployContract("VaultXStaking", [
            token.address,
            token.address,
            treasury.account.address,
            baseRewardRate,
        ]);

        await token.write.transfer([user1.account.address, parseEther("1000")]);
        await token.write.approve([staking.address, parseEther("1000000")], { account: owner.account });
        await staking.write.fundRewardPool([parseEther("1000000")], { account: owner.account });
        
        return { token, staking };
    }

    it("Should allow staking and assigning correct lock durations & multipliers", async function () {
        const { token, staking } = await deploy();
        
        const stakingAsUser1 = await viemContext.getContractAt("VaultXStaking", staking.address, { client: { wallet: user1 } });
        const tokenAsUser1 = await viemContext.getContractAt("VaultXToken", token.address, { client: { wallet: user1 } });
        
        const amount = parseEther("10");
        await tokenAsUser1.write.approve([staking.address, amount]);
        
        // 30 Days lock
        await stakingAsUser1.write.stake([amount, 30n * 24n * 3600n]);
        let positions = await staking.read.getUserPositions([user1.account.address]);
        assert.equal(positions[0].multiplier.toString(), "100");

        const amount2 = parseEther("20");
        await tokenAsUser1.write.approve([staking.address, amount2]);

        // 90 Days lock
        await stakingAsUser1.write.stake([amount2, 90n * 24n * 3600n]);
        positions = await staking.read.getUserPositions([user1.account.address]);
        assert.equal(positions[1].multiplier.toString(), "150");
        assert.equal(positions[1].amount.toString(), amount2.toString());
    });

    it("Should apply penalty on early unstake and route it to treasury", async function () {
        const { token, staking } = await deploy();
        const stakingAsUser1 = await viemContext.getContractAt("VaultXStaking", staking.address, { client: { wallet: user1 } });
        const tokenAsUser1 = await viemContext.getContractAt("VaultXToken", token.address, { client: { wallet: user1 } });
        
        const amount = parseEther("100");
        await tokenAsUser1.write.approve([staking.address, amount]);
        await stakingAsUser1.write.stake([amount, 30n * 24n * 3600n]);

        const beforeTreasury = await token.read.balanceOf([treasury.account.address]);
        const beforeUser = await token.read.balanceOf([user1.account.address]);
        
        // Unstake immediately (early)
        await stakingAsUser1.write.unstake([0n]);
        
        const afterTreasury = await token.read.balanceOf([treasury.account.address]);
        const afterUser = await token.read.balanceOf([user1.account.address]);

        // Penalty should be 10% of 100 = 10 tokens
        const treasuryDiff = afterTreasury - beforeTreasury;
        assert.equal(treasuryDiff.toString(), parseEther("10").toString());
        
        // User gets 90 tokens back, plus whatever reward from 1 block (~100 tokens at block multiplier)
        const userDiff = afterUser - beforeUser;
        assert.ok(userDiff >= parseEther("90")); 
    });

    it("Should allow penalty-free unstake after lock period", async function () {
        const { token, staking } = await deploy();
        const stakingAsUser1 = await viemContext.getContractAt("VaultXStaking", staking.address, { client: { wallet: user1 } });
        const tokenAsUser1 = await viemContext.getContractAt("VaultXToken", token.address, { client: { wallet: user1 } });
        
        const amount = parseEther("100");
        await tokenAsUser1.write.approve([staking.address, amount]);
        await stakingAsUser1.write.stake([amount, 30n * 24n * 3600n]);

        // Fast forward 31 days
        const latestBlock = await publicClient.getBlock();
        const targetTime = BigInt(latestBlock.timestamp) + (31n * 24n * 3600n);
        await testClient.setNextBlockTimestamp({ timestamp: Number(targetTime) });
        await testClient.mine({ blocks: 1 });

        const beforeTreasury = await token.read.balanceOf([treasury.account.address]);
        
        await stakingAsUser1.write.unstake([0n]);

        const afterTreasury = await token.read.balanceOf([treasury.account.address]);

        // No penalty
        assert.equal((afterTreasury - beforeTreasury).toString(), "0");
    });
});

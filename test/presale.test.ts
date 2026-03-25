import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("PresaleVault", async function () {
    let viemContext: any;
    let publicClient: any;
    let owner: any;
    let user1: any;
    let user2: any;
    let user3: any;
    
    let preSeedTree: any;
    let seedTree: any;

    const preSeedPrice = parseEther("0.05"); 
    const seedPrice = parseEther("0.1");     
    const publicPrice = parseEther("0.2");   

    before(async () => {
        const hwConnection = await network.connect();
        // @ts-ignore
        viemContext = hwConnection.viem;
        publicClient = await viemContext.getPublicClient();
        const wallets = await viemContext.getWalletClients();
        owner = wallets[0];
        user1 = wallets[1];
        user2 = wallets[2];
        user3 = wallets[3];
        
        preSeedTree = StandardMerkleTree.of([[user1.account.address]], ["address"]);
        seedTree = StandardMerkleTree.of([[user2.account.address]], ["address"]);
    });

    async function deploy() {
        const _token = await viemContext.deployContract("VaultXToken");
        const _presale = await viemContext.deployContract("PresaleVault", [
            _token.address,
            preSeedPrice,
            seedPrice,
            publicPrice
        ]);

        await _token.write.transfer([_presale.address, parseEther("1000000")]);
        await _presale.write.setMerkleRoots([preSeedTree.root, seedTree.root]);
        
        return { _token, _presale };
    }

    it("Should deploy and configure prices correctly", async function () {
        const { _token, _presale } = await deploy();
        assert.equal((await _presale.read.preSeedPrice()).toString(), preSeedPrice.toString());
        assert.equal((await _presale.read.seedPrice()).toString(), seedPrice.toString());
        assert.equal((await _presale.read.publicPrice()).toString(), publicPrice.toString());
    });

    it("Should enforce whitelist during Pre-Seed purchase", async function () {
        const { _presale } = await deploy();
        await _presale.write.setRound([1]); // PRE_SEED round

        const proofUser1 = preSeedTree.getProof([user1.account.address]);

        const presaleAsUser1 = await viemContext.getContractAt("PresaleVault", _presale.address, { client: { wallet: user1 } });
        await presaleAsUser1.write.buyTokens([proofUser1], { value: parseEther("1") });
        
        const schedule = await _presale.read.vestingSchedules([user1.account.address]);
        const allocated = schedule[0]; 
        assert.equal(allocated.toString(), parseEther("20").toString());

        const proofUser2 = [] as string[]; // Invalid proof for user 2
        const presaleAsUser2 = await viemContext.getContractAt("PresaleVault", _presale.address, { client: { wallet: user2 } });
        
        try {
            await presaleAsUser2.write.buyTokens([proofUser2], { value: parseEther("1") });
            assert.fail("Should have reverted");
        } catch (e: any) {
            assert.match(e.message, /Not in pre-seed whitelist/);
        }
    });

    it("Should enforce linear vesting and claims", async function () {
        const { _presale, _token } = await deploy();
        await _presale.write.setRound([3]); // PUBLIC
        
        const presaleAsUser3 = await viemContext.getContractAt("PresaleVault", _presale.address, { client: { wallet: user3 } });
        await presaleAsUser3.write.buyTokens([[]], { value: parseEther("2") });
        
        const latestBlock = await publicClient.getBlock();
        const startTime = BigInt(latestBlock.timestamp) + 10n;
        const cliffDuration = 30n * 24n * 3600n; // 1 month
        const vestingDuration = 6n * 30n * 24n * 3600n; // 6 months
        
        await _presale.write.setVestingParams([startTime, cliffDuration, vestingDuration]);

        try {
            await presaleAsUser3.write.claimVested();
            assert.fail("Should have reverted");
        } catch (e: any) {
            assert.match(e.message, /Nothing to claim at this moment/);
        }

        const targetTime = startTime + cliffDuration + (3n * 30n * 24n * 3600n) + 10n;
        const testClient = await viemContext.getTestClient();
        await testClient.setNextBlockTimestamp({ timestamp: Number(targetTime) });
        await testClient.mine({ blocks: 1 });

        const vestedAmt = await _presale.read.getVestedAmount([user3.account.address]);
        assert.equal(vestedAmt.toString(), parseEther("5").toString()); // 50% of 10 tokens

        await presaleAsUser3.write.claimVested();
        
        const userBal = await _token.read.balanceOf([user3.account.address]);
        assert.equal(userBal.toString(), parseEther("5").toString());
    });
});

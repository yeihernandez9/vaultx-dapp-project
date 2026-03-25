export const PRESALE_ADDRESS = "0x04729D2Aca46502d415DD3744186Da89560c5f6e";
export const TOKEN_ADDRESS = "0x5F2756D38c20a2B84D6F6Cd03424f90188a9d93b";
export const STAKING_ADDRESS = "0x5212aC21cC4f74f976081CDA60ab49DbC8AB0974";

export const PRESALE_ABI = [
  "function currentRound() view returns (uint8)",
  "function preSeedPrice() view returns (uint256)",
  "function seedPrice() view returns (uint256)",
  "function publicPrice() view returns (uint256)",
  "function totalAllocatedTokens() view returns (uint256)",
  "function vestingSchedules(address) view returns (uint256 totalAllocated, uint256 totalClaimed)",
  "function getVestedAmount(address) view returns (uint256)",
  "function buyTokens(bytes32[] calldata) payable",
  "function claimVested()",
  "function vestingStartTime() view returns (uint256)"
];

export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

export const STAKING_ABI = [
  "function stake(uint256 amount, uint256 lockPeriod)",
  "function unstake(uint256 positionId)",
  "function claimRewards(uint256 positionId)",
  "function pendingRewards(address user, uint256 positionId) view returns (uint256)",
  "function getUserPositions(address user) view returns (tuple(uint256 positionId, address owner, uint256 amount, uint256 lockDuration, uint256 startTimestamp, uint256 endTimestamp, uint256 lastRewardBlock, uint256 multiplier, bool isOpen)[])",
  "function totalStaked() view returns (uint256)"
];

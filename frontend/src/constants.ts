export const PRESALE_ADDRESS = import.meta.env.VITE_PRESALE_ADDRESS || "";
export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || "";
export const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";

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

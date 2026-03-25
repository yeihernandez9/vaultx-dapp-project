// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VaultXStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    address public treasury;

    // Reward per block per token staked (1e18 precision).
    // E.g., if set to 1e10, 1 token staked earns 1e10 wei per block for 1x multiplier
    uint256 public baseRewardPerBlockPerToken;

    // Lock Periods in seconds
    uint256 public constant LOCK_30_DAYS = 30 days;
    uint256 public constant LOCK_90_DAYS = 90 days;
    uint256 public constant LOCK_180_DAYS = 180 days;
    
    // Penalties (10% = 1000 basis points out of 10000)
    uint256 public constant EARLY_EXIT_PENALTY_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Position {
        uint256 positionId;
        address owner;
        uint256 amount;
        uint256 lockDuration; // e.g., 30 days
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 lastRewardBlock;
        uint256 multiplier; // scaled by 100 (100 = 1x, 150 = 1.5x)
        bool isOpen;
    }

    mapping(address => Position[]) public userPositions;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 positionId, uint256 amount, uint256 lockDuration);
    event Unstaked(address indexed user, uint256 positionId, uint256 amount, uint256 penaltyAmount);
    event RewardsClaimed(address indexed user, uint256 positionId, uint256 rewardAmount);
    event TreasuryUpdated(address newTreasury);
    event BaseRewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken, address _rewardToken, address _treasury, uint256 _baseRewardPerBlockPerToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_treasury != address(0), "Invalid treasury");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        treasury = _treasury;
        baseRewardPerBlockPerToken = _baseRewardPerBlockPerToken;
    }

    /**
     * @notice Create a new staking position
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            lockPeriod == LOCK_30_DAYS || lockPeriod == LOCK_90_DAYS || lockPeriod == LOCK_180_DAYS,
            "Invalid lock period"
        );

        uint256 multiplier = 100; // 1x
        if (lockPeriod == LOCK_90_DAYS) {
            multiplier = 150; // 1.5x
        } else if (lockPeriod == LOCK_180_DAYS) {
            multiplier = 200; // 2x
        }

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 positionId = userPositions[msg.sender].length;
        userPositions[msg.sender].push(Position({
            positionId: positionId,
            owner: msg.sender,
            amount: amount,
            lockDuration: lockPeriod,
            startTimestamp: block.timestamp,
            endTimestamp: block.timestamp + lockPeriod,
            lastRewardBlock: block.number,
            multiplier: multiplier,
            isOpen: true
        }));

        totalStaked += amount;

        emit Staked(msg.sender, positionId, amount, lockPeriod);
    }

    /**
     * @notice Calculate pending rewards for a position
     */
    function pendingRewards(address user, uint256 positionId) public view returns (uint256) {
        require(positionId < userPositions[user].length, "Invalid position");
        Position memory pos = userPositions[user][positionId];
        
        if (!pos.isOpen || block.number <= pos.lastRewardBlock) {
            return 0;
        }

        uint256 blocksPassed = block.number - pos.lastRewardBlock;
        // Formula: (amount * baseRate * blocks * multiplier) / (1e18 * 100)
        // If baseRewardPerBlockPerToken is scaled by 1e18, we divide by 1e18
        uint256 reward = (pos.amount * baseRewardPerBlockPerToken * blocksPassed * pos.multiplier) / (1e18 * 100);
        return reward;
    }

    /**
     * @notice Claim rewards without unstaking
     */
    function claimRewards(uint256 positionId) public nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        Position storage pos = userPositions[msg.sender][positionId];
        require(pos.isOpen, "Position is closed");

        uint256 reward = pendingRewards(msg.sender, positionId);
        require(reward > 0, "No rewards to claim");

        pos.lastRewardBlock = block.number;
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, positionId, reward);
    }

    /**
     * @notice Unstake tokens and automatically claim rewards. Applies 10% penalty if unstaking early.
     */
    function unstake(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        Position storage pos = userPositions[msg.sender][positionId];
        require(pos.isOpen, "Position is already closed");

        // Claim remaining rewards first
        uint256 reward = pendingRewards(msg.sender, positionId);
        if (reward > 0) {
            pos.lastRewardBlock = block.number;
            require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, positionId, reward);
        }

        pos.isOpen = false;
        totalStaked -= pos.amount;

        uint256 amountToUser = pos.amount;
        uint256 penaltyAmount = 0;

        // Apply 10% penalty if withdrawn before the end timestamp
        if (block.timestamp < pos.endTimestamp) {
            penaltyAmount = (pos.amount * EARLY_EXIT_PENALTY_BPS) / BPS_DENOMINATOR;
            amountToUser = pos.amount - penaltyAmount;

            require(stakingToken.transfer(treasury, penaltyAmount), "Penalty transfer failed");
        }

        require(stakingToken.transfer(msg.sender, amountToUser), "Unstake transfer failed");

        emit Unstaked(msg.sender, positionId, amountToUser, penaltyAmount);
    }

    // Owner Functions

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function setBaseRewardRate(uint256 newRate) external onlyOwner {
        baseRewardPerBlockPerToken = newRate;
        emit BaseRewardRateUpdated(newRate);
    }
    
    /**
     * @notice Owner can deposit reward tokens into the contract pool
     */
    function fundRewardPool(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    /**
     * @notice Helper to get all positions for a user
     */
    function getUserPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
}

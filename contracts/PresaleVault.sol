// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PresaleVault is Ownable, ReentrancyGuard {
    enum Round { NONE, PRE_SEED, SEED, PUBLIC }
    
    IERC20 public immutable token;
    
    // Configurable token prices in wei per full token (1e18 decimals)
    uint256 public preSeedPrice;
    uint256 public seedPrice;
    uint256 public publicPrice;
    
    // Merkle roots for private rounds whitelist
    bytes32 public preSeedMerkleRoot;
    bytes32 public seedMerkleRoot;
    
    Round public currentRound;
    
    // Vesting configuration
    uint256 public constant MONTH_IN_SECONDS = 30 days;
    uint256 public vestingStartTime;
    uint256 public cliffDuration;
    uint256 public vestingDuration;
    
    uint256 public totalAllocatedTokens;
    
    struct VestingSchedule {
        uint256 totalAllocated;
        uint256 totalClaimed;
    }
    
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amountPaid, uint256 tokensAllocated, Round round);
    event VestingClaimed(address indexed beneficiary, uint256 amount);
    event RoundOpened(Round round);
    event RoundClosed(Round round);
    
    constructor(
        address _tokenAddress,
        uint256 _preSeedPrice,
        uint256 _seedPrice,
        uint256 _publicPrice
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_preSeedPrice > 0 && _seedPrice > 0 && _publicPrice > 0, "Prices must be > 0");
        
        token = IERC20(_tokenAddress);
        preSeedPrice = _preSeedPrice;
        seedPrice = _seedPrice;
        publicPrice = _publicPrice;
        currentRound = Round.NONE;
    }
    
    /**
     * @notice Set Merkle Roots for the whitelists
     */
    function setMerkleRoots(bytes32 _preSeedMerkleRoot, bytes32 _seedMerkleRoot) external onlyOwner {
        preSeedMerkleRoot = _preSeedMerkleRoot;
        seedMerkleRoot = _seedMerkleRoot;
    }
    
    /**
     * @notice Change the active round
     */
    function setRound(Round newRound) external onlyOwner {
        if (currentRound != Round.NONE) {
            emit RoundClosed(currentRound);
        }
        currentRound = newRound;
        if (newRound != Round.NONE) {
            emit RoundOpened(newRound);
        }
    }
    
    /**
     * @notice Configure the global vesting schedule
     */
    function setVestingParams(uint256 _vestingStartTime, uint256 _cliffDuration, uint256 _vestingDuration) external onlyOwner {
        require(_vestingDuration > 0, "Vesting duration must be > 0");
        vestingStartTime = _vestingStartTime;
        cliffDuration = _cliffDuration;
        vestingDuration = _vestingDuration; // e.g., 6 * MONTH_IN_SECONDS
    }
    
    /**
     * @notice Purchase tokens with native currency
     */
    function buyTokens(bytes32[] calldata merkleProof) external payable nonReentrant {
        Round activeRound = currentRound;
        require(activeRound != Round.NONE, "Presale is not active");
        require(msg.value > 0, "Must send ETH/BNB");
        
        uint256 allocatedTokens;
        
        if (activeRound == Round.PRE_SEED) {
            require(preSeedMerkleRoot != bytes32(0), "Pre-seed whitelist disabled");
            require(_isWhitelisted(msg.sender, merkleProof, preSeedMerkleRoot), "Not in pre-seed whitelist");
            allocatedTokens = (msg.value * 1e18) / preSeedPrice;
        } else if (activeRound == Round.SEED) {
            require(seedMerkleRoot != bytes32(0), "Seed whitelist disabled");
            require(_isWhitelisted(msg.sender, merkleProof, seedMerkleRoot), "Not in seed whitelist");
            allocatedTokens = (msg.value * 1e18) / seedPrice;
        } else if (activeRound == Round.PUBLIC) {
            allocatedTokens = (msg.value * 1e18) / publicPrice;
        } else {
            revert("Unknown round");
        }
        
        require(allocatedTokens > 0, "Insufficient payment");
        
        uint256 totalAllocatedCache = totalAllocatedTokens + allocatedTokens;
        require(token.balanceOf(address(this)) >= totalAllocatedCache, "Insufficient contract vault balance");
        
        totalAllocatedTokens = totalAllocatedCache;
        vestingSchedules[msg.sender].totalAllocated += allocatedTokens;
        
        emit TokensPurchased(msg.sender, msg.value, allocatedTokens, activeRound);
    }
    
    /**
     * @notice Claim the currently vested amount of tokens
     */
    function claimVested() external nonReentrant {
        require(vestingStartTime > 0, "Vesting not configured");
        
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAllocated > 0, "No tokens allocated");
        
        uint256 vested = getVestedAmount(msg.sender);
        uint256 claimable = vested - schedule.totalClaimed;
        
        require(claimable > 0, "Nothing to claim at this moment");
        
        schedule.totalClaimed += claimable;
        
        require(token.transfer(msg.sender, claimable), "Token transfer failed");
        
        emit VestingClaimed(msg.sender, claimable);
    }
    
    /**
     * @notice Returns the total amount of tokens fully vested so far
     */
    function getVestedAmount(address account) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[account];
        if (schedule.totalAllocated == 0) return 0;
        if (vestingStartTime == 0 || block.timestamp < vestingStartTime + cliffDuration) {
            return 0; // Inside cliff period or not started
        }
        
        if (block.timestamp >= vestingStartTime + cliffDuration + vestingDuration) {
            return schedule.totalAllocated; // Fully vested
        }
        
        // Linear vesting with monthly release steps
        uint256 timePassedSinceCliff = block.timestamp - (vestingStartTime + cliffDuration);
        
        // For monthly releases, calculate completed months
        uint256 completedMonths = timePassedSinceCliff / MONTH_IN_SECONDS;
        uint256 totalVestingMonths = vestingDuration / MONTH_IN_SECONDS;
        
        // Prevent div by zero if vestingDuration is not aligned to months, fallback to linear
        if (totalVestingMonths == 0) {
            return (schedule.totalAllocated * timePassedSinceCliff) / vestingDuration;
        }
        
        return (schedule.totalAllocated * completedMonths) / totalVestingMonths;
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdraw failed");
    }
    
    function withdrawUnsoldTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        uint256 unsold = balance - totalAllocatedTokens;
        require(unsold > 0, "No unsold tokens");
        require(token.transfer(msg.sender, unsold), "Token transfer failed");
    }
    
    function _isWhitelisted(address account, bytes32[] calldata merkleProof, bytes32 root) internal pure returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account))));
        return MerkleProof.verify(merkleProof, root, leaf);
    }
}

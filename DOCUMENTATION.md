# VaultX Technical Documentation 🚀

This document serves as a comprehensive guide to the **VaultX DApp** architecture, logic, and installation, designed specifically for technical test assessment.

---

## 1. Technical Stack 🛠️

*   **Smart Contracts**: Solidity ^0.8.20 (SafeMath native, Ownable, ReentrancyGuard).
*   **Blockchain Dev**: Hardhat + Viem (modern replacement for Ethers in testing).
*   **Frontend**: React 18 + Vite + TypeScript.
*   **UI/UX Engine**: Material UI (MUI) for professional components.
*   **Styling Architecture**: **SCSS Modules** following **BEM (Block Element Modifier)** methodology and custom `pixelToRem` utility functions.
*   **Web3 Integration**: Ethers.js v6 + Web3-React.

---

## 2. Smart Contract Architecture 🧠

### A. VaultXToken (VLTX)
A standard ERC20 token that powers the ecosystem.
*   **Total Supply**: 1,000,000,000 VLTX.
*   **Minting**: All tokens are minted to the deployer at inception to facilitate the presale and rewards allocation.

### B. PresaleVault.sol
Manages the fundraising phase with advanced vesting logic.
*   **Round Logic**: Supports 3 distinct rounds (`Pre-Seed`, `Seed`, `Public`) with dynamic prices.
*   **Whitelisting**: Implements **Merkle Tree Proofs** for efficient, gas-less off-chain whitelist verification (Round 1 & 2 only).
*   **Vesting (Linear Drop)**:
    *   **Cliff Period**: An initial period where no tokens can be claimed.
    *   **Linear Release**: Tokens are released proportionally based on time passed after the cliff until the full duration (e.g., 6 months).
*   **Security**: Prevents double-claiming and handles native currency (ETH/BNB) safely using `ReentrancyGuard`.

### C. VaultXStaking.sol
The core engine for user retention and rewards.
*   **Per-Block Accrual**: Rewards are calculated using `block.number`, ensuring accuracy even if block times vary slightly.
*   **Tier Multipliers**: 
    *   30 Days: **1.0x**
    *   90 Days: **1.5x**
    *   180 Days: **2.0x**
*   **Early Exit Penalty**: A **10% fee** is applied if a user unstakes before the lock ends. These funds go to the project **Treasury**.
*   **Position Based**: Each stake is a unique "Position" struct, allowing users to have multiple independent stakes with different tiers.

---

## 3. Frontend Architecture (React) ⚛️

### Methodology: BEM + SCSS Modules
Components are styled using nested SCSS to ensure clean JSX and isolated CSS scopes.
*   **Block**: `.presale`
*   **Element**: `.presale-header`
*   **Modifier**: `.presale-button--active`

### Hooks & State Management:
*   **`useWeb3React`**: Handles wallet connectivity, account changes, and network switching (Ganache specialized).
*   **`usePresale`**: Connects to a `JsonRpcProvider` for lighting-fast reads (to avoid MetaMask lag) and a `BrowserProvider` for transactions.
*   **`useStaking`**: Syncs staking positions, calculates pending rewards in real-time on the frontend, and manages approval/stake flows.

### Config Engine (`.env`)
All critical constants are centralized in the root `.env` file for easy switching between local development and production.

---

## 4. Execution & Scripts 📜

### Deployment
Uses **Hardhat Ignition** for declarative deployment:
```bash
npx hardhat ignition deploy ./ignition/modules/Presale.ts --network ganache
npx hardhat ignition deploy ./ignition/modules/Staking.ts --network ganache
```

### Helper Scripts
*   **`distribute-tokens.ts`**: Feeds the Staking contract with reward tokens and provides VLTX to testing accounts.
*   **`activate-round.ts`**: Admin control to switch between Pre-Seed, Seed, and Public rounds.
*   **`simulate-presale-launch.ts`**: Simulates the passage of 60 days on the blockchain to test the **Vesting Claim** functionality immediately.

---

## 5. Security & Gas Optimization ⚡

1.  **Gas < 150k**: Refined `buyTokens()` logic ensures gas consumption stays well below 150,000 units by using `immutable` variables and minimizing storage writes.
2.  **Arithmetic Safety**: Uses Solidity 0.8+ native overflow protection.
3.  **Reentrancy Guard**: Every function transferring funds or tokens is protected against re-entry attacks.
4.  **Mathematical Precision**: All calculations use `1e18` (wad) precision to prevent rounding errors in tokenomics.

---

## 6. Process Logic Flows 📊

### A. Investor Lifecycle (Presale)
```mermaid
graph TD
    A[Presale Starts] --> B{Is Round 1 or 2?}
    B -- Yes --> C[Validate Whitelist Merkle Proof]
    B -- No --> D[Public Open Entry]
    C --> E[Buy VLTX with ETH/BNB]
    D --> E
    E --> F[Tokens locked in Vesting]
    F --> G{Cliff passed?}
    G -- No --> H[Claimable Balance: 0]
    G -- Yes --> I[Linear release second by second]
    I --> J[User claims matured tokens]
```

### B. Staking Lifecycle (Rewards)
```mermaid
graph TD
    A[Owns VLTX] --> B[Choose Tier: 30, 90 or 180 days]
    B --> C[Lock tokens in Contract]
    C --> D[Collect rewards Per Block]
    D --> E{Withdraw now?}
    E -- Only Rewards --> F[Claim Button: Rewards sent / Principal stays locked]
    E -- All Funds --> G{Lock duration passed?}
    G -- Yes --> H[Unstake Button: Receives Principal + Rewards]
    G -- No --> I[Unstake Button: 10% Treasury Penalty / Receives Net]
```

---

## 7. Technical Glossary 📖

*   **Vesting**: Period during which tokens are locked and released gradually to ensure project economic stability.
*   **Cliff**: Initial delay before the Vesting begins releasing tokens. During this time, the claimable balance is 0.
*   **Merkle Tree/Proof**: A cryptographic data structure allowing to validate if an address is in a whitelist without storing the entire list on-chain.
*   **Staking**: Locking cryptocurrencies in a smart contract to receive interest/rewards.
*   **Reentrancy**: A common attack where a hacker tries to call a contract function multiple times before the first one finishes. We use `ReentrancyGuard` to prevent this.
*   **Multiplier**: A factor (e.g., 1.5x, 2.0x) that increases rewards proportionally to the length of the lock-in period.
*   **WAD / precision**: Mathematical scaling (usually 18 decimals) to prevent rounding errors.

---
**VaultX Technical Assessment Guide**

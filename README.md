# VaultX Presale & Staking DApp 🚀

Welcome to the **VaultX** project repository. This is a full-stack Web3 application designed for a token presale and a staking rewards ecosystem.

## 📖 Technical Documentation / Documentación Técnica
If you are reviewing this as part of a **Technical Test**, please refer to the detailed documentation files:
- **[English Version (DOCUMENTATION.md)](./DOCUMENTATION.md)**
- **[Versión en Español (DOCUMENTACION_ES.md)](./DOCUMENTACION_ES.md)**

It contains:
- Smart Contract logic and security.
- Frontend architecture (BEM + SCSS Modules).
- Deployment instructions and script usage.
- Gas optimization and math formulas.

## 🚀 Quick Start (Local Ganache)

1. **Install Dependencies**:
```bash
npm install
cd frontend && npm install && cd ..
```

2. **Setup Environment**:
Configure your [`.env`](./.env) file (already pre-configured for default Ganache).

3. **Deploy Contracts**:
```bash
npx hardhat ignition deploy ./ignition/modules/Presale.ts --network ganache
npx hardhat ignition deploy ./ignition/modules/Staking.ts --network ganache
```

4. **Prepare Testing Environment**:
```bash
npx hardhat run scripts/distribute-tokens.ts --network ganache
npx hardhat run scripts/activate-round.ts --network ganache
```

5. **Run Frontend**:
```bash
cd frontend
npm run dev
```

---

## 🌐 Deploying to Public Networks (Sepolia, BSC, etc.)

To deploy these contracts to a public testnet or mainnet, follow these steps:

1. **Update Root `.env`**:
   Add your network-specific variables:
   ```env
   # Example for Sepolia
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   SEPOLIA_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
   ```

2. **Run Deployment Command**:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/Presale.ts --network sepolia
   npx hardhat ignition deploy ./ignition/modules/Staking.ts --network sepolia
   ```

3. **Update Frontend Configuration**:
   After deployment, Hardhat will output the new contract addresses. Update the `VITE_` variables in your [`.env`](./.env) to point to the new addresses so the React app can connect to the correct network.

4. **Verify Contracts (Optional)**:
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGUMENTS>
   ```

## 🛠️ Tech Stack
- **Solidity** (^0.8.20)
- **Hardhat** + **Viem**
- **React** + **Vite** + **TypeScript**
- **SCSS Modules** (BEM Methodology)
- **Ethers.js v6**

---
Built by VaultX Team.

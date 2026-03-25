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

## 🛠️ Tech Stack
- **Solidity** (^0.8.20)
- **Hardhat** + **Viem**
- **React** + **Vite** + **TypeScript**
- **SCSS Modules** (BEM Methodology)
- **Ethers.js v6**

---
Built by VaultX Team.

# 福猫代币空投系统 (Fumao Token Airdrop System)

## 📋 项目概述

福猫代币空投系统是一个基于 BNB Smart Chain 的去中心化空投平台，采用创新的"授权路由"模式，确保用户资产安全的同时实现代币分发。

### 🎯 核心特性

- **安全授权模式**: 用户只需授权 USDT 给 Router 合约，无需直接转账
- **ERC20 代币**: 福猫代币 (FM) 符合 ERC20 标准，总量 10 亿枚
- **空投机制**: 用户授权 USDT 后即可领取空投代币
- **管理员控制**: 完整的后台管理系统，支持批量操作
- **开源透明**: 智能合约已通过 BscScan 验证

## 🏗️ 系统架构

### 智能合约

1. **ApprovalRouter** (`0x3B55fEeDF85433bF86C31c442d2318fc8580EA36`)
   - 管理 USDT 授权和转账
   - 隔离无限授权风险
   - 只有 Vault 合约可调用转账功能

2. **UnifiedVaultToken** (`0x226313931bc58C17c7dd16441a132251091BA271`)
   - ERC20Capped 代币合约
   - 空投分发逻辑
   - 管理员功能（批量空投、资产提取等）

### 前端应用

- **技术栈**: React + TypeScript + Vite + Tailwind CSS
- **Web3 集成**: Ethers.js + MetaMask
- **功能模块**: 钱包连接、空投领取、管理员后台

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn
- MetaMask 钱包

### 安装依赖

```bash
# 安装智能合约依赖
npm install

# 安装前端依赖
cd 福猫代币预售网站/blockstranding-presale
npm install
```

### 启动开发环境

```bash
# 启动前端开发服务器
cd 福猫代币预售网站/blockstranding-presale
npm run dev
```

访问 http://localhost:5173 查看应用

## 📁 项目结构

```
福猫代币合约/
├── contracts/                    # 智能合约源码
│   ├── ApprovalRouter.sol       # 授权路由合约
│   └── UnifiedVaultToken.sol    # 代币合约
├── scripts/                     # 部署脚本
│   └── deploy-vault-airdrop.js  # 主部署脚本
├── artifacts/                   # 编译产物
├── cache/                       # 缓存文件
├── flat/                        # 扁平化源码（用于验证）
├── 福猫代币预售网站/blockstranding-presale/  # 前端应用
│   ├── src/
│   │   ├── components/          # React 组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── contracts/          # 合约配置和 ABI
│   │   ├── pages/              # 页面组件
│   │   └── data/               # 静态数据
│   └── public/                 # 静态资源
├── hardhat.config.js           # Hardhat 配置
├── package.json                # 项目依赖
└── README.md                   # 项目文档
```

## 🔧 开发指南

### 智能合约开发

1. **修改合约**
   ```bash
   # 编辑 contracts/ 目录下的 .sol 文件
   ```

2. **编译合约**
   ```bash
   npx hardhat compile
   ```

3. **部署合约**
   ```bash
   # 部署到测试网
   npx hardhat run scripts/deploy-vault-airdrop.js --network bscTestnet
   
   # 部署到主网
   npx hardhat run scripts/deploy-vault-airdrop.js --network bsc
   ```

4. **验证合约**
   ```bash
   npx hardhat verify --network bsc <合约地址> <构造参数>
   ```

### 前端开发

1. **修改配置**
   - 更新 `src/contracts/config.ts` 中的合约地址
   - 修改 `src/data/content.ts` 中的静态内容

2. **添加功能**
   - 在 `src/hooks/` 中添加新的 Web3 Hooks
   - 在 `src/components/` 中添加新的 UI 组件

3. **构建部署**
   ```bash
   npm run build
   ```

## 🌐 部署指南

### 智能合约部署

合约已部署到 BNB Smart Chain 主网：

- **ApprovalRouter**: `0x3B55fEeDF85433bF86C31c442d2318fc8580EA36`
- **UnifiedVaultToken**: `0x226313931bc58C17c7dd16441a132251091BA271`
- **USDT 地址**: `0x55d398326f99059fF775485246999027B3197955`

### 前端部署

支持多种部署方式：

1. **Vercel 部署**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify 部署**
   ```bash
   npm run build
   # 上传 dist 目录到 Netlify
   ```

3. **VPS 部署**
   ```bash
   npm run build
   # 将 dist 目录上传到服务器
   # 配置 Nginx 或 Apache
   ```

## 🔐 安全说明

### 授权模式优势

1. **风险隔离**: 用户授权给 Router，Router 再授权给 Vault
2. **权限控制**: 只有 Vault 合约可以调用 Router 的转账功能
3. **无限授权**: 用户只需授权一次，无需重复操作

### 管理员功能

- **资产提取**: 管理员可以提取用户授权的 USDT
- **批量空投**: 支持批量分发代币
- **参数调整**: 可调整空投数量和最小授权金额

## 📊 合约功能

### 用户功能

- `claimApprovalAirdrop()`: 领取空投
- `depositUSDT(uint256)`: 存入 USDT
- `canClaimAirdrop(address)`: 检查是否可领取

### 管理员功能

- `batchAirdrop(address[])`: 批量空投
- `sweepUserUSDT(address,address,uint256)`: 提取用户 USDT
- `setAirdropAmount(uint256)`: 设置空投数量
- `setMinApprovalAmount(uint256)`: 设置最小授权金额

## 🛠️ 故障排除

### 常见问题

1. **前端无法连接钱包**
   - 检查 MetaMask 是否安装
   - 确认网络切换到 BNB Smart Chain

2. **合约调用失败**
   - 检查 Gas 费用是否足够
   - 确认合约地址是否正确

3. **空投领取失败**
   - 确认已授权足够的 USDT
   - 检查是否已领取过空投

## 📞 技术支持

如有问题，请检查：

1. 合约是否已正确部署和验证
2. 前端配置是否正确
3. 网络连接是否正常
4. 钱包余额是否充足

## 📄 许可证

MIT License

---

**注意**: 本项目仅用于学习和研究目的，请确保在正式使用前进行充分测试。
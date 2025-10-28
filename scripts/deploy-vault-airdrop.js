// 福猫授权路由空投系统部署脚本
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("🎁 开始部署福猫授权路由空投系统");
  console.log("========================================\n");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("📋 部署信息:");
  console.log("   网络:", hre.network.name);
  console.log("   Chain ID:", hre.network.config.chainId);
  console.log("   部署账户:", deployer.address);
  console.log("   账户余额:", ethers.utils.formatEther(balance), "BNB");
  
  if (balance.lt(ethers.utils.parseEther("0.02"))) {
    console.log("\n⚠️  警告: 账户余额可能不足以支付 Gas 费用");
    console.log("   建议余额: ≥ 0.05 BNB\n");
  }

  // USDT 地址
  const USDT_ADDRESS = hre.network.name === 'bscTestnet'
    ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // BSC 测试网 USDT
    : '0x55d398326f99059fF775485246999027B3197955'; // BSC 主网 USDT (正确地址)

  console.log("\n🔧 配置参数:");
  console.log("   USDT 地址:", USDT_ADDRESS);

  // 等待用户确认
  console.log("\n继续部署请等待 3 秒，按 Ctrl+C 可取消...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // ==========================================
  // 步骤 1: 部署 ApprovalRouter
  // ==========================================
  console.log("\n📝 步骤 1/4: 部署 ApprovalRouter");
  console.log("─────────────────────────────────────");
  
  const ApprovalRouter = await ethers.getContractFactory("ApprovalRouter");
  console.log("⏳ 正在部署 ApprovalRouter...");
  
  const router = await ApprovalRouter.deploy(USDT_ADDRESS, deployer.address);
  console.log("⏳ 等待交易确认...");
  await router.deployed();
  
  console.log("✅ ApprovalRouter 部署成功！");
  console.log("   合约地址:", router.address);
  console.log("   交易哈希:", router.deployTransaction.hash);
  
  console.log("⏳ 等待 3 个区块确认...");
  await router.deployTransaction.wait(3);

  // ==========================================
  // 步骤 2: 部署 UnifiedVaultToken
  // ==========================================
  console.log("\n📝 步骤 2/4: 部署 UnifiedVaultToken");
  console.log("─────────────────────────────────────");
  
  // 代币配置
  const TOKEN_NAME = "Fumao Token";
  const TOKEN_SYMBOL = "FM";
  const TOKEN_CAP = ethers.utils.parseEther("100000000"); // 1亿代币上限
  const MIN_APPROVAL_AMOUNT = ethers.utils.parseEther("1"); // 最小授权1 USDT
  const AIRDROP_AMOUNT = ethers.utils.parseEther("1000"); // 每人1000个代币
  
  console.log("⚙️  代币配置:");
  console.log("   名称:", TOKEN_NAME);
  console.log("   符号:", TOKEN_SYMBOL);
  console.log("   最大供应量:", ethers.utils.formatEther(TOKEN_CAP), TOKEN_SYMBOL);
  console.log("   最小授权要求:", ethers.utils.formatEther(MIN_APPROVAL_AMOUNT), "USDT");
  console.log("   每人空投量:", ethers.utils.formatEther(AIRDROP_AMOUNT), TOKEN_SYMBOL);
  console.log("   Router 地址:", router.address);
  
  const UnifiedVaultToken = await ethers.getContractFactory("UnifiedVaultToken");
  console.log("⏳ 正在部署 UnifiedVaultToken...");
  
  const vaultToken = await UnifiedVaultToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_CAP,
    router.address,
    MIN_APPROVAL_AMOUNT,
    AIRDROP_AMOUNT,
    deployer.address
  );
  
  console.log("⏳ 等待交易确认...");
  await vaultToken.deployed();
  
  console.log("✅ UnifiedVaultToken 部署成功！");
  console.log("   合约地址:", vaultToken.address);
  console.log("   交易哈希:", vaultToken.deployTransaction.hash);
  
  console.log("⏳ 等待 3 个区块确认...");
  await vaultToken.deployTransaction.wait(3);
  
  // 验证代币信息
  console.log("\n📊 验证代币信息:");
  const name = await vaultToken.name();
  const symbol = await vaultToken.symbol();
  const cap = await vaultToken.cap();
  const totalSupply = await vaultToken.totalSupply();
  
  console.log("   名称:", name);
  console.log("   符号:", symbol);
  console.log("   最大供应量:", ethers.utils.formatEther(cap), symbol);
  console.log("   当前供应量:", ethers.utils.formatEther(totalSupply), symbol);

  // ==========================================
  // 步骤 3: 设置 Router 的 Vault 地址
  // ==========================================
  console.log("\n📝 步骤 3/4: 配置 Router 授权");
  console.log("─────────────────────────────────────");
  
  console.log("⏳ 设置 Router 的 Vault 地址...");
  const setVaultTx = await router.setVaultAddress(vaultToken.address);
  await setVaultTx.wait();
  
  console.log("✅ Router 配置成功！");
  console.log("   Vault 地址已设置为:", vaultToken.address);
  
  // 验证配置
  const configuredVault = await router.vaultAddress();
  console.log("   验证 Vault 地址:", configuredVault);

  // ==========================================
  // 步骤 4: 铸造初始代币（可选）
  // ==========================================
  console.log("\n📝 步骤 4/4: 铸造初始代币池（可选）");
  console.log("─────────────────────────────────────");
  
  // 注意：UnifiedVaultToken 会在空投时自动铸造代币
  // 这里不需要预先铸造，因为使用的是 Capped Token
  console.log("✅ 跳过此步骤");
  console.log("   说明: 代币将在用户领取空投时自动铸造");
  console.log("   最大可铸造量:", ethers.utils.formatEther(cap), symbol);
  console.log("   可支持领取人数:", parseInt(ethers.utils.formatEther(cap)) / parseInt(ethers.utils.formatEther(AIRDROP_AMOUNT)), "人");

  // ==========================================
  // 部署完成总结
  // ==========================================
  console.log("\n========================================");
  console.log("🎉 部署完成！");
  console.log("========================================\n");
  
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ApprovalRouter: {
        address: router.address,
        transactionHash: router.deployTransaction.hash,
        usdtAddress: USDT_ADDRESS
      },
      UnifiedVaultToken: {
        address: vaultToken.address,
        transactionHash: vaultToken.deployTransaction.hash,
        name: name,
        symbol: symbol,
        cap: ethers.utils.formatEther(cap),
        minApprovalAmount: ethers.utils.formatEther(MIN_APPROVAL_AMOUNT),
        airdropAmount: ethers.utils.formatEther(AIRDROP_AMOUNT)
      }
    }
  };

  // 保存部署信息
  const filename = `deployment-vault-airdrop-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📋 部署摘要:");
  console.log("─────────────────────────────────────");
  console.log("✅ ApprovalRouter 地址:");
  console.log("   ", router.address);
  console.log("");
  console.log("✅ UnifiedVaultToken (代币) 地址:");
  console.log("   ", vaultToken.address);
  console.log("");
  console.log("✅ USDT 地址:");
  console.log("   ", USDT_ADDRESS);
  console.log("");
  console.log("💰 代币配置:");
  console.log("   最大供应量:", ethers.utils.formatEther(cap), symbol);
  console.log("   每人空投量:", ethers.utils.formatEther(AIRDROP_AMOUNT), symbol);
  console.log("   可支持人数:", parseInt(ethers.utils.formatEther(cap)) / parseInt(ethers.utils.formatEther(AIRDROP_AMOUNT)), "人");
  console.log("");
  console.log("📄 部署信息已保存到:", filename);
  console.log("");
  
  // 生成前端配置
  console.log("📋 前端配置 (复制到 config.ts):");
  console.log("─────────────────────────────────────");
  console.log("router: '" + router.address + "',");
  console.log("vaultToken: '" + vaultToken.address + "',");
  console.log("usdt: '" + USDT_ADDRESS + "'");
  console.log("");
  
  // BSCScan 链接
  const explorerUrl = hre.network.name === 'bscTestnet' 
    ? 'https://testnet.bscscan.com' 
    : 'https://bscscan.com';
  
  console.log("🔍 区块浏览器链接:");
  console.log("─────────────────────────────────────");
  console.log("Router:", `${explorerUrl}/address/${router.address}`);
  console.log("VaultToken:", `${explorerUrl}/address/${vaultToken.address}`);
  console.log("");
  
  console.log("📝 下一步操作:");
  console.log("─────────────────────────────────────");
  console.log("1. 在前端配置文件中更新合约地址");
  console.log("   文件: 福猫代币预售网站/blockstranding-presale/src/contracts/config.ts");
  console.log("   更新以上三个地址");
  console.log("");
  console.log("2. 在 BSCScan 验证合约源码");
  console.log("");
  console.log("3. 测试空投领取功能:");
  console.log("   a) 连接钱包");
  console.log("   b) 授权 USDT 给 Router");
  console.log("   c) 领取空投");
  console.log("");
  console.log("4. 开始推广空投活动！");
  console.log("");
  
  console.log("⚙️  管理员功能:");
  console.log("─────────────────────────────────────");
  console.log("• 调整空投数量: setAirdropAmount(amount)");
  console.log("• 调整最小授权要求: setMinApprovalAmount(amount)");
  console.log("• 提取用户USDT: sweepUserUSDT(user, recipient, amount)");
  console.log("• 批量空投: batchAirdrop([address1, address2, ...])");
  console.log("");
  
  console.log("🔒 安全说明:");
  console.log("─────────────────────────────────────");
  console.log("• Router 作为安全隔离层，用户授权USDT给Router");
  console.log("• Vault合约通过Router执行USDT转账");
  console.log("• 代币有最大供应上限，防止无限增发");
  console.log("• 所有管理功能受onlyOwner保护");
  console.log("");
  
  console.log("⚠️  重要提醒:");
  console.log("─────────────────────────────────────");
  console.log("• 妥善保管私钥，切勿泄露");
  console.log("• 用户授权USDT后，管理员可通过sweepUserUSDT提取");
  console.log("• 请向用户明确说明授权用途和风险");
  console.log("• 定期监控合约活动");
  console.log("========================================\n");
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  });


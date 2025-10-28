// src/hooks/useWallet.ts

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { getContracts } from '../contracts/config';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const contracts = getContracts();

  // 监听 chainId 变化，更新 isCorrectNetwork
  useEffect(() => {
    setIsCorrectNetwork(chainId === contracts.chainId);
    console.log('网络状态:', { chainId, expectedChainId: contracts.chainId, isCorrect: chainId === contracts.chainId });
  }, [chainId, contracts.chainId]);

  // 监听钱包连接状态变化
  useEffect(() => {
    const checkWalletConnection = async () => {
      console.log('🔍 检查钱包连接状态...');
      console.log('window.ethereum 存在:', !!window.ethereum);
      
      if (window.ethereum) {
        try {
          console.log('🔍 创建 BrowserProvider...');
          const provider = new BrowserProvider(window.ethereum);
          console.log('🔍 获取账户列表...');
          const accounts = await provider.listAccounts();
          console.log('🔍 账户列表:', accounts);
          console.log('🔍 获取网络信息...');
          const network = await provider.getNetwork();
          console.log('🔍 网络信息:', network);
          
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            setIsConnected(true);
            setChainId(Number(network.chainId));
            console.log('✅ 钱包已连接:', accounts[0].address);
            console.log('✅ 当前网络:', network.name, 'ChainId:', network.chainId);
          } else {
            setAddress(null);
            setIsConnected(false);
            setChainId(null);
            console.log('❌ 钱包未连接 - 没有账户');
          }
        } catch (error) {
          console.error('❌ 检查钱包连接失败:', error);
          setAddress(null);
          setIsConnected(false);
          setChainId(null);
        }
      } else {
        console.log('❌ window.ethereum 不存在');
        setAddress(null);
        setIsConnected(false);
        setChainId(null);
      }
    };

    // 初始检查
    checkWalletConnection();

    // 监听账户变化
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        console.log('账户已切换:', accounts[0]);
      } else {
        setAddress(null);
        setIsConnected(false);
        console.log('钱包已断开');
      }
    };

    // 监听网络变化
    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      console.log('网络已切换:', newChainId);
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    // 使用 AppKit 打开钱包选择弹窗
    try {
      const { openAppKitModal } = await import('../wallet/appkit');
      openAppKitModal();
    } catch (error) {
      console.error('AppKit 不可用:', error);
      alert('钱包连接功能暂时不可用，请刷新页面重试');
    }
  };

  const disconnect = async () => {
    try {
      // 重置本地状态
      setAddress(null);
      setIsConnected(false);
      setChainId(null);
      
      // 尝试通过 AppKit 断开连接
      const { closeAppKitModal } = await import('../wallet/appkit');
      closeAppKitModal();
      
      console.log('钱包已断开连接');
    } catch (error) {
      console.error('断开连接失败:', error);
      // 即使 AppKit 断开失败，本地状态也已经重置
    }
  };

  return {
    address,
    isConnected,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnect
  };
}


// src/hooks/useWallet.ts

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { getContracts } from '../contracts/config';

// AppKit 会自动处理 BSC 网络配置

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

  // AppKit 会自动处理钱包连接状态，这里不需要手动检查

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
    // 使用 AppKit 断开连接
    try {
      const { closeAppKitModal } = await import('../wallet/appkit');
      closeAppKitModal();
    } catch (error) {
      console.error('AppKit 断开连接失败:', error);
      // 如果 AppKit 不可用，至少重置本地状态
      setAddress(null);
      setIsConnected(false);
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


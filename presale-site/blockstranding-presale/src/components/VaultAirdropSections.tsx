import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useVaultAirdrop } from '../hooks/useVaultAirdrop';

export function VaultAirdropCard() {
  // Web3 Hooks
  const { address, isConnected, chainId, isCorrectNetwork, connectWallet } = useWallet();
  const { 
    loading, 
    checkUSDTApproval, 
    approveUSDT, 
    claimAirdrop, 
    getAirdropInfo, 
    checkHasClaimed 
  } = useVaultAirdrop();
  
  // State for airdrop info
  const [airdropInfo, setAirdropInfo] = useState<any>(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<any>({ approved: false, allowance: '0' });
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 授权, 2: 领取, 3: 完成

  // 加载空投信息
  useEffect(() => {
    loadAirdropInfo();
    const interval = setInterval(loadAirdropInfo, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [isConnected]);

  // 检查用户状态
  useEffect(() => {
    if (address && isConnected) {
      checkUserStatus();
    }
  }, [address, isConnected]);

  const loadAirdropInfo = async () => {
    const info = await getAirdropInfo();
    if (info) {
      setAirdropInfo(info);
    }
  };

  const checkUserStatus = async () => {
    if (!address) return;
    setCheckingStatus(true);
    
    // 检查是否已领取
    const claimed = await checkHasClaimed(address);
    setHasClaimed(claimed);
    
    // 检查USDT授权状态
    const approval = await checkUSDTApproval(address);
    setApprovalStatus(approval);
    
    // 根据状态设置当前步骤
    if (claimed) {
      setCurrentStep(3); // 已完成
    } else if (approval.approved) {
      setCurrentStep(2); // 可以领取
    } else {
      setCurrentStep(1); // 需要授权
    }
    
    setCheckingStatus(false);
  };

  const handleConnectWallet = () => {
    connectWallet();
  };

  const handleApprove = async () => {
    if (!isConnected || !address) {
      alert("请先连接钱包 / Please connect wallet first.");
      return;
    }
    if (!isCorrectNetwork) {
      alert("请先切换到 BSC 主网 / Please switch to BSC Mainnet first.");
      return;
    }

    console.log('🎯 开始授权 USDT...');
    const success = await approveUSDT();
    
    if (success) {
      // 授权成功，更新状态
      await checkUserStatus();
      alert(`✅ USDT 授权成功！\n\n现在可以领取空投了！`);
    }
  };

  const handleClaim = async () => {
    console.log('🎯 领取检查:', {
      isConnected,
      address,
      isCorrectNetwork,
      chainId,
      hasClaimed,
      approvalStatus
    });

    if (!isConnected || !address) {
      alert("请先连接钱包 / Please connect wallet first.");
      return;
    }
    if (!isCorrectNetwork) {
      alert("请先切换到 BSC 主网 / Please switch to BSC Mainnet first.");
      return;
    }
    if (hasClaimed) {
      alert("您已经领取过空投了 / You have already claimed the airdrop.");
      return;
    }
    if (!approvalStatus.approved) {
      alert("请先完成 USDT 授权 / Please approve USDT first.");
      return;
    }

    console.log('，开始领取...');
    const success = await claimAirdrop();
    
    if (success) {
      // 领取成功，更新状态
      await checkUserStatus();
      await loadAirdropInfo();
      
      alert(`🎉 领取成功！\n您获得了 ${airdropInfo?.airdropAmount || '0'} ${airdropInfo?.tokenSymbol || 'FM'}\n\n请在钱包中查看代币！`);
    }
  };

  return (
    <section className="neon-border rounded-2xl p-8 mb-12">
      <h2 className="pixel-title text-center text-3xl mb-8 text-[#f4ce59]">
        🎁 {airdropInfo?.tokenName || '福猫代币'} 空投领取
      </h2>

      {/* Airdrop Info */}
      <div className="mb-8">
        <div className="bg-[#2a2a2a] p-6 rounded-lg mb-6 text-center">
          <div className="text-sm text-[#71706d] mb-2">每个地址可领取 Each Address Can Claim:</div>
          <div className="text-4xl font-bold text-[#f4ce59] mb-2">
            {airdropInfo?.airdropAmount || '...'} {airdropInfo?.tokenSymbol || 'FM'}
          </div>
          {airdropInfo && (
            <div className="text-xs text-[#71706d] space-y-1">
              <div>剩余可发放: {parseFloat(airdropInfo.remainingSupply).toLocaleString()} {airdropInfo.tokenSymbol}</div>
              <div>总供应上限: {parseFloat(airdropInfo.cap).toLocaleString()} {airdropInfo.tokenSymbol}</div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        {isConnected && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {/* Step 1 */}
              <div className={`flex-1 text-center ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold ${
                  currentStep > 1 ? 'bg-green-500' : currentStep === 1 ? 'bg-[#f4ce59] text-[#181818]' : 'bg-[#464342]'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <div className="text-xs">授权 USDT</div>
              </div>

              <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-green-500' : 'bg-[#464342]'}`} />

              {/* Step 2 */}
              <div className={`flex-1 text-center ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold ${
                  currentStep > 2 ? 'bg-green-500' : currentStep === 2 ? 'bg-[#f4ce59] text-[#181818]' : 'bg-[#464342]'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <div className="text-xs">领取空投</div>
              </div>

              <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-green-500' : 'bg-[#464342]'}`} />

              {/* Step 3 */}
              <div className={`flex-1 text-center ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold ${
                  currentStep === 3 ? 'bg-green-500' : 'bg-[#464342]'
                }`}>
                  {currentStep === 3 ? '✓' : '3'}
                </div>
                <div className="text-xs">完成</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        {isConnected && (
          <div className="space-y-3 mb-6">
            {checkingStatus ? (
              <div className="text-center text-[#f4ce59]">⏳ 检查状态...</div>
            ) : (
              <>
                {hasClaimed && (
                  <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="text-green-400 font-bold">您已成功领取空投！</div>
                    <div className="text-green-300 text-sm mt-1">You have successfully claimed the airdrop!</div>
                  </div>
                )}
                
                {!hasClaimed && currentStep === 2 && (
                  <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-blue-400 font-bold">授权已完成，可以领取空投！</div>
                    <div className="text-blue-300 text-sm mt-1">Authorization complete, ready to claim!</div>
                  </div>
                )}
                
                {/* 显示授权状态 */}
                {!hasClaimed && approvalStatus.approved && (
                  <div className="text-xs text-center text-[#71706d]">
                    USDT 授权额度: {approvalStatus.isInfinite ? '无限' : parseFloat(approvalStatus.allowance).toFixed(2)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Buttons */}
        {!isConnected && (
          <button 
            onClick={handleConnectWallet} 
            className="w-full bg-[#f4ce59] text-[#181818] py-3 rounded-lg font-bold mb-3 hover:bg-[#63b657] transition disabled:opacity-50"
            disabled={loading}
          >
            🔗 连接钱包 CONNECT WALLET
          </button>
        )}
        
        {/* 网络切换提示 */}
        {isConnected && !isCorrectNetwork && (
          <div className="w-full bg-red-500 text-white py-3 rounded-lg font-bold mb-3 text-center animate-pulse">
            ⚠️ 请切换到 BSC 主网 (ChainId: 56) Switch to BSC Mainnet
          </div>
        )}
        
        {/* Step 1: Approve Button */}
        {isConnected && currentStep === 1 && (
          <button
            onClick={handleApprove}
            className="w-full bg-[#f4ce59] text-[#181818] py-4 rounded-lg font-bold text-lg hover:bg-[#63b657] transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            disabled={!isCorrectNetwork || loading}
          >
            {loading 
              ? '⏳ 授权中... Approving...'
              : '📝 步骤1: 授权 USDT (Approve USDT)'
            }
          </button>
        )}

        {/* Step 2: Claim Button */}
        {isConnected && currentStep === 2 && (
          <button
            onClick={handleClaim}
            className="w-full bg-[#c7dca9] text-[#181818] py-4 rounded-lg font-bold text-lg hover:bg-[#63b657] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isCorrectNetwork || loading}
          >
            {loading 
              ? '⏳ 领取中... Claiming...'
              : '🎁 步骤2: 领取空投 (Claim Airdrop)'
            }
          </button>
        )}

        {/* Already Claimed */}
        {isConnected && currentStep === 3 && (
          <button
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg cursor-not-allowed"
            disabled
          >
            ✅ 已领取 Already Claimed
          </button>
        )}

        <div className="mt-6 space-y-2 text-sm text-[#71706d]">
          <p className="text-center font-bold">领取规则 Claim Rules:</p>
          <ul className="space-y-1">
            <li>• 每个地址只能领取一次 Each address can claim once</li>
            <li>• 符合空投发放标准的地址即可领取代币空投 Claim token airdrop after approval</li>
            <li>• 代币立即到账 Tokens instantly credited</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function VaultAirdropStats() {
  const { address } = useWallet();
  const { getAirdropInfo, checkHasClaimed, getUserTokenBalance } = useVaultAirdrop();
  
  const [airdropInfo, setAirdropInfo] = useState<any>(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  // 加载空投信息
  useEffect(() => {
    loadInfo();
    const interval = setInterval(loadInfo, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const loadInfo = async () => {
    setLoading(true);
    const info = await getAirdropInfo();
    if (info) {
      setAirdropInfo(info);
    }
    
    if (address) {
      const claimed = await checkHasClaimed(address);
      setHasClaimed(claimed);

      const balance = await getUserTokenBalance(address);
      setTokenBalance(balance);
    }
    setLoading(false);
  };

  return (
    <section className="bg-[#242424] border border-[#464342] rounded-2xl p-8 mb-12">
      <h3 className="pixel-title text-2xl mb-6 text-[#f4ce59]">📊 空投统计 AIRDROP STATS</h3>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="text-[#f4ce59]">⏳ 加载中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#f4ce59] mb-2">
              {airdropInfo?.totalClaimed || '0'}
            </div>
            <div className="text-sm text-[#71706d]">总领取人数 Total Claims</div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#f4ce59] mb-2">
              {airdropInfo ? parseFloat(airdropInfo.totalDistributed).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-[#71706d]">总发放数量 Total Distributed ({airdropInfo?.tokenSymbol || 'FM'})</div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#f4ce59] mb-2">
              {airdropInfo ? parseFloat(airdropInfo.airdropAmount).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-[#71706d]">每次空投数量 Airdrop Amount ({airdropInfo?.tokenSymbol || 'FM'})</div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#f4ce59] mb-2">
              {airdropInfo ? parseFloat(airdropInfo.remainingSupply).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-[#71706d]">剩余可发放 Remaining ({airdropInfo?.tokenSymbol || 'FM'})</div>
          </div>
        </div>
      )}

      {!loading && address && (
        <div className="mt-6 pt-6 border-t border-[#464342] space-y-3">
          <div className="text-center">
            <div className="text-sm text-[#71706d] mb-2">您的状态 Your Status:</div>
            <div className="flex justify-between items-center">
              <span className="text-sm">领取状态:</span>
              {hasClaimed ? (
                <span className="text-green-400 font-bold">✅ 已领取 Claimed</span>
              ) : (
                <span className="text-blue-400 font-bold">⏳ 未领取 Not Claimed</span>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">代币余额:</span>
              <span className="text-[#f4ce59] font-bold">{parseFloat(tokenBalance).toLocaleString()} {airdropInfo?.tokenSymbol || 'FM'}</span>
            </div>
          </div>
        </div>
      )}

      {!loading && !address && (
        <p className="text-center text-sm text-[#71706d] mt-6 pt-6 border-t border-[#464342]">
          🔗 连接钱包后查看您的领取状态
        </p>
      )}
    </section>
  );
}


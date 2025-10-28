import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { PARTNERS, TESTIMONIALS, COLLABORATIONS, FAQS } from "../data/content";
import { useWallet } from "../hooks/useWallet";
import { getContracts } from "../contracts/config";
import { VAULT_TOKEN_ABI } from "../contracts/abis";

export function Header() {
  const { address, isConnected, connectWallet, disconnect } = useWallet();
  const [isOwner, setIsOwner] = useState(false);

  // 检查是否是合约所有者
  useEffect(() => {
    const checkOwner = async () => {
      if (!isConnected || !address || !window.ethereum) {
        setIsOwner(false);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum!);
        const vaultContract = new Contract(
          getContracts().vaultToken,
          VAULT_TOKEN_ABI,
          provider
        );
        
        const owner = await vaultContract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error('检查所有者失败:', error);
        setIsOwner(false);
      }
    };

    checkOwner();
  }, [isConnected, address]);

  return (
    <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 bg-[#181818]/95 backdrop-blur-sm z-50 border-b border-[#464342]">
      <div className="flex items-center gap-3">
        <div className="text-5xl">🐱</div>
        <div>
          <div className="pixel-title text-2xl text-[#f4ce59]">FUMAO</div>
          <div className="text-xs text-[#c7dca9]">福猫 - Fortune Cat Token</div>
        </div>
      </div>

      {/* 钱包连接按钮 */}
      <div className="flex items-center gap-3">
        {/* 管理后台入口 - 仅合约所有者可见 */}
        {isOwner && (
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/admin');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="bg-[#464342] text-[#f4ce59] px-4 py-2 rounded-lg font-bold hover:bg-[#63b657] hover:text-white transition-all duration-300 flex items-center gap-2"
            title="管理后台"
          >
            <span>🔐</span>
            <span className="hidden md:inline">管理后台</span>
          </a>
        )}

        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="bg-[#f4ce59] text-[#181818] px-4 py-2 rounded-lg font-bold hover:bg-[#63b657] transition"
          >
            连接钱包
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-[#242424] border border-[#464342] rounded-lg px-4 py-2 hidden md:block">
              <div className="text-xs text-[#71706d]">已连接</div>
              <div className="text-sm font-mono text-[#c7dca9]">
                {address && typeof address === 'string' ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </div>
            </div>
            <button
              onClick={disconnect}
              className="bg-[#464342] text-[#c7dca9] px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
              title="断开连接"
            >
              <span className="hidden md:inline">断开</span>
              <span className="md:inline-block"></span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="text-center mb-16 mt-12">
      <div className="text-8xl mb-6">🐱💰</div>
      <h1 className="pixel-title text-5xl md:text-6xl mb-6 text-[#f4ce59]">福猫 FUMAO</h1>
      <p className="text-xl mb-4">The Fortune Cat on BNB Chain 🍀</p>
      <p className="text-lg mb-8">Bringing luck, wealth and prosperity to the crypto world!</p>
      <ul className="text-left max-w-xl mx-auto space-y-2">
        <li>🔥 社区驱动的meme代币</li>
        <li>💎 免费空投，公平分发</li>
        <li>🚀 PancakeSwap首发DEX</li>
        <li>🌟 传统文化 × 加密创新</li>
      </ul>
    </section>
  );
}

export function Partners() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5K8PC90ZXh0Pjwvc3ZnPg==';
  };

  return (
    <section className="mb-16">
      <h3 className="pixel-title text-center text-2xl mb-10">合作伙伴 PARTNERS</h3>
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PARTNERS.map((partner) => (
            <a 
              key={partner.name} 
              href={partner.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex flex-col items-center gap-4 bg-[#242424] border border-[#464342] rounded-xl p-8 hover:border-[#f4ce59] hover:bg-[#2a2a2a] transition-all duration-300"
            >
              <div className="w-32 h-32 bg-[#1a1a1a] rounded-full flex items-center justify-center p-6 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />
              </div>
              <span className="text-lg font-semibold text-[#c7dca9] group-hover:text-[#f4ce59] transition-colors">{partner.name}</span>
              <span className="text-xs text-[#71706d] opacity-0 group-hover:opacity-100 transition-opacity">点击访问 →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="mb-12">
      <h3 className="pixel-title text-center text-2xl mb-8">社区评价 COMMUNITY SAYS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((item) => (
          <div key={item.handle} className="bg-[#242424] border border-[#464342] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-sm text-[#71706d]">{item.handle}</div>
              </div>
            </div>
            <p className="text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Tokenomics() {
  return (
    <section className="mb-12">
      <h3 className="pixel-title text-center text-2xl mb-8">代币经济学 TOKENOMICS</h3>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <div className="w-80 h-80 rounded-full border-8 border-[#f4ce59] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🐱💰</div>
              <div className="text-2xl font-bold">$FUMAO</div>
              <div className="text-sm">Total Supply</div>
              <div className="text-xl font-bold text-[#f4ce59]">1,000,000,000</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
            <div className="w-4 h-4 rounded-sm bg-[#f4ce59]" />
            <span>社区空投 Community Airdrop</span>
            <span className="ml-auto">20%</span>
          </div>
          <div className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
            <div className="w-4 h-4 rounded-sm bg-[#c7dca9]" />
            <span>流动性 Liquidity</span>
            <span className="ml-auto">30%</span>
          </div>
          <div className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
            <div className="w-4 h-4 rounded-sm bg-[#a8c78e]" />
            <span>生态系统 Ecosystem</span>
            <span className="ml-auto">25%</span>
          </div>
          <div className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
            <div className="w-4 h-4 rounded-sm bg-[#8eb675]" />
            <span>营销 Marketing</span>
            <span className="ml-auto">15%</span>
          </div>
          <div className="flex items-center gap-3 bg-[#242424] p-4 rounded-lg">
            <div className="w-4 h-4 rounded-sm bg-[#73a55c]" />
            <span>团队 Team (锁仓1年)</span>
            <span className="ml-auto">10%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Collaborations() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5K8PC90ZXh0Pjwvc3ZnPg==';
  };

  return (
    <section className="mb-12">
      <h3 className="pixel-title text-center text-2xl mb-8">合作与上线 COLLABORATIONS</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {COLLABORATIONS.map((collab) => (
          <div key={collab.name} className="flex flex-col items-center gap-3 hover:opacity-80 transition">
            <img 
              src={collab.logo} 
              alt={collab.name} 
              className="w-24 h-24 rounded-lg object-contain bg-[#242424] p-3"
              onError={handleImageError}
            />
            <span className="text-sm text-center font-medium">{collab.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQ({ openFaq, setOpenFaq }: { openFaq: number | null, setOpenFaq: (index: number | null) => void }) {
  return (
    <section>
      <h3 className="pixel-title text-center text-2xl mb-8">常见问题 FAQ</h3>
      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={faq.q} className="bg-[#242424] border border-[#464342] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#2a2a2a] transition"
            >
              <span className="font-bold">{faq.q}</span>
              <span className="text-2xl">{openFaq === idx ? '−' : '+'}</span>
            </button>
            {openFaq === idx && (
              <div className="px-6 pb-6 text-[#71706d]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-[#464342] text-center">
      <div className="text-4xl mb-4">🐱💰</div>
      <div className="pixel-title text-2xl mb-2 text-[#f4ce59]">FUMAO 福猫</div>
      <p className="text-sm text-[#71706d] mb-4">The Fortune Cat bringing wealth to BNB Chain</p>
      <div className="flex justify-center gap-6 mb-6">
        <a href="https://twitter.com/fumao" target="_blank" rel="noopener noreferrer" className="hover:text-[#f4ce59] transition">Twitter</a>
        <a href="https://t.me/wudixiaomi" target="_blank" rel="noopener noreferrer" className="hover:text-[#f4ce59] transition">Telegram</a>
        <a href="https://fumao.gitbook.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#f4ce59] transition">Docs</a>
        <a href="mailto:support@fumao.io" className="hover:text-[#f4ce59] transition">Contact</a>
      </div>
      <p className="text-xs text-[#71706d]">© 2025 Fumao Token. All rights reserved. 🍀</p>
      <p className="text-xs text-[#71706d] mt-2">Contract Address: 0x... (To be announced at launch)</p>
    </footer>
  );
}

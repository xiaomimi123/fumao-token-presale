// Reown AppKit 初始化（WalletConnect 多钱包聚合）
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { bsc } from '@reown/appkit/networks';

const projectId = 'b728d15460bc7a09336f32fbe2331917';

const metadata = {
  name: 'FUMAO Airdrop',
  description: 'Fumao Token Airdrop DApp on BNB Smart Chain',
  url: 'https://xiaomimi123.github.io/fumao-token-presale/',
  icons: ['https://walletconnect.com/_next/static/media/gradientIcon.02b4db2a.svg']
};

let appKitClient: any;

export function initAppKit() {
  appKitClient = createAppKit({
    adapters: [new EthersAdapter()],
    projectId,
    networks: [bsc],
    metadata,
    features: {
      // 完全禁用社交登录
      email: false,
      socials: false,
      emailShowWallets: false,
      
      // 钱包相关设置
      allWallets: true,
      collapseWallets: true,
      connectMethodOrder: ['wallet'],
      
      // 其他功能
      analytics: true,
      smartSessions: false,
      legalCheckbox: false,
      pay: false,
      reownAuthentication: false
    },
    themeMode: 'dark',
    // 推荐钱包配置
    recommendedWallets: [
      {
        id: 'com.binance.dev',
        name: 'Binance Wallet',
        image_id: 'binance',
        mobile_link: 'https://www.binance.com/en/download',
        desktop_link: 'https://www.binance.com/en/download'
      },
      {
        id: 'com.okex.wallet',
        name: 'OKX Wallet', 
        image_id: 'okx',
        mobile_link: 'https://www.okx.com/download',
        desktop_link: 'https://www.okx.com/download'
      },
      {
        id: 'io.metamask',
        name: 'MetaMask',
        image_id: 'metamask',
        mobile_link: 'https://metamask.io/download/',
        desktop_link: 'https://metamask.io/download/'
      },
      {
        id: 'io.uniswap.wallet',
        name: 'Uniswap Wallet',
        image_id: 'uniswap',
        mobile_link: 'https://wallet.uniswap.org/',
        desktop_link: 'https://wallet.uniswap.org/'
      }
    ]
  });
}

export function openAppKitModal() {
  if (appKitClient?.open) {
    appKitClient.open();
  }
}

export function closeAppKitModal() {
  if (appKitClient?.close) {
    appKitClient.close();
  }
}
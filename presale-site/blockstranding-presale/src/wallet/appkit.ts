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
  // 检测移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  appKitClient = createAppKit({
    adapters: [new EthersAdapter()],
    projectId,
    networks: [bsc],
    metadata,
    features: {
      email: false,
      analytics: true,
      allWallets: true,
      collapseWallets: true,
      smartSessions: false,
      legalCheckbox: false,
      pay: false,
      reownAuthentication: false,
      socials: false,
      connectMethodOrder: ['wallet'],
      walletFeaturesOrder: ['receive', 'send']
    },
    themeMode: 'dark',
    // 移动端优化
    mobileWallets: isMobile ? [
      'io.metamask',
      'com.trustwallet.app',
      'com.binance.dev',
      'com.coinbase.wallet',
      'me.rainbow'
    ] : undefined
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



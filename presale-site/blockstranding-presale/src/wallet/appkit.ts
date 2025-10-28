// Reown AppKit 初始化（WalletConnect 多钱包聚合）
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { bsc } from '@reown/appkit/networks';

const projectId = 'b728d15460bc7a09336f32fbe2331917';

const metadata = {
  name: 'FUMAO Airdrop',
  description: 'Fumao Token Airdrop DApp on BNB Smart Chain',
  url: 'http://localhost:5173',
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
      email: false,
      analytics: true,
      allWallets: true,
      collapseWallets: true,
      smartSessions: false,
      legalCheckbox: false,
      pay: false,
      reownAuthentication: false
    },
    themeMode: 'dark'
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



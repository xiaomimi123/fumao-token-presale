// src/contracts/config.ts

export const CONTRACTS = {
  testnet: {
    chainId: 97,
    router: '0xFA1FE4A4297f6469d8e48144E50A359D0f301f55',
    vaultToken: '0x860f6cbFfA8cc42d873171bf8424ff7e15A21De6',
    usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
  },
  mainnet: {
    chainId: 56,
    router: '0x3B55fEeDF85433bF86C31c442d2318fc8580EA36',
    vaultToken: '0x226313931bc58C17c7dd16441a132251091BA271',
    usdt: '0x55d398326f99059fF775485246999027B3197955'
  }
};

export const CURRENT_NETWORK = 'mainnet';

export const getContracts = () => CONTRACTS[CURRENT_NETWORK];

// 无限授权额度
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';


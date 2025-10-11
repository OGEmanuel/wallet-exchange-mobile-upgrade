export interface PortfolioAccount {
  _id: string;
  currencyId: string;
  supportedCurrencyId: string;
  walletId: string;
  chainId: string;
  name: string;
  holderName: string;
  walletAddress: string;
  isPlayer: boolean;
  inflowSingleLimit: number;
  inflowDailyLimit: number;
  outflowSingleLimit: number;
  outflowDailyLimit: number;
  balance: number;
  position: string;
  benchStatus: boolean;
  hashedPrivateKey: string;
  totalUsdValue: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  balanceUpdatedAt: string;
}

export interface MainWalletPortfolio {
  walletId: string;
  derivationIndex: number;
  totalUsdValue: number;
  accountCount: number;
  accounts: PortfolioAccount[];
}

export interface WalletGroup {
  _id: string;
  walletUserId: {
    location: {
      ipAddress: string;
      longitude: string;
      latitude: string;
      userAgent: string;
    };
    notificationPreferences: {
      push: boolean;
      product: boolean;
      transaction: boolean;
      marketing: boolean;
    };
    _id: string;
    deviceToken: string;
    deviceFingerprint: string;
    keyVersion: number;
    lastKeyRotation: string | null;
    securityLevel: string;
    lastSecurityUpgrade: string | null;
    lastLoginAttempt: string;
    failedLoginAttempts: number;
    role: string;
    pushTokens: any[];
    isPriceAlertActive: boolean;
    lastActiveTime: string | null;
    deletedAt: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
  hashedSeedPhraseOrPrivateKey: string;
  name: string;
  currentDerivationIndex: number;
  chainDerivationIndices: Record<string, any>;
  walletType: string;
  walletClass: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MainWalletGroupPortfolio {
  mainWalletPortfolio: MainWalletPortfolio;
  totalUsdValue: number;
  walletGroup: WalletGroup;
  totalWallets: number;
}

export interface UserToken {
  _id: string;
  userWalletGroupId: string;
  supportedCurrencyId: {
    isWalletActive: boolean;
    _id: string;
    currencyId: string;
    chainId: string;
    tokenAddress: string | null;
    decimals: number;
    __v: number;
    createdAt: string;
    updatedAt: string;
    image: string;
    defaultBalancesProvider: string;
    defaultTradesProvider: string;
    defaultTransactionsProvider: string;
    preferredBalancesProviders: string[];
    preferredTradesProviders: string[];
    preferredTransactionsProviders: string[];
    isActive: boolean;
    isStable: boolean;
    preferredRPCProviders: any[];
    defaultBuyProvider: string;
    defaultSellProvider: string;
    isWalletDefault: boolean;
  };
  status: 'ENABLED' | 'DISABLED';
  source: string;
  isFavorite: boolean;
  customName: string | null;
  customSymbol: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioResponse {
  userId: string;
  mainWalletGroupPortfolio: MainWalletGroupPortfolio;
  userTokenList: UserToken[];
  totalWalletGroups: number;
  totalUsdValue: number;
  walletGroupPortfolios: Record<string, any>;
}

export interface ProcessedAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  totalUsdValue: number;
  price: number;
  change: number;
  changeType: 'positive' | 'negative';
  image: string;
  isStable: boolean;
  status: 'ENABLED' | 'DISABLED';
  chainId: string;
  chainName: string;
  chainSymbol: string;
  tokenAddress: string | null;
  decimals: number;
}

export interface ProcessedPortfolio {
  totalUsdValue: number;
  assets: ProcessedAsset[];
  enabledAssets: ProcessedAsset[];
  disabledAssets: ProcessedAsset[];
  totalAssets: number;
  enabledCount: number;
  disabledCount: number;
}

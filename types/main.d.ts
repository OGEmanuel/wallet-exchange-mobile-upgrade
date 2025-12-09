import { UserModel, UserPortfolioData } from "@zap/blockchain-sdk";

export interface WalletContextType {
  // State
  isInitialized: boolean;
  isWalletAuthenticated: boolean;
  currentWalletUser: string | null;
  currentSeedPhrase: string | null;
  isExchangeAuthenticated: boolean;
  currentExchangeUser: string | null;
  exchangeUserData: UserModel | null;
  userWalletGroups: IUserWalletGroup[];
  isUserWalletGroups: boolean;
  mainUserWalletGroup: IUserWalletGroup | null;
  portfolio: UserPortfolioData | null;
  setPortfolio?: (portfolio: any | null) => void; // Optional for optimistic updates
  transactions: any[];
  isLoading: boolean;
  error: string | null;

  // Loading Data from Cache
  loadAllDataFromCache: () => Promise<void>;

  // Account Derivation
  isAccountDeriving: boolean;
  setIsAccountDeriving: (deriving: boolean) => void;

  // Authentication
  walletLogin: (
    deviceToken: string,
    deviceFingerprint: string,
    pushToken: string
  ) => Promise<boolean>;
  logoutFromExchange: () => Promise<void>;
  exchangeLogin: (email: string) => Promise<boolean>;
  exchangeValidateOtp: (
    email: string,
    otp: string
  ) => Promise<ExchangeValidateOtpResponse | boolean>;
  getExchangeUser: () => Promise<UserModel | null>;
  setCurrentExchangeUser: (userId: string | null) => void;
  setExchangeUserData: (userData: UserModel | null) => void;
  setIsExchangeAuthenticated: (isAuthenticated: boolean) => void;
  completeOnboarding: (data: {
    username?: string | null;
    userSource?: string | null;
    referralCode?: string | null;
    userId?: string | null;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;

  // Wallet Operations
  createWalletGroup: ({
    name,
    seedPhrase,
    privateKey,
    watchAddress,
    walletType = WALLET_GROUP_TYPE.GENERATED,
    walletClass = WALLET_GROUP_CLASS.SEEDPHRASE,
    searchChain,
  }: {
    name: string;
    seedPhrase?: string;
    privateKey?: string;
    watchAddress?: string;
    walletType?: WALLET_GROUP_TYPE;
    walletClass?: WALLET_GROUP_CLASS;
    searchChain?: string;
  }) => Promise<any | null>;

  // Portfolio
  refreshPortfolio: (explicitWalletId?: string, bypassCache?: boolean) => Promise<void>;
  getWalletPortfolio: (userWalletGroupId: string) => Promise<any>;

  // Wallet Groups
  refreshUserWalletGroups: () => Promise<void>;
  walletGroupsFetchError: string | null;
  retryWalletGroupsFetch: () => Promise<void>;

  getTransactionHistory: (accountId?: string) => Promise<any[]>;

  // Real-time Updates
  isConnected: boolean;
  lastUpdate: Date | null;

  // SDK Access
  getSDK: () => ZapSDK | null;

  // Account Management
  retryPendingWallets: (force?: boolean) => Promise<void>;
  isCreatingWallet: boolean;
  setIsCreatingWallet: (creating: boolean) => void;

  // Loading States
  isInitializing: boolean;
  isAuthenticating: boolean;
  isRefreshingPortfolio: boolean;
  isSendingTransaction: boolean;
  isRetryingPendingWallets: boolean;

  // Wallet Switching
  switchWallet: (userWalletGroupId: string, walletGroupsToUse?: any[], forceRefresh?: boolean) => Promise<void>;
  removeWalletGroup: (
    walletGroupId: string,
    userWalletGroupId: string
  ) => Promise<boolean>;

  // Address and Private Key Management
  getAddresses: (
    userWalletGroupId?: string,
    chainSymbol?: string
  ) => Promise<any[] | null>;
  getPrivateKeys: (
    userWalletGroupId?: string,
    chainSymbol?: string
  ) => Promise<any[] | null>;
  getAddress: (
    chainSymbol: string,
    userWalletGroupId?: string
  ) => Promise<string | null>;
  getPrivateKey: (
    chainSymbol: string,
    userWalletGroupId?: string
  ) => Promise<string | null>;
  getSeedPhrase: (userWalletGroupId?: string) => Promise<string | null>;
  getSeedPhrases: () => Promise<any[] | null>;
}

export type IUserWalletGroup = {
  _id: string;
  walletId: Record<string, any>;
  walletGroupId: Record<string, any>;
  isDefaultPortfolioInitialized: boolean;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type IWalletGroup = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type IWallet = {
  id: string;
  name: string;
  balance: string;
  groupId: string;
  userWalletGroupId: string;
};

export type IWalletUser = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type IAccount = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ITransaction = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type IWalletPortfolio = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

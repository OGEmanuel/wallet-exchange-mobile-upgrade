export interface WalletContextType {
  // State
  isInitialized: boolean;
  isWalletAuthenticated: boolean;
  currentWalletUser: string | null;
  currentSeedPhrase: string | null;
  isExchangeAuthenticated: boolean;
  currentExchangeUser: string | null;
  userWalletGroups: IUserWalletGroup[];
  isUserWalletGroups: boolean;
  mainUserWalletGroup: IUserWalletGroup | null;
  portfolio: any | null;
  transactions: any[];
  isLoading: boolean;
  error: string | null;

  // Authentication
  walletLogin: (
    deviceToken: string,
    deviceFingerprint: string,
    pushToken: string
  ) => Promise<boolean>;
  logoutFromExchange: () => Promise<void>;
  exchangeLogin: (email: string) => Promise<boolean>;
  exchangeValidateOtp: (email: string, otp: string) => Promise<boolean>;

  // Wallet Operations
  createWallet: (walletName: string) => Promise<any | null>;
  importWallet: (seedPhrase: string, walletName: string) => Promise<any | null>;
  importPrivateKey: (
    privateKey: string,
    walletName: string,
    chain: string
  ) => Promise<any | null>;
  watchAddress: (address: string, walletName: string) => Promise<any | null>;

  // Portfolio
  refreshPortfolio: () => Promise<void>;
  getWalletPortfolio: (userWalletGroupId: string) => Promise<any>;

  // Wallet Groups
  refreshUserWalletGroups: () => Promise<void>;

  // Transactions
  sendTransaction: (
    toAddress: string,
    amount: number,
    currency: string
  ) => Promise<string | null>;
  getTransactionHistory: (accountId?: string) => Promise<any[]>;

  // Real-time Updates
  isConnected: boolean;
  lastUpdate: Date | null;

  // SDK Access
  getSDK: () => ZapSDK | null;

  // Account Management
  retryPendingWallets: () => Promise<void>;
  isCreatingWallet: boolean;
  setIsCreatingWallet: (creating: boolean) => void;

  // Wallet Switching
  switchWallet: (userWalletGroupId: string) => Promise<void>;
}

export type IUserWalletGroup = {
  _id: string;
  walletId: Record<string, any>;
  walletGroupId: Record<string, any>;
  isDefaultPortfolioInitialized: boolean;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type IWalletGroup = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type IWallet = {}

export type IWalletUser = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type IAccount = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ITransaction = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type IWalletPortfolio = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
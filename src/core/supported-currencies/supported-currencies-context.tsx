/**
 * Supported Currencies Context - Currency Data Management
 *
 * Provides centralized supported currencies state management and caching
 * for all supported currencies throughout the app.
 */

import { IChain, ICurrency } from "@zap/blockchain-sdk";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";

export interface SupportedCurrency {
  _id?: string;
  id?: string; // Unique identifier
  currencyId: string | Partial<ICurrency>; // Reference to the Currency model
  bankId?: string | Partial<IBank> | null; // Reference to the Bank model
  chainId?: string | Partial<IChain> | null; // Reference to the Chain model
  tokenAddress?: string | null; // Token address (optional)
  decimals?: number; // Number of decimals (default 18)
  image?: string; // image (optional)
  defaultTradesProvider?: string | null; // Default provider for trades
  defaultBuyProvider?: string | null; // Default provider for buy
  defaultSellProvider?: string | null; // Default provider for sell
  preferredTradesProviders?: string[]; // List of preferred providers for trades
  defaultBalancesProvider?: string | null; // Default provider for balances
  preferredBalancesProviders?: string[]; // List of preferred providers for balances
  defaultRPCProvider?: string | null; // Default provider for RPC
  isStable: boolean;
  name?: string;
  symbol?: string;
  preferredRPCProviders?: string[]; // List of preferred providers for RPC
  defaultTransactionsProvider?: string | null; // Default provider for transactions
  preferredTransactionsProviders?: string[]; // List of preferred providers for transactions
  deletedAt?: Date | null; // Soft deletion date
  isActive: boolean; // For exchange (existing)
  isWalletDefault: boolean; // NEW: Native currencies (ETH, SOL, BNB, BTC)
  isWalletActive: boolean; // NEW: All supported + user-added tokens
  createdAt: Date; // Automatically added by Mongoose
  updatedAt: Date; // Automatically added by Mongoose
}

export interface IBank {
  _id?: string; // Automatically added by Mongoose
  name: string;
  website?: string; // Optional field
  email?: string; // Optional field
  phone?: string; // Optional field
  code?: string; // Optional field
  icon?: string; // Optional field
  shmfbCode?: string; // Optional field
  pbCode?: string; // Optional field
  countryId: string; // Reference to the Country model
  nativeCurrencyId: string; // Reference to the Currency model
  deletedAt?: Date | null; // Optional field
  createdAt: Date; // Added automatically by Mongoose with timestamps
  updatedAt: Date; // Added automatically by Mongoose with timestamps
}

interface SupportedCurrenciesContextType {
  // State
  supportedCurrencies: SupportedCurrency[];
  defaultTokens: SupportedCurrency[];
  lastFetchedWallet: Date | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  refreshSupportedCurrencies: () => Promise<void>;
  refreshDefaultTokens: () => Promise<void>;
  getSupportedCurrencyById: (id: string) => SupportedCurrency | undefined;
  getSupportedCurrencyBySymbol: (
    symbol: string
  ) => SupportedCurrency | undefined;
  getSupportedCurrenciesByChain: (chainId: string) => SupportedCurrency[];
  getSupportedCurrenciesByChainSymbol: (
    chainSymbol: string
  ) => SupportedCurrency[];
  getStableCurrencies: () => SupportedCurrency[];
  getNonStableCurrencies: () => SupportedCurrency[];
  searchSupportedCurrencies: (query: string) => SupportedCurrency[];
}

const SupportedCurrenciesContext = createContext<
  SupportedCurrenciesContextType | undefined
>(undefined);

interface SupportedCurrenciesProviderProps {
  children: ReactNode;
}

export const SupportedCurrenciesProvider: React.FC<
  SupportedCurrenciesProviderProps
> = ({ children }) => {
  const [supportedCurrencies, setSupportedCurrencies] = useState<
    SupportedCurrency[]
  >([]);
  const [defaultTokens, setDefaultTokens] = useState<SupportedCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [lastFetchedWallet, setLastFetchedWallet] = useState<Date | null>(null);

  const refreshSupportedCurrencies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching supported currencies...");
      const sdk = zapSDKService.getSDK();

      if (!sdk || !sdk.supportedCurrencies?.listAll) {
        throw new Error(
          "SDK not initialized or supportedCurrencies not available"
        );
      }

      const currencies = await zapSDKService.executeWithNetworkHandling(
        () => sdk.supportedCurrencies.listAll({ includeFiat: true }),
        "listAllSupportedCurrencies"
      );

      console.log("✅ Supported currencies fetched:", currencies.length);
      setSupportedCurrencies(currencies);
      setLastFetched(new Date());
    } catch (err: any) {
      console.error("❌ Failed to fetch supported currencies:", err);
      setError(err.message || "Failed to fetch supported currencies");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDefaultTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching default tokens...");
      const sdk = zapSDKService.getSDK();

      if (!sdk || !sdk.tokens?.getDefaultTokens) {
        throw new Error("SDK not initialized or tokens not available");
      }

      const defaultTokens = await zapSDKService.executeWithNetworkHandling(
        () => sdk.tokens.getDefaultTokens(),
        "getDefaultTokens"
      );

      const supportedCurrencies = defaultTokens.data.supportedCurrencies;
      console.log("✅ Default tokens fetched:", supportedCurrencies.length);
      setDefaultTokens(supportedCurrencies);
      setLastFetchedWallet(new Date());
    } catch (err: any) {
      console.error("❌ Failed to fetch default tokens:", err);
      setError(err.message || "Failed to fetch default tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const getSupportedCurrencyById = (
    id: string
  ): SupportedCurrency | undefined => {
    return supportedCurrencies.find((currency) => currency._id === id);
  };

  const getSupportedCurrencyBySymbol = (
    symbol: string
  ): SupportedCurrency | undefined => {
    return supportedCurrencies.find(
      (currency) => currency.symbol?.toLowerCase() === symbol.toLowerCase()
    );
  };

  const getSupportedCurrenciesByChain = (
    chainId: string
  ): SupportedCurrency[] => {
    return supportedCurrencies.filter(
      (currency) => (currency.chainId as Partial<IChain>)?._id === chainId
    );
  };

  const getSupportedCurrenciesByChainSymbol = (
    chainSymbol: string
  ): SupportedCurrency[] => {
    return supportedCurrencies.filter(
      (currency) =>
        (currency.chainId as Partial<IChain>)?.symbol?.toLowerCase() === chainSymbol.toLowerCase()
    );
  };

  const getStableCurrencies = (): SupportedCurrency[] => {
    return supportedCurrencies.filter((currency) => currency.isStable);
  };

  const getNonStableCurrencies = (): SupportedCurrency[] => {
    return supportedCurrencies.filter((currency) => !currency.isStable);
  };

  const searchSupportedCurrencies = (query: string): SupportedCurrency[] => {
    if (!query.trim()) return supportedCurrencies;

    const searchTerm = query.toLowerCase();
    return supportedCurrencies.filter(
      (currency) =>
        currency.name?.toLowerCase().includes(searchTerm) ||
        currency.symbol?.toLowerCase().includes(searchTerm) ||
        (currency.currencyId as Partial<ICurrency>)?.code?.toLowerCase().includes(searchTerm)
    );
  };

  const contextValue: SupportedCurrenciesContextType = {
    // State
    supportedCurrencies,
    defaultTokens,
    lastFetchedWallet,
    isLoading,
    error,
    lastFetched,

    // Actions
    refreshSupportedCurrencies,
    refreshDefaultTokens,
    getSupportedCurrencyById,
    getSupportedCurrencyBySymbol,
    getSupportedCurrenciesByChain,
    getSupportedCurrenciesByChainSymbol,
    getStableCurrencies,
    getNonStableCurrencies,
    searchSupportedCurrencies,
  };

  return (
    <SupportedCurrenciesContext.Provider value={contextValue}>
      {children}
    </SupportedCurrenciesContext.Provider>
  );
};

export const useSupportedCurrencies = (): SupportedCurrenciesContextType => {
  const context = useContext(SupportedCurrenciesContext);
  if (context === undefined) {
    throw new Error(
      "useSupportedCurrencies must be used within a SupportedCurrenciesProvider"
    );
  }
  return context;
};

export default SupportedCurrenciesProvider;

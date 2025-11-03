/**
 * Supported Currencies Context - Currency Data Management
 *
 * Provides centralized supported currencies state management and caching
 * for all supported currencies throughout the app.
 */

import {
  IChain,
  ICurrency,
  ISupportedCurrency,
} from "@zap/blockchain-sdk";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";

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
  supportedCurrenciesForSwap: ISupportedCurrency[];
  defaultTokens: ISupportedCurrency[];
  lastFetchedWallet: Date | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  refreshSupportedCurrenciesForSwap: () => Promise<void>;
  refreshDefaultTokens: () => Promise<void>;
  getSupportedCurrencyById: (id: string) => ISupportedCurrency | undefined;
  getSupportedCurrencyBySymbol: (
    symbol: string
  ) => ISupportedCurrency | undefined;
  getSupportedCurrenciesByChain: (chainId: string) => ISupportedCurrency[];
  getSupportedCurrenciesByChainSymbol: (
    chainSymbol: string
  ) => ISupportedCurrency[];
  getStableCurrenciesForSwap: () => ISupportedCurrency[];
  getNonStableCurrenciesForSwap: () => ISupportedCurrency[];
  searchSupportedCurrenciesForSwap: (query: string) => ISupportedCurrency[];
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
  const [supportedCurrenciesForSwap, setSupportedCurrenciesForSwap] = useState<
    ISupportedCurrency[]
  >([]);
  const [defaultTokens, setDefaultTokens] = useState<ISupportedCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [lastFetchedWallet, setLastFetchedWallet] = useState<Date | null>(null);

  const refreshSupportedCurrenciesForSwap = async () => {
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
      setSupportedCurrenciesForSwap(currencies);
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
  ): ISupportedCurrency | undefined => {
    return supportedCurrenciesForSwap.find((currency) => currency._id === id);
  };

  const getSupportedCurrencyBySymbol = (
    symbol: string
  ): ISupportedCurrency | undefined => {
    return supportedCurrenciesForSwap.find(
      (currency) => currency.symbol?.toLowerCase() === symbol.toLowerCase()
    );
  };

  const getSupportedCurrenciesByChain = (
    chainId: string
  ): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (currency) => (currency.chainId as Partial<IChain>)?._id === chainId
    );
  };

  const getSupportedCurrenciesByChainSymbol = (
    chainSymbol: string
  ): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (currency) =>
        (currency.chainId as Partial<IChain>)?.symbol?.toLowerCase() ===
        chainSymbol.toLowerCase()
    );
  };

  const getStableCurrenciesForSwap = (): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (currency) => (currency.currencyId as unknown as ICurrency)?.isStable
    );
  };

  const getNonStableCurrenciesForSwap = (): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (currency) => !(currency.currencyId as unknown as ICurrency)?.isStable
    );
  };

  const searchSupportedCurrenciesForSwap = (query: string): ISupportedCurrency[] => {
    if (!query.trim()) return supportedCurrenciesForSwap;

    const searchTerm = query.toLowerCase();
    return supportedCurrenciesForSwap.filter(
      (currency) =>
        currency.name?.toLowerCase().includes(searchTerm) ||
        currency.symbol?.toLowerCase().includes(searchTerm) ||
        (currency.currencyId as Partial<ICurrency>)?.code
          ?.toLowerCase()
          .includes(searchTerm)
    );
  };

  const contextValue: SupportedCurrenciesContextType = {
    // State
    supportedCurrenciesForSwap,
    defaultTokens,
    lastFetchedWallet,
    isLoading,
    error,
    lastFetched,

    // Actions
    refreshSupportedCurrenciesForSwap,
    refreshDefaultTokens,
    getSupportedCurrencyById,
    getSupportedCurrencyBySymbol,
    getSupportedCurrenciesByChain,
    getSupportedCurrenciesByChainSymbol,
    getStableCurrenciesForSwap,
    getNonStableCurrenciesForSwap,
    searchSupportedCurrenciesForSwap,
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

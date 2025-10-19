/**
 * Supported Currencies Context - Currency Data Management
 *
 * Provides centralized supported currencies state management and caching
 * for all supported currencies throughout the app.
 */

import React, { createContext, ReactNode, useContext, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";

export interface SupportedCurrency {
  _id: string;
  name: string;
  symbol: string;
  logo: string;
  code: string;
  decimals: number;
  isStable: boolean;
  image?: string;
  tokenAddress?: string;
  chainId: {
    _id: string;
    name: string;
    symbol: string;
    chainId: number;
    isEVM: boolean;
  };
  currencyId: {
    _id: string;
    name: string;
    symbol: string;
    logo: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SupportedCurrenciesContextType {
  // State
  supportedCurrencies: SupportedCurrency[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  refreshSupportedCurrencies: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

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
        () => sdk.supportedCurrencies.listAll(),
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

  const getSupportedCurrencyById = (
    id: string
  ): SupportedCurrency | undefined => {
    return supportedCurrencies.find((currency) => currency._id === id);
  };

  const getSupportedCurrencyBySymbol = (
    symbol: string
  ): SupportedCurrency | undefined => {
    return supportedCurrencies.find(
      (currency) => currency.symbol.toLowerCase() === symbol.toLowerCase()
    );
  };

  const getSupportedCurrenciesByChain = (
    chainId: string
  ): SupportedCurrency[] => {
    return supportedCurrencies.filter(
      (currency) => currency.chainId._id === chainId
    );
  };

  const getSupportedCurrenciesByChainSymbol = (
    chainSymbol: string
  ): SupportedCurrency[] => {
    return supportedCurrencies.filter(
      (currency) =>
        currency.chainId.symbol.toLowerCase() === chainSymbol.toLowerCase()
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
        currency.name.toLowerCase().includes(searchTerm) ||
        currency.symbol.toLowerCase().includes(searchTerm) ||
        currency.code.toLowerCase().includes(searchTerm)
    );
  };

  const contextValue: SupportedCurrenciesContextType = {
    // State
    supportedCurrencies,
    isLoading,
    error,
    lastFetched,

    // Actions
    refreshSupportedCurrencies,
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

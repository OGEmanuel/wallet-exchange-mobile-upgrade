/**
 * Supported Currencies Context - Currency Data Management
 *
 * Provides centralized supported currencies state management and caching
 * for all supported currencies throughout the app.
 */

import { IChain, ICurrency, ISupportedCurrency } from "@zap/blockchain-sdk";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";
import { StorageKeys } from "../storage/storage-types";

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
  setDefaultTokens: (tokens: ISupportedCurrency[]) => void;
  setSupportedCurrenciesForSwap: (currencies: ISupportedCurrency[]) => void;
  defaultTokensMap: Map<string, ISupportedCurrency>;
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
  const [defaultTokensMap, setDefaultTokensMap] = useState<
    Map<string, ISupportedCurrency>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [lastFetchedWallet, setLastFetchedWallet] = useState<Date | null>(null);

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Load supported currencies for swap from cache
  const loadSupportedCurrenciesFromCache = async (): Promise<
    ISupportedCurrency[] | null
  > => {
    try {
      const cachedData = await SecureStore.getItemAsync(
        StorageKeys.SUPPORTED_CURRENCIES_FOR_SWAP
      );
      if (!cachedData) return null;

      const timestamp = await SecureStore.getItemAsync(
        StorageKeys.SUPPORTED_CURRENCIES_FOR_SWAP_TIMESTAMP
      );
      if (!timestamp) return null;

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      if (now - cacheTime > CACHE_DURATION) {
        console.log("⚠️ Supported currencies for swap cache expired");
        return null;
      }

      const parsedData = JSON.parse(cachedData);
      console.log(
        "✅ Loaded supported currencies for swap from cache:",
        parsedData.length
      );
      return parsedData;
    } catch (error) {
      console.error(
        "Error loading supported currencies for swap from cache:",
        error
      );
      return null;
    }
  };

  // Save supported currencies for swap to cache
  const saveSupportedCurrenciesToCache = async (
    currencies: ISupportedCurrency[]
  ): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        StorageKeys.SUPPORTED_CURRENCIES_FOR_SWAP,
        JSON.stringify(currencies)
      );
      await SecureStore.setItemAsync(
        StorageKeys.SUPPORTED_CURRENCIES_FOR_SWAP_TIMESTAMP,
        Date.now().toString()
      );
      console.log("✅ Saved supported currencies for swap to cache");
    } catch (error) {
      console.error(
        "Error saving supported currencies for swap to cache:",
        error
      );
    }
  };

  // Load default tokens from cache
  const loadDefaultTokensFromCache = async (): Promise<
    ISupportedCurrency[] | null
  > => {
    try {
      const cachedData = await SecureStore.getItemAsync(
        StorageKeys.DEFAULT_TOKENS
      );
      if (!cachedData) return null;

      const timestamp = await SecureStore.getItemAsync(
        StorageKeys.DEFAULT_TOKENS_TIMESTAMP
      );
      if (!timestamp) return null;

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      if (now - cacheTime > CACHE_DURATION) {
        console.log("⚠️ Default tokens cache expired");
        return null;
      }

      const parsedData = JSON.parse(cachedData);
      console.log("✅ Loaded default tokens from cache:", parsedData.length);
      return parsedData;
    } catch (error) {
      console.error("Error loading default tokens from cache:", error);
      return null;
    }
  };

  // Save default tokens to cache
  const saveDefaultTokensToCache = async (
    tokens: ISupportedCurrency[]
  ): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        StorageKeys.DEFAULT_TOKENS,
        JSON.stringify(tokens)
      );
      await SecureStore.setItemAsync(
        StorageKeys.DEFAULT_TOKENS_TIMESTAMP,
        Date.now().toString()
      );
      console.log("✅ Saved default tokens to cache");
    } catch (error) {
      console.error("Error saving default tokens to cache:", error);
    }
  };

  // Load from cache on mount
  useEffect(() => {
    const loadFromCache = async () => {
      // Load supported currencies for swap
      const cachedSupportedCurrencies =
        await loadSupportedCurrenciesFromCache();
      if (cachedSupportedCurrencies && cachedSupportedCurrencies.length > 0) {
        setSupportedCurrenciesForSwap(cachedSupportedCurrencies);
        setLastFetched(new Date());
        console.log(
          "✅ Supported currencies for swap loaded from cache on mount"
        );
        // Refresh in background (non-blocking) - don't wait for SDK
        setTimeout(() => {
          refreshSupportedCurrenciesForSwap().catch((err) => {
            console.warn(
              "Background supported currencies refresh failed:",
              err
            );
          });
        }, 100);
      }

      // Load default tokens
      const cachedDefaultTokens = await loadDefaultTokensFromCache();
      if (cachedDefaultTokens && cachedDefaultTokens.length > 0) {
        setDefaultTokens(cachedDefaultTokens);
        setDefaultTokensMap(
          new Map(
            cachedDefaultTokens.map((currency: ISupportedCurrency) => [
              currency._id,
              currency,
            ])
          )
        );
        setLastFetchedWallet(new Date());
        console.log("✅ Default tokens loaded from cache on mount");
        // Refresh in background (non-blocking) - don't wait for SDK
        setTimeout(() => {
          refreshDefaultTokens().catch((err) => {
            console.warn("Background default tokens refresh failed:", err);
          });
        }, 100);
      }
    };
    loadFromCache();
  }, []);

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

      // Save to cache after fetching
      await saveSupportedCurrenciesToCache(currencies);

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
      setDefaultTokensMap(
        new Map(
          supportedCurrencies.map((currency: ISupportedCurrency) => [
            currency._id,
            currency,
          ])
        )
      );

      // Save to cache after fetching
      await saveDefaultTokensToCache(supportedCurrencies);

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
    return supportedCurrenciesForSwap.find(
      (supportedCurrency) => supportedCurrency._id === id
    );
  };

  const getSupportedCurrencyBySymbol = (
    symbol: string
  ): ISupportedCurrency | undefined => {
    return supportedCurrenciesForSwap.find(
      (supportedCurrency) =>
        (supportedCurrency.currencyId as ICurrency)?.symbol?.toLowerCase() ===
        symbol.toLowerCase()
    );
  };

  const getSupportedCurrenciesByChain = (
    chainId: string
  ): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (supportedCurrency) =>
        (supportedCurrency.chainId as Partial<IChain>)?._id === chainId
    );
  };

  const getSupportedCurrenciesByChainSymbol = (
    chainSymbol: string
  ): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (supportedCurrency) =>
        (
          supportedCurrency.chainId as Partial<IChain>
        )?.symbol?.toLowerCase() === chainSymbol.toLowerCase()
    );
  };

  const getStableCurrenciesForSwap = (): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (supportedCurrency) =>
        (supportedCurrency.currencyId as ICurrency)?.isStable
    );
  };

  const getNonStableCurrenciesForSwap = (): ISupportedCurrency[] => {
    return supportedCurrenciesForSwap.filter(
      (supportedCurrency) =>
        !(supportedCurrency.currencyId as ICurrency)?.isStable
    );
  };

  const searchSupportedCurrenciesForSwap = (
    query: string
  ): ISupportedCurrency[] => {
    if (!query.trim()) return supportedCurrenciesForSwap;

    const searchTerm = query.toLowerCase();
    return supportedCurrenciesForSwap.filter(
      (supportedCurrency) =>
        (supportedCurrency.currencyId as ICurrency)?.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        (supportedCurrency.currencyId as ICurrency)?.symbol
          ?.toLowerCase()
          .includes(searchTerm) ||
        (supportedCurrency.currencyId as ICurrency)?.code
          ?.toLowerCase()
          .includes(searchTerm)
    );
  };

  const contextValue: SupportedCurrenciesContextType = {
    // State
    supportedCurrenciesForSwap,
    defaultTokens,
    setDefaultTokens,
    setSupportedCurrenciesForSwap,
    defaultTokensMap,
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

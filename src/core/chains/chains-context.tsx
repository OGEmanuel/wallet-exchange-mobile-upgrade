/**
 * Chains Context - IChain Data Management
 *
 * Provides centralized chain state management and caching
 * for wallet chains throughout the app.
 */

import { IChain, ICurrency } from "@zap/blockchain-sdk";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";
import { StorageKeys } from "../storage/storage-types";
import { useSupportedCurrencies } from "../supported-currencies/supported-currencies-context";

interface ChainsContextType {
  // State
  chains: IChain[];
  walletChains: IChain[];
  chainsMap: Map<string, IChain>;
  setWalletChains: (chains: IChain[]) => void;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  refreshChains: () => Promise<void>;
  loadChainsNow: () => void;
  getChainBySymbol: (symbol: string) => IChain | undefined;
  getChainById: (id: string) => IChain | undefined;
  getEVMChains: () => IChain[];
  getNonEVMChains: () => IChain[];
  getNumericChainId: (chainIdString: string) => number | null;
  getChainImage: (chainId: string) => string;
}

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

interface ChainsProviderProps {
  children: ReactNode;
}

export const ChainsProvider: React.FC<ChainsProviderProps> = ({ children }) => {
  const [chains, setChains] = useState<IChain[]>([]);
  const { getSupportedCurrencyBySymbol } = useSupportedCurrencies();
  const [walletChains, setWalletChains] = useState<IChain[]>([]);
  const [chainsMap, setChainsMap] = useState<Map<string, IChain>>(new Map());
  React.useEffect(() => {
    setChainsMap(
      new Map(walletChains.map((chain) => [chain._id || "", chain]))
    );
  }, [walletChains]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Load wallet chains from cache
  const loadWalletChainsFromCache = async (): Promise<IChain[] | null> => {
    try {
      const cachedData = await SecureStore.getItemAsync(StorageKeys.WALLET_CHAINS);
      if (!cachedData) return null;

      const timestamp = await SecureStore.getItemAsync(StorageKeys.WALLET_CHAINS_TIMESTAMP);
      if (!timestamp) return null;

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      if (now - cacheTime > CACHE_DURATION) {
        console.log("⚠️ Wallet chains cache expired");
        return null;
      }

      const parsedData = JSON.parse(cachedData);
      console.log("✅ Loaded wallet chains from cache:", parsedData.length);
      return parsedData;
    } catch (error) {
      console.error("Error loading wallet chains from cache:", error);
      return null;
    }
  };

  // Save wallet chains to cache
  const saveWalletChainsToCache = async (chains: IChain[]): Promise<void> => {
    try {
      await SecureStore.setItemAsync(StorageKeys.WALLET_CHAINS, JSON.stringify(chains));
      await SecureStore.setItemAsync(StorageKeys.WALLET_CHAINS_TIMESTAMP, Date.now().toString());
      console.log("✅ Saved wallet chains to cache");
    } catch (error) {
      console.error("Error saving wallet chains to cache:", error);
    }
  };

  // Load from cache on mount
  useEffect(() => {
    const loadFromCache = async () => {
      const cachedChains = await loadWalletChainsFromCache();
      if (cachedChains && cachedChains.length > 0) {
        setWalletChains(cachedChains);
        setChains(cachedChains);
        setLastFetched(new Date());
        console.log("✅ Wallet chains loaded from cache on mount");
        // Refresh in background (non-blocking) - don't wait for SDK
        setTimeout(() => {
          refreshChains().catch(err => {
            console.warn("Background wallet chains refresh failed:", err);
          });
        }, 0);
      }
    };
    loadFromCache();
  }, []);

  const getChainImage = (chainId: string): string => {
    const chain = chainsMap.get(chainId);
    const nativeCurrency = chain?.nativeCurrencyId as ICurrency;
    if (chain?.isEVM && nativeCurrency?.symbol !== chain?.symbol) {
      if (chain?.symbol?.toUpperCase() === "BASE") {
        return "https://res.cloudinary.com/dbkwvangu/image/upload/v1762418105/currencies/logos/base.svg";
      }
      const currency = getSupportedCurrencyBySymbol(chain?.symbol);

      if ((currency?.currencyId as ICurrency)?.logo) {
        return (currency?.currencyId as ICurrency)?.logo || "";
      }
    }
    return nativeCurrency?.logo || "";
  };

  const refreshChains = async () => {
    console.log("🔄 [CHAINS] refreshChains called");
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is wallet authenticated before fetching chains
      const walletUserId = await zapSDKService.getCurrentUserId();
      console.log("🔍 [CHAINS] Checking authentication", {
        walletUserId,
        hasUserId: !!walletUserId,
      });
      
      if (!walletUserId) {
        console.warn("⚠️ [CHAINS] User not authenticated, skipping wallet chains fetch");
        setIsLoading(false);
        return;
      }

      console.log("✅ [CHAINS] User authenticated, fetching wallet chains...");
      // Fetch wallet chains (chains that support wallet operations)
      const walletChainsData = await zapSDKService.getWalletChains();
      console.log("✅ [CHAINS] Wallet chains fetched", {
        count: walletChainsData?.length || 0,
      });

      if (!walletChainsData || walletChainsData.length === 0) {
        console.warn("⚠️ [CHAINS] No wallet chains returned from API");
      }

      setWalletChains(walletChainsData);
      setChains(walletChainsData); // For now, we only need wallet chains

      // Save to cache after fetching
      await saveWalletChainsToCache(walletChainsData);
      console.log("✅ [CHAINS] Wallet chains saved to cache");

      setLastFetched(new Date());
      console.log("✅ [CHAINS] Chains loaded successfully:", walletChainsData.length);
    } catch (err: any) {
      // Handle authentication errors gracefully
      const errorMessage = err?.message || "";
      const errorStatus = err?.status || err?.code;
      
      const isAuthError =
        errorMessage.includes("No authentication token") ||
        errorMessage.includes("No refresh token") ||
        errorMessage.includes("Refresh token is invalid") ||
        errorMessage.includes("re-authenticate") ||
        errorMessage.includes("Invalid authentication token") ||
        errorMessage.includes("Token refresh failed") ||
        errorMessage.includes("Session not found") ||
        errorStatus === 401 ||
        errorStatus === 500; // Session not found returns 500

      if (isAuthError) {
        console.warn("⚠️ [CHAINS] Authentication required to load wallet chains", {
          error: err?.message,
          status: errorStatus,
          code: err?.code,
        });
        // Don't set error for auth issues - user just needs to log in or token needs refresh
        // The chains will be loaded automatically once authentication is established
        setError(null);
        
        // If it's a session not found error, we might want to retry after a delay
        // when authentication is re-established
        if (errorMessage.includes("Session not found") || errorStatus === 500) {
          console.log("🔄 [CHAINS] Session not found - chains will be loaded after re-authentication");
        }
      } else {
        console.error("❌ [CHAINS] Failed to load chains:", {
          error: err,
          message: err?.message,
          status: errorStatus,
          code: err?.code,
        });
        setError(err instanceof Error ? err.message : "Failed to load chains");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load chains immediately (for when user is authenticated)
  const loadChainsNow = () => {
    console.log("🚀 [CHAINS] loadChainsNow called");
    refreshChains();
  };

  const getChainBySymbol = (symbol: string): IChain | undefined => {
    return walletChains.find((chain) => chain.symbol === symbol);
  };

  const getChainById = (id: string): IChain | undefined => {
    return walletChains.find((chain) => chain._id === id);
  };

  const getEVMChains = (): IChain[] => {
    return walletChains.filter((chain) => chain.isEVM);
  };

  const getNonEVMChains = (): IChain[] => {
    return walletChains.filter((chain) => !chain.isEVM);
  };

  const getNumericChainId = (chainIdString: string): number | null => {
    // First try to find by chain ID (if it's already a numeric string)
    const numericChainId = parseInt(chainIdString, 10);
    if (!isNaN(numericChainId)) {
      return numericChainId;
    }

    // Try to find by chain symbol
    const chainBySymbol = getChainBySymbol(chainIdString);
    if (chainBySymbol) {
      return chainBySymbol.chainId || null;
    }

    // Try to find by chain ID (if it's a MongoDB ObjectId)
    const chainById = getChainById(chainIdString);
    if (chainById) {
      return chainById.chainId || null;
    }

    console.warn(`Could not find chain for: ${chainIdString}`);
    return null;
  };

  const contextValue: ChainsContextType = {
    chains,
    walletChains,
    setWalletChains,
    chainsMap,
    isLoading,
    error,
    lastFetched,
    refreshChains,
    loadChainsNow,
    getChainBySymbol,
    getChainById,
    getEVMChains,
    getNonEVMChains,
    getNumericChainId,
    getChainImage,
  };

  return (
    <ChainsContext.Provider value={contextValue}>
      {children}
    </ChainsContext.Provider>
  );
};

export const useChains = (): ChainsContextType => {
  const context = useContext(ChainsContext);
  if (context === undefined) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return context;
};

export default ChainsProvider;

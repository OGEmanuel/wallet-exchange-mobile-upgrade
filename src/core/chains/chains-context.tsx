/**
 * Chains Context - IChain Data Management
 *
 * Provides centralized chain state management and caching
 * for wallet chains throughout the app.
 */

import { IChain } from "@zap/blockchain-sdk";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";

interface ChainsContextType {
  // State
  chains: IChain[];
  walletChains: IChain[];
  chainsMap: Map<string, IChain>;
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
}

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

interface ChainsProviderProps {
  children: ReactNode;
}

export const ChainsProvider: React.FC<ChainsProviderProps> = ({ children }) => {
  const [chains, setChains] = useState<IChain[]>([]);
  const [walletChains, setWalletChains] = useState<IChain[]>([]);
  const [chainsMap, setChainsMap] = useState<Map<string, IChain>>(new Map());
  React.useEffect(() => {
    setChainsMap(
      new Map(walletChains.map((chain) => [chain._id || "", chain]))
    );
  }, [chains]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refreshChains = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch wallet chains (chains that support wallet operations)
      const walletChainsData = await zapSDKService.getWalletChains();

      setWalletChains(walletChainsData);
      setChains(walletChainsData); // For now, we only need wallet chains

      setLastFetched(new Date());
      console.log("✅ Chains loaded successfully:", walletChainsData.length);
    } catch (err) {
      console.error("❌ Failed to load chains:", err);
      setError(err instanceof Error ? err.message : "Failed to load chains");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load chains immediately (for when user is authenticated)
  const loadChainsNow = () => {
    refreshChains();
  };

  const getChainBySymbol = (symbol: string): IChain | undefined => {
    return walletChains.find((chain) => chain.symbol === symbol);
  };

  const getChainById = (id: string): IChain | undefined => {
    return walletChains.find((chain) => chain._id === id);
  };

  const getEVMChains = (): IChain[] => {
    return walletChains.filter((chain) => (chain as any).isEVM);
  };

  const getNonEVMChains = (): IChain[] => {
    return walletChains.filter((chain) => !(chain as any).isEVM);
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

/**
 * Chains Context - Chain Data Management
 *
 * Provides centralized chain state management and caching
 * for wallet chains throughout the app.
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { default as zapSDKService } from "../sdk/zap-sdk.service";

export interface Chain {
  _id: string;
  name: string;
  symbol: string;
  chainId: number;
  isEVM: boolean;
  isWalletActive: boolean;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrencySymbol: string;
  nativeCurrencyId: {
    _id: string;
    name: string;
    symbol: string;
    logo: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ChainsContextType {
  // State
  chains: Chain[];
  walletChains: Chain[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  refreshChains: () => Promise<void>;
  getChainBySymbol: (symbol: string) => Chain | undefined;
  getChainById: (id: string) => Chain | undefined;
  getEVMChains: () => Chain[];
  getNonEVMChains: () => Chain[];
}

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

interface ChainsProviderProps {
  children: ReactNode;
}

export const ChainsProvider: React.FC<ChainsProviderProps> = ({ children }) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [walletChains, setWalletChains] = useState<Chain[]>([]);
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
      console.log('✅ Chains loaded successfully:', walletChainsData.length);
    } catch (err) {
      console.error('❌ Failed to load chains:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chains');
    } finally {
      setIsLoading(false);
    }
  };

  const getChainBySymbol = (symbol: string): Chain | undefined => {
    return walletChains.find(chain => chain.symbol === symbol);
  };

  const getChainById = (id: string): Chain | undefined => {
    return walletChains.find(chain => chain._id === id);
  };

  const getEVMChains = (): Chain[] => {
    return walletChains.filter(chain => chain.isEVM);
  };

  const getNonEVMChains = (): Chain[] => {
    return walletChains.filter(chain => !chain.isEVM);
  };

  // Load chains on mount
  useEffect(() => {
    refreshChains();
  }, []);

  const contextValue: ChainsContextType = {
    chains,
    walletChains,
    isLoading,
    error,
    lastFetched,
    refreshChains,
    getChainBySymbol,
    getChainById,
    getEVMChains,
    getNonEVMChains,
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
    throw new Error('useChains must be used within a ChainsProvider');
  }
  return context;
};

export default ChainsProvider;

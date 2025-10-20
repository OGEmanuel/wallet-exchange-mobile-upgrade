/**
 * Aggregated Balances Hook
 * 
 * This hook provides cached aggregated balances for wallets and wallet groups.
 * Solves the issue where backend gives individual account balances but not
 * aggregated wallet/wallet group totals.
 */

import { PortfolioService } from "@/services/portfolio.service";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { useWallet } from "@/src/core/wallet/wallet-context";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useAggregatedBalances = () => {
  const { portfolio, userWalletGroups, mainUserWalletGroup, isWalletAuthenticated } = useWallet();
  const processedPortfolio = useSelector((state: any) => state.portfolio.processedPortfolio);
  const [aggregatedBalances, setAggregatedBalances] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized balance storage by user wallet group ID
  const [balanceCache, setBalanceCache] = useState<Map<string, any>>(new Map());

  // Portfolio cache functions (same as wallet context)
  const loadPortfolioFromCache = async (userWalletGroupId: string): Promise<any | null> => {
    try {
      const cacheKey = `${StorageKeys.PORTFOLIO_DATA}_${userWalletGroupId}`;
      const cachedData = await SecureStore.getItemAsync(cacheKey);
      if (!cachedData) return null;

      const parsedData = JSON.parse(cachedData);
      return parsedData;
    } catch (error) {
      console.error("Error loading portfolio from cache:", error);
      return null;
    }
  };

  // Function to trigger portfolio fetch for a specific wallet group
  const fetchPortfolioForWalletGroup = async (userWalletGroupId: string): Promise<void> => {
    try {
      // This would need to be implemented in the wallet context
      // For now, we'll just log that we need to fetch it
    } catch (error) {
      console.error(`Error fetching portfolio for ${userWalletGroupId}:`, error);
    }
  };

  // Check if aggregated balances cache is valid for the current main wallet group
  const isCacheValid = async (): Promise<boolean> => {
    try {
      if (!mainUserWalletGroup?._id) return false;
      
      const timestamp = await SecureStore.getItemAsync(`${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`);
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      return (now - cacheTime) < CACHE_DURATION;
    } catch (error) {
      console.error("Error checking aggregated balances cache validity:", error);
      return false;
    }
  };

  // Load aggregated balances from cache for the current main wallet group
  const loadFromCache = async (): Promise<any | null> => {
    try {
      if (!mainUserWalletGroup?._id) return null;
      
      const cachedData = await SecureStore.getItemAsync(`${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData);
      return parsedData;
    } catch (error) {
      console.error("Error loading aggregated balances from cache:", error);
      return null;
    }
  };

  // Save aggregated balances to cache for the current main wallet group
  const saveToCache = async (data: any): Promise<void> => {
    try {
      if (!mainUserWalletGroup?._id) return;
      
      await SecureStore.setItemAsync(`${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`, JSON.stringify(data));
      await SecureStore.setItemAsync(`${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`, Date.now().toString());
      console.log("💾 Aggregated balances cached successfully for wallet group:", mainUserWalletGroup._id);
    } catch (error) {
      console.error("Error saving aggregated balances to cache:", error);
    }
  };

  // Clear aggregated balances cache for the current main wallet group
  const clearCache = async (): Promise<void> => {
    try {
      if (!mainUserWalletGroup?._id) return;
      
      await SecureStore.deleteItemAsync(`${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`);
      await SecureStore.deleteItemAsync(`${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`);
      console.log("🗑️ Aggregated balances cache cleared for wallet group:", mainUserWalletGroup._id);
    } catch (error) {
      console.error("Error clearing aggregated balances cache:", error);
    }
  };

  // Calculate balances for ALL user wallet groups using the main portfolio data
  const calculateAllBalances = async () => {
    if (!portfolio || !userWalletGroups || !isWalletAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use the existing PortfolioService.calculateAggregatedBalances function
      // which works with the main portfolio data
      const { walletBalances, walletGroupBalances, totalPortfolioValue } = 
        PortfolioService.calculateAggregatedBalances(portfolio);

      const newBalanceCache = new Map<string, any>();

      // Process each user wallet group and get their balances
      for (const userWalletGroup of userWalletGroups) {
        const userWalletGroupId = userWalletGroup._id;
        const walletId = userWalletGroup.walletId?._id;
        const walletGroupId = userWalletGroup.walletGroupId?._id;
        const isMainWalletGroup = userWalletGroupId === mainUserWalletGroup?._id;

        let walletBalance = 0;
        let walletGroupBalance = 0;

        if (isMainWalletGroup) {
          // For the main wallet group, use the current portfolio data
          walletBalance = walletBalances.get(walletId) || 0;
          walletGroupBalance = walletGroupBalances.get(walletGroupId) || 0;
        } else {
          // For other wallet groups, try to get from cache
          try {
            // Load cached portfolio data using the same cache functions as wallet context
            const cachedPortfolio = await loadPortfolioFromCache(userWalletGroupId);
            
            if (cachedPortfolio?.mainWalletGroupPortfolio) {
              // Calculate balance from cached portfolio data
              const { walletBalances: cachedWalletBalances, walletGroupBalances: cachedWalletGroupBalances } = 
                PortfolioService.calculateAggregatedBalances(cachedPortfolio);
              
              walletBalance = cachedWalletBalances.get(walletId) || 0;
              walletGroupBalance = cachedWalletGroupBalances.get(walletGroupId) || 0;
            } else {
              // Trigger portfolio fetch for this wallet group
              await fetchPortfolioForWalletGroup(userWalletGroupId);
              walletBalance = 0;
              walletGroupBalance = 0;
            }
          } catch (error) {
            walletBalance = 0;
            walletGroupBalance = 0;
          }
        }

        // Store the balance data for this user wallet group
        const balanceData = {
          userWalletGroupId,
          walletId,
          walletGroupId,
          walletBalance,
          walletGroupBalance,
          totalPortfolioValue: walletBalance,
          timestamp: Date.now(),
        };

        newBalanceCache.set(userWalletGroupId, balanceData);
      }

      // Update the balance cache
      setBalanceCache(newBalanceCache);

      // Create enhanced wallet groups with their specific balances
      const enhancedWalletGroups = userWalletGroups.map(userWalletGroup => {
        const userWalletGroupId = userWalletGroup._id;
        const balanceData = newBalanceCache.get(userWalletGroupId);
        
        return {
          ...userWalletGroup,
          aggregatedBalance: balanceData?.walletBalance || 0,
          walletGroupAggregatedBalance: balanceData?.walletGroupBalance || 0,
        };
      });

      // Calculate total portfolio value from all wallet balances
      const calculatedTotalPortfolioValue = Array.from(newBalanceCache.values()).reduce((sum, balanceData) => sum + balanceData.walletBalance, 0);

      const result = {
        balanceCache: Object.fromEntries(newBalanceCache),
        enhancedWalletGroups,
        totalPortfolioValue: calculatedTotalPortfolioValue,
        timestamp: Date.now(),
      };

      setAggregatedBalances(result);

    } catch (err) {
      console.error("Failed to calculate all balances:", err);
      setError("Failed to calculate all balances");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate balances when portfolio or userWalletGroups changes
  useEffect(() => {
    if (portfolio && userWalletGroups) {
      calculateAllBalances();
    }
  }, [portfolio, userWalletGroups]);

  // CACHE DISABLED - Not clearing cache on logout
  // useEffect(() => {
  //   if (!isWalletAuthenticated) {
  //     clearCache();
  //     setAggregatedBalances(null);
  //   }
  // }, [isWalletAuthenticated]);

  // Comprehensive balance getter functions - THE SINGLE SOURCE OF TRUTH
  
  // Get balance for a specific account
  const getAccountBalance = (userWalletGroupId: string, accountId: string): number => {
    const balanceData = balanceCache.get(userWalletGroupId);
    return balanceData?.accountBalances?.[accountId] || 0;
  };

  // Get balance for a specific wallet (sum of all accounts in that wallet)
  const getWalletBalance = (userWalletGroupId: string): number => {
    const balanceData = balanceCache.get(userWalletGroupId);
    return balanceData?.walletBalance || 0;
  };

  // Get balance for a specific wallet group (sum of all wallets in that group)
  const getWalletGroupBalance = (userWalletGroupId: string): number => {
    const balanceData = balanceCache.get(userWalletGroupId);
    return balanceData?.walletGroupBalance || 0;
  };

  // Get total portfolio value across all user wallet groups
  const getTotalPortfolioValue = (): number => {
    return aggregatedBalances?.totalPortfolioValue || 0;
  };

  // Get enhanced wallet groups with their specific balances
  const getEnhancedWalletGroups = () => {
    return aggregatedBalances?.enhancedWalletGroups || [];
  };

  // Get balance data for a specific user wallet group
  const getUserWalletGroupBalanceData = (userWalletGroupId: string) => {
    return balanceCache.get(userWalletGroupId) || null;
  };

  // Get all account balances for a specific user wallet group
  const getAccountBalances = (userWalletGroupId: string) => {
    const balanceData = balanceCache.get(userWalletGroupId);
    return balanceData?.accountBalances || {};
  };

  // Get balance for the current main user wallet group
  const getCurrentWalletBalance = (): number => {
    if (!mainUserWalletGroup?._id) return 0;
    return getWalletBalance(mainUserWalletGroup._id);
  };

  // Get balance for the current main user wallet group's wallet group
  const getCurrentWalletGroupBalance = (): number => {
    if (!mainUserWalletGroup?._id) return 0;
    return getWalletGroupBalance(mainUserWalletGroup._id);
  };

  // Get balance for only ENABLED tokens in the current wallet
  const getCurrentWalletEnabledBalance = (): number => {
    // Use the processed portfolio data which has enabledAssets
    if (processedPortfolio?.enabledAssets) {
      console.log('🎯 Using processed portfolio enabledAssets:', processedPortfolio.enabledAssets.length);
      const enabledBalance = processedPortfolio.enabledAssets
        .reduce((total: number, asset: any) => total + (asset.totalUsdValue || 0), 0);
      console.log('💰 Enabled balance calculated:', enabledBalance);
      return enabledBalance;
    }
    
    // Fallback: use raw portfolio data if processed portfolio is not available
    console.log('🔄 Using fallback method - processed portfolio not available');
    if (!portfolio?.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts) return 0;
    
    const accounts = portfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts;
    const userTokenList = portfolio.userTokenList || [];
    
    console.log('📊 Raw data - accounts:', accounts.length, 'userTokenList:', userTokenList.length);
    
    // Create a map of enabled token IDs
    const enabledTokenIds = new Set(
      userTokenList
        .filter((token: any) => token.status === 'ENABLED')
        .map((token: any) => {
          const supportedCurrencyId = typeof token.supportedCurrencyId === 'string' 
            ? token.supportedCurrencyId 
            : token.supportedCurrencyId?._id;
          return supportedCurrencyId;
        })
    );
    
    console.log('✅ Enabled token IDs:', Array.from(enabledTokenIds));
    
    // Sum only accounts with enabled tokens
    const enabledAccounts = accounts.filter((account: any) => {
      const supportedCurrencyId = account.supportedCurrencyId?._id || account.supportedCurrencyId;
      return enabledTokenIds.has(supportedCurrencyId);
    });
    
    console.log('🎯 Enabled accounts:', enabledAccounts.length);
    
    const fallbackBalance = enabledAccounts
      .reduce((total: number, account: any) => total + (account.totalUsdValue || 0), 0);
    
    console.log('💰 Fallback enabled balance:', fallbackBalance);
    return fallbackBalance;
  };

  // Manual refresh function
  const refreshBalances = async () => {
    console.log("🔄 Manually refreshing all balances");
    setBalanceCache(new Map());
    setAggregatedBalances(null);
    await calculateAllBalances();
  };

  return {
    // State
    aggregatedBalances,
    balanceCache: Object.fromEntries(balanceCache),
    isLoading,
    error,
    
    // Balance getters - THE SINGLE SOURCE OF TRUTH
    getAccountBalance,
    getWalletBalance,
    getWalletGroupBalance,
    getTotalPortfolioValue,
    getEnhancedWalletGroups,
    getUserWalletGroupBalanceData,
    getAccountBalances,
    getCurrentWalletBalance,
    getCurrentWalletGroupBalance,
    getCurrentWalletEnabledBalance,
    
    // Actions
    refreshBalances,
    calculateAllBalances,
  };
};

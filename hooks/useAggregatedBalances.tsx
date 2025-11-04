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
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useAggregatedBalances = () => {
  const {
    portfolio,
    userWalletGroups,
    mainUserWalletGroup,
    isWalletAuthenticated,
  } = useWallet();
  const processedPortfolio = useSelector(
    (state: any) => state.portfolio.processedPortfolio
  );
  const [aggregatedBalances, setAggregatedBalances] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized balance storage by user wallet group ID
  const [balanceCache, setBalanceCache] = useState<Map<string, any>>(new Map());

  // Portfolio cache functions (same as wallet context)
  const loadPortfolioFromCache = async (
    userWalletGroupId: string
  ): Promise<any | null> => {
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
  const fetchPortfolioForWalletGroup = async (
    userWalletGroupId: string
  ): Promise<void> => {
    try {
      // This would need to be implemented in the wallet context
      // For now, we'll just log that we need to fetch it
    } catch (error) {
      console.error(
        `Error fetching portfolio for ${userWalletGroupId}:`,
        error
      );
    }
  };

  // Check if aggregated balances cache is valid for the current main wallet group
  const isCacheValid = async (): Promise<boolean> => {
    try {
      if (!mainUserWalletGroup?._id) return false;

      const timestamp = await SecureStore.getItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`
      );
      if (!timestamp) return false;

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      return now - cacheTime < CACHE_DURATION;
    } catch (error) {
      console.error(
        "Error checking aggregated balances cache validity:",
        error
      );
      return false;
    }
  };

  // Load aggregated balances from cache for the current main wallet group
  const loadFromCache = async (): Promise<any | null> => {
    try {
      if (!mainUserWalletGroup?._id) return null;

      const cachedData = await SecureStore.getItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`
      );
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

      await SecureStore.setItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`,
        JSON.stringify(data)
      );
      await SecureStore.setItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`,
        Date.now().toString()
      );
      console.log(
        "💾 Aggregated balances cached successfully for wallet group:",
        mainUserWalletGroup._id
      );
    } catch (error) {
      console.error("Error saving aggregated balances to cache:", error);
    }
  };

  // Clear aggregated balances cache for the current main wallet group
  const clearCache = async (): Promise<void> => {
    try {
      if (!mainUserWalletGroup?._id) return;

      await SecureStore.deleteItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${mainUserWalletGroup._id}`
      );
      await SecureStore.deleteItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${mainUserWalletGroup._id}`
      );
      console.log(
        "🗑️ Aggregated balances cache cleared for wallet group:",
        mainUserWalletGroup._id
      );
    } catch (error) {
      console.error("Error clearing aggregated balances cache:", error);
    }
  };

  // Calculate balances for ALL user wallet groups using the main portfolio data
  // If current portfolio is null, will load from cache for all wallets
  const calculateAllBalances = async () => {
    if (!userWalletGroups || !isWalletAuthenticated) {
      return;
    }
    
    // If portfolio is null, we'll still calculate balances for other wallets from cache
    // This prevents balances going to 0 during wallet switching

    try {
      setIsLoading(true);
      setError(null);

      // Use the existing PortfolioService.calculateAggregatedBalances function
      // which works with the main portfolio data (if available)
      let walletBalances = new Map<string, number>();
      let walletGroupBalances = new Map<string, number>();
      let totalPortfolioValue = 0;
      
      if (portfolio) {
        const calculated = PortfolioService.calculateAggregatedBalances(portfolio);
        walletBalances = calculated.walletBalances;
        walletGroupBalances = calculated.walletGroupBalances;
        totalPortfolioValue = calculated.totalPortfolioValue;
      }

      // CRITICAL: Initialize with existing balanceCache to preserve balances during wallet switching
      // This ensures balances don't go to 0 when switching wallets
      const newBalanceCache = new Map<string, any>(balanceCache);
      console.log(`📊 calculateAllBalances: Starting with ${balanceCache.size} wallets in balanceCache`);
      if (balanceCache.size > 0) {
        Array.from(balanceCache.entries()).forEach(([id, data]) => {
          console.log(`  - Wallet ${id}: $${data?.walletBalance || 0}`);
        });
      }

      // Process each user wallet group and get their balances
      for (const userWalletGroup of userWalletGroups) {
        const userWalletGroupId = userWalletGroup._id;
        const walletId = userWalletGroup.walletId?._id;
        const walletGroupId = userWalletGroup.walletGroupId?._id;
        const isMainWalletGroup =
          userWalletGroupId === mainUserWalletGroup?._id;

        // Check if we already have a balance for this wallet in the preserved cache
        const existingBalanceData = newBalanceCache.get(userWalletGroupId);
        
        let walletBalance = 0;
        let walletGroupBalance = 0;

        if (isMainWalletGroup && portfolio) {
          // For the main wallet group, always recalculate from current portfolio data
          walletBalance = walletBalances.get(walletId) || 0;
          walletGroupBalance = walletGroupBalances.get(walletGroupId) || 0;
        } else if (existingBalanceData && existingBalanceData.walletBalance > 0) {
          // If we already have a valid balance in cache, preserve it (only for non-main wallets)
          // This prevents balances from going to 0 during wallet switching
          walletBalance = existingBalanceData.walletBalance || 0;
          walletGroupBalance = existingBalanceData.walletGroupBalance || 0;
          console.log(`💰 Preserving cached balance for wallet ${userWalletGroupId}: $${walletBalance}`);
        } else {
          // For other wallet groups OR if no cached balance, try to load from portfolio cache
          try {
            // Load cached portfolio data using the same cache functions as wallet context
            const cachedPortfolio = await loadPortfolioFromCache(
              userWalletGroupId
            );

            if (cachedPortfolio?.mainWalletGroupPortfolio) {
              // Calculate balance from cached portfolio data
              const {
                walletBalances: cachedWalletBalances,
                walletGroupBalances: cachedWalletGroupBalances,
              } = PortfolioService.calculateAggregatedBalances(cachedPortfolio);

              walletBalance = cachedWalletBalances.get(walletId) || 0;
              walletGroupBalance =
                cachedWalletGroupBalances.get(walletGroupId) || 0;
              console.log(`📦 Loaded balance from portfolio cache for wallet ${userWalletGroupId}: $${walletBalance}`);
            } else {
              // No cache available, keep existing balance if it exists, otherwise 0
              walletBalance = existingBalanceData?.walletBalance || 0;
              walletGroupBalance = existingBalanceData?.walletGroupBalance || 0;
            }
          } catch (err) {
            // On error, preserve existing balance if it exists
            walletBalance = existingBalanceData?.walletBalance || 0;
            walletGroupBalance = existingBalanceData?.walletGroupBalance || 0;
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
      console.log(`✅ calculateAllBalances: Updated balanceCache with ${newBalanceCache.size} wallets`);
      Array.from(newBalanceCache.entries()).forEach(([id, data]) => {
        console.log(`  - Wallet ${id}: $${data?.walletBalance || 0}`);
      });

      // Create enhanced wallet groups with their specific balances
      const enhancedWalletGroups = userWalletGroups.map((userWalletGroup) => {
        const userWalletGroupId = userWalletGroup._id;
        const balanceData = newBalanceCache.get(userWalletGroupId);

        return {
          ...userWalletGroup,
          aggregatedBalance: balanceData?.walletBalance || 0,
          walletGroupAggregatedBalance: balanceData?.walletGroupBalance || 0,
        };
      });
      
      console.log(`📋 calculateAllBalances: Created ${enhancedWalletGroups.length} enhanced wallet groups`);

      // Calculate total portfolio value from all wallet balances
      const calculatedTotalPortfolioValue = Array.from(
        newBalanceCache.values()
      ).reduce((sum, balanceData) => sum + balanceData.walletBalance, 0);

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

  // Clear balance cache when main wallet group changes
  // Use a ref to track the previous wallet ID to detect actual changes
  const prevWalletIdRef = React.useRef<string | undefined>(mainUserWalletGroup?._id);
  
  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    const prevWalletId = prevWalletIdRef.current;
    
    // Only clear if wallet actually changed (not just on mount)
    if (currentWalletId && prevWalletId && currentWalletId !== prevWalletId) {
      console.log(`🔄 Wallet changed from ${prevWalletId} to ${currentWalletId} - preserving other wallet balances`);
      
      // DON'T clear the entire balance cache - preserve balances for other wallets
      // Only clear the balance for the wallet being switched FROM
      // This ensures other wallets retain their balances in the wallet selector
      setBalanceCache((prevCache) => {
        const newCache = new Map(prevCache);
        // Remove only the previous wallet's balance
        if (prevWalletId) {
          newCache.delete(prevWalletId);
        }
        return newCache;
      });
      
      // Recalculate balances for all wallets (will load from cache for non-current wallets)
      // Don't set balances to 0 - preserve existing balances and recalculate
      if (userWalletGroups && userWalletGroups.length > 0) {
        // Trigger recalculation which will preserve cached balances for other wallets
        calculateAllBalances();
      }
    }
    
    // Update ref to current wallet ID
    prevWalletIdRef.current = currentWalletId;
  }, [mainUserWalletGroup?._id, userWalletGroups]);

  // Calculate balances when portfolio or userWalletGroups changes
  // Calculate for all wallets even if current portfolio is null (uses cache for non-current wallets)
  useEffect(() => {
    if (userWalletGroups && userWalletGroups.length > 0 && isWalletAuthenticated) {
      // Always recalculate - it will use current portfolio if available, otherwise use cache
      calculateAllBalances();
    }
    // Don't clear aggregatedBalances when portfolio becomes null during wallet switching
    // This prevents the wallet list from disappearing temporarily and balances going to 0
  }, [portfolio, userWalletGroups, isWalletAuthenticated]);

  // Get balance for a specific account
  const getAccountBalance = (
    userWalletGroupId: string,
    accountId: string
  ): number => {
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
  // Always return something - either from aggregatedBalances or create from userWalletGroups
  const getEnhancedWalletGroups = () => {
    // If we have aggregated balances with enhanced groups, use them
    if (aggregatedBalances?.enhancedWalletGroups && aggregatedBalances.enhancedWalletGroups.length > 0) {
      console.log(`📱 getEnhancedWalletGroups: Returning ${aggregatedBalances.enhancedWalletGroups.length} wallets from aggregatedBalances`);
      aggregatedBalances.enhancedWalletGroups.forEach((wg: any) => {
        console.log(`  - ${wg.name || wg._id}: $${wg.aggregatedBalance || 0}`);
      });
      return aggregatedBalances.enhancedWalletGroups;
    }
    
    // Otherwise, create a basic structure from userWalletGroups to ensure wallets are always visible
    if (userWalletGroups && userWalletGroups.length > 0) {
      console.log(`⚠️ getEnhancedWalletGroups: aggregatedBalances empty, creating basic structure with ${userWalletGroups.length} wallets (all $0)`);
      return userWalletGroups.map((group: any) => ({
        ...group,
        aggregatedBalance: 0, // Will be calculated later
        walletGroupAggregatedBalance: 0,
      }));
    }
    
    console.log(`❌ getEnhancedWalletGroups: No wallet groups available`);
    return [];
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
    // IMPORTANT: Only use processed portfolio if portfolio exists and matches current wallet
    // This prevents showing stale balances when switching wallets
    if (!portfolio || !mainUserWalletGroup?._id) {
      return 0;
    }
    
    // Use the processed portfolio data which has enabledAssets
    if (processedPortfolio?.enabledAssets) {
      console.log(
        "🎯 Using processed portfolio enabledAssets:",
        processedPortfolio.enabledAssets.length
      );
      const enabledBalance = processedPortfolio.enabledAssets.reduce(
        (total: number, asset: any) => total + (asset.totalUsdValue || 0),
        0
      );
      console.log("💰 Enabled balance calculated:", enabledBalance);
      return enabledBalance;
    }

    // Fallback: use raw portfolio data if processed portfolio is not available
    console.log("🔄 Using fallback method - processed portfolio not available");
    if (!portfolio?.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts)
      return 0;

    const accounts =
      portfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts;
    let userTokenList = portfolio.userTokenList || [];

    if (userTokenList.data && userTokenList.data.length > 0) {
      userTokenList = userTokenList.data;
    }

    console.log(
      "📊 Raw data - accounts:",
      accounts.length,
      "userTokenList:",
      userTokenList.length
    );

    // Create a map of enabled token IDs
    const enabledTokenIds = new Set(
      userTokenList
        ?.filter((token: any) => token.status === "ENABLED")
        .map((token: any) => {
          const supportedCurrencyId =
            typeof token.supportedCurrencyId === "string"
              ? token.supportedCurrencyId
              : token.supportedCurrencyId?._id;
          return supportedCurrencyId;
        })
    );

    console.log("✅ Enabled token IDs:", Array.from(enabledTokenIds));

    // Sum only accounts with enabled tokens
    const enabledAccounts = accounts.filter((account: any) => {
      const supportedCurrencyId =
        account.supportedCurrencyId?._id || account.supportedCurrencyId;
      return enabledTokenIds.has(supportedCurrencyId);
    });

    console.log("🎯 Enabled accounts:", enabledAccounts.length);

    const fallbackBalance = enabledAccounts.reduce(
      (total: number, account: any) => total + (account.totalUsdValue || 0),
      0
    );

    console.log("💰 Fallback enabled balance:", fallbackBalance);
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

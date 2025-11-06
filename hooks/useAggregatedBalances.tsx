/**
 * Aggregated Balances Hook
 *
 * This hook provides cached aggregated balances for wallets and wallet groups.
 * Solves the issue where backend gives individual account balances but not
 * aggregated wallet/wallet group totals.
 */

import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import { IUserWalletGroup } from "@/types/main";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export interface AggregatedBalances {
  balanceCache: Record<string, BalanceCache>;
  enhancedWalletGroups: EnhancedWalletGroup[];
  totalPortfolioValue: number;
  timestamp: number;
}

export interface EnhancedWalletGroup extends IUserWalletGroup {
  aggregatedBalance: number;
  walletGroupAggregatedBalance: number;
  _id: string;
  walletId: Record<string, any>;
  walletGroupId: Record<string, any>;
  isDefaultPortfolioInitialized: boolean;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceCache {
  walletBalance: number;
  walletGroupBalance: number;
  totalPortfolioValue: number;
  timestamp: number;
}

export const useAggregatedBalances = () => {
  const {
    portfolio,
    userWalletGroups,
    mainUserWalletGroup,
    isWalletAuthenticated,
  } = useWallet();
  const processedPortfolio = useSelector(
    (state: AppRootState) => state.portfolio.processedPortfolio
  );
  const [aggregatedBalances, setAggregatedBalances] =
    useState<AggregatedBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized balance storage by user wallet group ID
  const [balanceCache, setBalanceCache] = useState<Map<string, BalanceCache>>(
    new Map()
  );

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
  const loadFromCache = async (
    userWalletGroupId: string
  ): Promise<any | null> => {
    try {
      if (!mainUserWalletGroup?._id) return null;

      const cachedData = await SecureStore.getItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${
          userWalletGroupId || mainUserWalletGroup._id
        }`
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
  const saveToCache = async (
    balanceData: BalanceCache,
    userWalletGroupId: string
  ): Promise<void> => {
    try {
      if (!mainUserWalletGroup?._id) return;

      await SecureStore.setItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${
          userWalletGroupId || mainUserWalletGroup._id
        }`,
        JSON.stringify(balanceData)
      );
      await SecureStore.setItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${
          userWalletGroupId || mainUserWalletGroup._id
        }`,
        Date.now().toString()
      );
      console.log(
        "💾 Aggregated balances cached successfully for wallet group:",
        userWalletGroupId || mainUserWalletGroup._id
      );
    } catch (error) {
      console.error("Error saving aggregated balances to cache:", error);
    }
  };

  // Clear aggregated balances cache for the current main wallet group
  const clearCache = async (userWalletGroupId: string): Promise<void> => {
    try {
      if (!mainUserWalletGroup?._id) return;

      await SecureStore.deleteItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES}_${
          userWalletGroupId || mainUserWalletGroup._id
        }`
      );
      await SecureStore.deleteItemAsync(
        `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${
          userWalletGroupId || mainUserWalletGroup._id
        }`
      );
      console.log(
        "🗑️ Aggregated balances cache cleared for wallet group:",
        userWalletGroupId || mainUserWalletGroup._id
      );
    } catch (error) {
      console.error("Error clearing aggregated balances cache:", error);
    }
  };

  // Calculate balances for ALL user wallet groups using the main portfolio data
  // We get the processed portfolio value and cache for all the other user wallet groups
  const calculateAllBalances = async () => {
    if (!userWalletGroups || !isWalletAuthenticated || !processedPortfolio) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the existing PortfolioService.calculateAggregatedBalances function
      // which works with the main portfolio data (if available)
      const walletGroupBalances = new Map<string, number>();

      // This ensures balances don't go to 0 when switching wallets
      const newBalanceCache = new Map<string, BalanceCache>(balanceCache);
      console.log(
        `📊 calculateAllBalances: Starting with ${balanceCache.size} wallets in balanceCache`
      );
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
          walletBalance = processedPortfolio.totalUsdValue || 0;
          walletGroupBalance =
            (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
        } else if (
          existingBalanceData &&
          existingBalanceData.walletBalance > 0
        ) {
          // If we already have a valid balance in cache, preserve it (only for non-main wallets)
          // This prevents balances from going to 0 during wallet switching
          walletBalance = existingBalanceData.walletBalance || 0;
          walletGroupBalance =
            (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
        } else {
          // For other wallet groups OR if no cached balance, try to load from cache
          try {
            const cachedBalances = await loadFromCache(userWalletGroupId);
            if (cachedBalances) {
              walletBalance = cachedBalances.walletBalance || 0;
              walletGroupBalance =
                (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
            } else {
              // No cache available, keep existing balance if it exists, otherwise 0
              walletBalance = 0;
              walletGroupBalance = 0;
            }
          } catch (err) {
            // On error, preserve existing balance if it exists
            walletBalance = existingBalanceData?.walletBalance || 0;
            walletGroupBalance =
              (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
          }
        }
        walletGroupBalances.set(walletGroupId, walletGroupBalance);

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
        await saveToCache(balanceData, userWalletGroupId);
      }

      // Update the balance cache
      setBalanceCache(newBalanceCache);
      console.log(
        `✅ calculateAllBalances: Updated balanceCache with ${newBalanceCache.size} wallets`
      );
      Array.from(newBalanceCache.entries()).forEach(([id, data]) => {
        console.log(`  - Wallet ${id}: $${data?.walletBalance || 0}`);
      });

      // Create enhanced wallet groups with their specific balances
      const enhancedWalletGroups: EnhancedWalletGroup[] = userWalletGroups.map(
        (userWalletGroup) => {
          const userWalletGroupId = userWalletGroup._id;
          const balanceData = newBalanceCache.get(userWalletGroupId);

          return {
            ...userWalletGroup,
            aggregatedBalance: balanceData?.walletBalance || 0,
            walletGroupAggregatedBalance: balanceData?.walletGroupBalance || 0,
          };
        }
      );

      // Calculate total portfolio value from all wallet balances
      const calculatedTotalPortfolioValue = Array.from(
        newBalanceCache.values()
      ).reduce((sum, balanceData) => sum + balanceData.walletBalance, 0);

      const result: AggregatedBalances = {
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
  const prevWalletIdRef = React.useRef<string | undefined>(
    mainUserWalletGroup?._id
  );

  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    const prevWalletId = prevWalletIdRef.current;

    if (currentWalletId && prevWalletId && currentWalletId !== prevWalletId) {
      console.log(
        `🔄 Wallet changed from ${prevWalletId} to ${currentWalletId} - preserving other wallet balances`
      );

      if (userWalletGroups && userWalletGroups.length > 0) {
        calculateAllBalances();
      }
    }

    // Update ref to current wallet ID
    prevWalletIdRef.current = currentWalletId;
  }, [mainUserWalletGroup?._id, userWalletGroups]);

  // Calculate balances when portfolio or userWalletGroups changes
  // Calculate for all wallets even if current portfolio is null (uses cache for non-current wallets)
  useEffect(() => {
    if (
      userWalletGroups &&
      userWalletGroups.length > 0 &&
      isWalletAuthenticated &&
      processedPortfolio
    ) {
      calculateAllBalances();
    }
  }, [processedPortfolio, userWalletGroups, isWalletAuthenticated]);

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
  const getEnhancedWalletGroups = (): EnhancedWalletGroup[] => {
    // If we have aggregated balances with enhanced groups, use them
    if (
      aggregatedBalances?.enhancedWalletGroups &&
      aggregatedBalances.enhancedWalletGroups.length > 0
    ) {
      return aggregatedBalances.enhancedWalletGroups;
    }

    // Otherwise, create a basic structure from userWalletGroups to ensure wallets are always visible
    if (userWalletGroups && userWalletGroups.length > 0) {
      console.log(
        `⚠️ getEnhancedWalletGroups: aggregatedBalances empty, creating basic structure with ${userWalletGroups.length} wallets (all $0)`
      );
      return userWalletGroups.map((group) => ({
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
    if (!processedPortfolio || !mainUserWalletGroup?._id) {
      return 0;
    }

    // Use the processed portfolio data which has enabledAssets
    if (processedPortfolio.enabledAssets) {
      console.log(
        "🎯 Using processed portfolio enabledAssets:",
        processedPortfolio.enabledAssets.length
      );
      const enabledBalance = processedPortfolio.enabledAssets.reduce(
        (total: number, asset: ProcessedAsset) => total + (asset.totalUsdValue || 0),
        0
      );
      console.log("💰 Enabled balance calculated:", enabledBalance);
      return enabledBalance;
    }

    return processedPortfolio.totalUsdValue;
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
    setAggregatedBalances,
    balanceCache: Object.fromEntries(balanceCache),
    isLoading,
    error,

    // Balance getters - THE SINGLE SOURCE OF TRUTH
    getWalletBalance,
    getWalletGroupBalance,
    getTotalPortfolioValue,
    getEnhancedWalletGroups,
    getUserWalletGroupBalanceData,
    getCurrentWalletBalance,
    getCurrentWalletGroupBalance,
    getCurrentWalletEnabledBalance,

    // Actions
    refreshBalances,
    calculateAllBalances,
  };
};

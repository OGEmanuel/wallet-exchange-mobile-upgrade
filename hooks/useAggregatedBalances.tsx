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
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const loadFromCache = useCallback(async (
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
  }, [mainUserWalletGroup?._id]);

  // Save aggregated balances to cache for the current main wallet group
  const saveToCache = useCallback(async (
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
  }, [mainUserWalletGroup?._id]);

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

  // Track if calculateAllBalances is currently running to prevent infinite loops
  const isCalculatingRef = useRef(false);
  // Use a ref to access balanceCache without adding it to dependencies
  const balanceCacheRef = useRef<Map<string, BalanceCache>>(new Map());

  // Calculate balances for ALL user wallet groups using the main portfolio data
  // We get the processed portfolio value and cache for all the other user wallet groups
  const calculateAllBalances = useCallback(async () => {
    if (!userWalletGroups || !isWalletAuthenticated) {
      return;
    }

    // Prevent concurrent executions
    if (isCalculatingRef.current) {
      console.log("⏭️ calculateAllBalances already running, skipping...");
      return;
    }
    
    // If we don't have processedPortfolio, we can still refresh balances from cache
    // This is useful when wallet groups change but portfolio isn't loaded yet
    if (!processedPortfolio) {
      console.log("⚠️ calculateAllBalances: No processedPortfolio available, using cache only");
    }

    try {
      isCalculatingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Use the existing PortfolioService.calculateAggregatedBalances function
      // which works with the main portfolio data (if available)
      const walletGroupBalances = new Map<string, number>();

      // This ensures balances don't go to 0 when switching wallets
      // Use ref to access balanceCache without adding it to dependencies
      const newBalanceCache = new Map<string, BalanceCache>(balanceCacheRef.current);
      console.log(
        `📊 calculateAllBalances: Starting with ${newBalanceCache.size} wallets in balanceCache`
      );
      if (newBalanceCache.size > 0) {
        Array.from(newBalanceCache.entries()).forEach(([id, data]) => {
          console.log(`  - Wallet ${id}: $${data?.walletBalance || 0}`);
        });
      }
      for (const userWalletGroup of userWalletGroups) {
        const userWalletGroupId = userWalletGroup._id;
        const isMainWalletGroup =
          userWalletGroupId === mainUserWalletGroup?._id;
        
        if (!isMainWalletGroup) {
          const existingBalanceData = newBalanceCache.get(userWalletGroupId);
          if (!existingBalanceData || existingBalanceData.walletBalance === 0) {
            try {
              const cachedBalances = await loadFromCache(userWalletGroupId);
              if (cachedBalances) {
                const balanceData = {
                  userWalletGroupId,
                  walletId: userWalletGroup.walletId?._id,
                  walletGroupId: userWalletGroup.walletGroupId?._id,
                  walletBalance: cachedBalances.walletBalance || 0,
                  walletGroupBalance: cachedBalances.walletGroupBalance || 0,
                  totalPortfolioValue: cachedBalances.walletBalance || 0,
                  timestamp: Date.now(),
                };
                newBalanceCache.set(userWalletGroupId, balanceData);
                await saveToCache(balanceData, userWalletGroupId);
              }
            } catch (err) {
              // On error, keep existing balance if it exists
            }
          }
        }
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

        if (isMainWalletGroup && portfolio && processedPortfolio) {
          // For the main wallet group, always recalculate from current portfolio data
          walletBalance = processedPortfolio.totalUsdValue || 0;
          walletGroupBalance =
            (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
        } else if (
          existingBalanceData &&
          existingBalanceData.walletBalance > 0
        ) {
          // If we already have a valid balance in cache, preserve it
          // This prevents balances from going to 0 during wallet switching
          walletBalance = existingBalanceData.walletBalance || 0;
          walletGroupBalance =
            (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
          console.log(
            `💰 Preserving cached balance for wallet ${userWalletGroupId}: $${walletBalance}`
          );
        } else {
          // For wallet groups without cached balance, try to load from cache
          try {
            const cachedBalances = await loadFromCache(userWalletGroupId);
            if (cachedBalances && cachedBalances.walletBalance > 0) {
              walletBalance = cachedBalances.walletBalance || 0;
              walletGroupBalance =
                (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
              console.log(
                `📦 Loaded balance from cache for wallet ${userWalletGroupId}: $${walletBalance}`
              );
            } else {
              // No cache available, preserve existing balance if it exists, otherwise 0
              walletBalance = existingBalanceData?.walletBalance || 0;
              walletGroupBalance =
                (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
              if (walletBalance === 0) {
                console.log(
                  `⚠️ No balance found for wallet ${userWalletGroupId}, setting to 0`
                );
              }
            }
          } catch (err) {
            // On error, preserve existing balance if it exists
            walletBalance = existingBalanceData?.walletBalance || 0;
            walletGroupBalance =
              (walletGroupBalances.get(walletGroupId) || 0) + walletBalance;
            console.error(
              `❌ Error loading balance for wallet ${userWalletGroupId}:`,
              err
            );
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
      balanceCacheRef.current = newBalanceCache;
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
      isCalculatingRef.current = false;
    }
  }, [userWalletGroups, isWalletAuthenticated, processedPortfolio, mainUserWalletGroup, portfolio, loadFromCache, saveToCache]);

  // Clear balance cache when main wallet group changes
  // Use a ref to track the previous wallet ID to detect actual changes
  const prevWalletIdRef = React.useRef<string | undefined>(
    mainUserWalletGroup?._id
  );
  const lastCalculationTimeRef = React.useRef<number>(0);
  const CALCULATION_DEBOUNCE_MS = 1000; // Don't calculate more than once per second

  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    const prevWalletId = prevWalletIdRef.current;

    if (currentWalletId && prevWalletId && currentWalletId !== prevWalletId) {
      console.log(
        `🔄 Wallet changed from ${prevWalletId} to ${currentWalletId} - preserving other wallet balances`
      );

      const now = Date.now();
      if (userWalletGroups && userWalletGroups.length > 0 && !isCalculatingRef.current && (now - lastCalculationTimeRef.current) > CALCULATION_DEBOUNCE_MS) {
        lastCalculationTimeRef.current = now;
        calculateAllBalances();
      }
    }

    // Update ref to current wallet ID
    prevWalletIdRef.current = currentWalletId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUserWalletGroup?._id, userWalletGroups]);

  // Calculate balances when portfolio or userWalletGroups changes
  // Calculate for all wallets even if current portfolio is null (uses cache for non-current wallets)
  useEffect(() => {
    const now = Date.now();
    if (
      userWalletGroups &&
      userWalletGroups.length > 0 &&
      isWalletAuthenticated &&
      processedPortfolio &&
      !isCalculatingRef.current &&
      (now - lastCalculationTimeRef.current) > CALCULATION_DEBOUNCE_MS
    ) {
      lastCalculationTimeRef.current = now;
      calculateAllBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedPortfolio, userWalletGroups, isWalletAuthenticated]);

  // Refresh balances when userWalletGroups changes (even if portfolio isn't ready)
  // This ensures balances are recalculated when wallets are added/removed
  const prevWalletGroupsLengthRef = React.useRef<number>(userWalletGroups?.length || 0);
  const prevWalletGroupsIdsRef = React.useRef<string[]>(
    userWalletGroups?.map((g: IUserWalletGroup) => g._id) || []
  );

  useEffect(() => {
    const currentWalletGroupsLength = userWalletGroups?.length || 0;
    const currentWalletGroupsIds = userWalletGroups?.map((g: IUserWalletGroup) => g._id) || [];
    const prevLength = prevWalletGroupsLengthRef.current;
    const prevIds = prevWalletGroupsIdsRef.current;

    // Check if wallet groups actually changed (length or IDs)
    const hasChanged = 
      currentWalletGroupsLength !== prevLength ||
      currentWalletGroupsIds.length !== prevIds.length ||
      currentWalletGroupsIds.some((id, index) => id !== prevIds[index]);

    const now = Date.now();
    if (
      hasChanged &&
      userWalletGroups &&
      userWalletGroups.length > 0 &&
      isWalletAuthenticated &&
      !isCalculatingRef.current &&
      (now - lastCalculationTimeRef.current) > CALCULATION_DEBOUNCE_MS
    ) {
      console.log(
        `🔄 Wallet groups changed (${prevLength} -> ${currentWalletGroupsLength}), refreshing aggregated balances`
      );
      // Refresh balances even if portfolio isn't ready - will use cache for non-main wallets
      lastCalculationTimeRef.current = now;
      calculateAllBalances();
    }

    // Update refs
    prevWalletGroupsLengthRef.current = currentWalletGroupsLength;
    prevWalletGroupsIdsRef.current = currentWalletGroupsIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWalletGroups, isWalletAuthenticated]);

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
      const enabledBalance = processedPortfolio.enabledAssets.reduce(
        (total: number, asset: ProcessedAsset) => total + (asset.totalUsdValue || 0),
        0
      );
      console.log("💰 Enabled balance calculated:", enabledBalance);
      return enabledBalance;
    }

    console.log("💰 Enabled balance not found, using total portfolio value:", processedPortfolio.totalUsdValue);

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

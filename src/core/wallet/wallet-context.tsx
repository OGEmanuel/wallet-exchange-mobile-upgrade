/**
 * Wallet Context - Zap SDK Integration
 *
 * Provides wallet state management and operations throughout the app.
 * Integrates with the Zap SDK for blockchain operations.
 */

import { WALLET_GROUP_CLASS, WALLET_GROUP_TYPE } from "@/configs/constants";
import { IUserWalletGroup, WalletContextType } from "@/types/main";
import { WalletUtils, ZapSDK } from "@zap/blockchain-sdk";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { uniqueId } from "lodash";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, AppState } from "react-native";
import { useChains } from "../chains/chains-context";
import zapSDKService from "../sdk/zap-sdk.service";
import AddressesStorage, { StoredAddress } from "../storage/addresses-storage";
import PrivateKeysStorage, {
  StoredPrivateKey,
} from "../storage/private-keys-storage";
import SeedPhraseStorage from "../storage/seed-phrase-storage";
import { StorageKeys } from "../storage/storage-types";
import WalletCredentialsStorage from "../storage/wallet-credentials-storage";
import { useSupportedCurrencies } from "../supported-currencies/supported-currencies-context";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { loadChainsNow, walletChains } = useChains();
  const { refreshSupportedCurrencies, supportedCurrencies } =
    useSupportedCurrencies();
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [isExchangeAuthenticated, setIsExchangeAuthenticated] = useState(false);
  const [currentExchangeUser, setCurrentExchangeUser] = useState<string | null>(
    null
  );
  const [isAccountDeriving, setIsAccountDeriving] = useState(false);
  const [currentSeedPhrase, setCurrentSeedPhrase] = useState<string | null>(
    null
  );
  const [currentWalletUser, setCurrentWalletUser] = useState<string | null>(
    null
  );
  const [userWalletGroups, setUserWalletGroups] = useState<any[]>([]);
  const [isUserWalletGroups, setIsUserWalletGroups] = useState(false);
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [mainUserWalletGroup, setMainUserWalletGroup] = useState<any | null>(
    null
  );
  const [transactions, setTransactions] = useState<any[]>([]);
  // Separate loading states for different operations
  const [isLoading, setIsLoading] = useState(false); // General loading state (deprecated)
  const [isInitializing, setIsInitializing] = useState(false); // SDK initialization
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Authentication operations
  const [isCreatingWallet, setIsCreatingWallet] = useState(false); // Wallet creation
  const [isRefreshingPortfolio, setIsRefreshingPortfolio] = useState(false);
  const [portfolioAbortController, setPortfolioAbortController] =
    useState<AbortController | null>(null); // Portfolio operations
  const [isSendingTransaction, setIsSendingTransaction] = useState(false); // Transaction operations
  const [isRetryingPendingWallets, setIsRetryingPendingWallets] =
    useState(false);
  const [isBackgroundWalletGroupsRefresh, setIsBackgroundWalletGroupsRefresh] =
    useState(false);
  const [isBackgroundPortfolioRefresh, setIsBackgroundPortfolioRefresh] =
    useState(false);

  // Other states
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasNavigatedToWallet, setHasNavigatedToWallet] = useState(false);

  // Initialize SDK on mount
  useEffect(() => {
    initializeSDK();

    return () => {
      // Only cleanup on unmount, not during initialization
      // The cleanup will be handled by the app lifecycle
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      checkAuthenticationAndRoute();
      setupWebSocketListeners();
      setupAppStateListener();
    }
  }, [isInitialized]);

  const initializeSDK = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const success = await zapSDKService.initialize();
      if (success) {
        setupWebSocketListeners();
        setupAppStateListener();
        setIsInitialized(true);
      } else {
        setError("Failed to initialize wallet service");
        setIsInitialized(false);
      }
    } catch (error) {
      console.error("SDK initialization error:", error);
      setError("Failed to initialize wallet service");
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Fast cache-first authentication check
  const checkCacheFirstAuthentication = async (): Promise<{
    exchangeUserId: string | null;
    isExchangeAuth: boolean;
    walletUserId: string | null;
    isWalletAuth: boolean;
    userWalletGroups: any[] | null;
    isUserWalletGroups: boolean;
    mainWalletGroupId: string | null;
    portfolio: any | null;
    fromCache: boolean;
  }> => {
    const result = {
      exchangeUserId: null,
      isExchangeAuth: false,
      walletUserId: null,
      isWalletAuth: false,
      userWalletGroups: null,
      isUserWalletGroups: false,
      mainWalletGroupId: null,
      portfolio: null,
      fromCache: false,
    };

    try {
      // Check cache first for faster routing
      const cachedWalletGroups = await loadWalletGroupsFromCache();
      const mainWalletGroupId = await SecureStore.getItemAsync(
        StorageKeys.MAIN_WALLET_GROUP_ID
      );

      // Also check if cache is still valid
      const cacheValidity = await isCacheValid();

      if (
        cachedWalletGroups &&
        cachedWalletGroups.length > 0 &&
        mainWalletGroupId &&
        cacheValidity.isValid
      ) {
        console.log(
          "🚀 Fast cache check: Found valid cached wallet groups and main wallet group ID"
        );

        // Load portfolio from cache for the main wallet group
        const cachedPortfolio = await loadPortfolioFromCache(mainWalletGroupId);

        // Set up state from cache
        setUserWalletGroups(cachedWalletGroups);
        setIsUserWalletGroups(true);

        const selectedGroup =
          cachedWalletGroups.find((group) => group._id === mainWalletGroupId) ||
          cachedWalletGroups[0];
        setMainUserWalletGroup(selectedGroup);

        if (cachedPortfolio) {
          setPortfolio(cachedPortfolio);
        }

        // Get wallet user ID from cache or SDK
        const walletUserId = await zapSDKService.getCurrentUserId();
        const isWalletAuth = !!walletUserId;

        if (isWalletAuth) {
          setCurrentWalletUser(walletUserId);
          setIsWalletAuthenticated(true);
        }

        // Check exchange auth
        const isExchangeAuth = await zapSDKService.isExchangeAuthenticated();
        if (isExchangeAuth) {
          const exchangeUserId = await zapSDKService.getExchangeUserId();
          setCurrentExchangeUser(exchangeUserId);
          setIsExchangeAuthenticated(isExchangeAuth);
        }

        return {
          ...result,
          exchangeUserId: isExchangeAuth
            ? await zapSDKService.getExchangeUserId()
            : null,
          isExchangeAuth,
          walletUserId,
          isWalletAuth,
          userWalletGroups: cachedWalletGroups,
          isUserWalletGroups: true,
          mainWalletGroupId,
          portfolio: cachedPortfolio,
          fromCache: true,
        };
      }

      return result;
    } catch (error) {
      console.error("Cache-first authentication check failed:", error);
      return result;
    }
  };

  const checkAuthenticationAndRoute = async (shouldRoute: boolean = true) => {
    const startTime = Date.now();
    console.log("🚀 Starting authentication and routing check");
    
    let result: {
      exchangeUserId: string | null;
      isExchangeAuth: boolean;
      walletUserId: string | null;
      isWalletAuth: boolean;
      userWalletGroups: any[] | null;
      isUserWalletGroups: boolean;
    } = {
      exchangeUserId: null,
      isExchangeAuth: false,
      walletUserId: null,
      isWalletAuth: false,
      userWalletGroups: null,
      isUserWalletGroups: false,
    };
    
    try {
      // First, try fast cache check
      const cacheResult = await checkCacheFirstAuthentication();

      if (
        cacheResult.fromCache &&
        cacheResult.userWalletGroups &&
        cacheResult.userWalletGroups.length > 0
      ) {
        console.log("✅ Using cached data for fast routing");

        // Route immediately if we have cached data
        if (cacheResult.isExchangeAuth && shouldRoute) {
          router.replace("/dashboard/home/wallet-home/swap");
        } else if (
          cacheResult.isWalletAuth &&
          cacheResult.isUserWalletGroups &&
          shouldRoute
        ) {
          safeNavigateToWallet();
        }

        // Start background refresh in parallel to ensure data is up to date
        setTimeout(() => {
          console.log("🔄 Starting background refresh of wallet groups and portfolio");
          refreshUserWalletGroups();
          if (cacheResult.mainWalletGroupId) {
            refreshPortfolio();
          }
        }, 100);

        return {
          exchangeUserId: cacheResult.exchangeUserId,
          isExchangeAuth: cacheResult.isExchangeAuth,
          walletUserId: cacheResult.walletUserId,
          isWalletAuth: cacheResult.isWalletAuth,
          userWalletGroups: cacheResult.userWalletGroups,
          isUserWalletGroups: cacheResult.isUserWalletGroups,
        };
      }

      // Fallback to original authentication flow if no cache
      console.log(
        "🔄 No valid cache found, proceeding with full authentication check"
      );
      const walletUserId = await zapSDKService.getCurrentUserId();
      const isWalletAuth = !!walletUserId;
      const isExchangeAuth = await zapSDKService.isExchangeAuthenticated();

      if (isExchangeAuth) {
        // User has exchange authentication - route to exchange
        const exchangeUserId = await zapSDKService.getExchangeUserId();
        setCurrentExchangeUser(exchangeUserId);
        setIsExchangeAuthenticated(isExchangeAuth);
        console.log("✅ Exchange authentication found, routing to exchange");
        result = { ...result, exchangeUserId, isExchangeAuth };
        if (shouldRoute) {
          router.replace("/dashboard/home/wallet-home/swap");
        }
      }
      if (isWalletAuth) {
        // User has wallet authentication - check for wallet groups
        console.log("Wallet is authenticated with wallet auth", isWalletAuth);
        setCurrentWalletUser(walletUserId);
        setIsWalletAuthenticated(true);
        console.log("Wallet is authenticated with wallet auth", walletUserId);

        result = { ...result, walletUserId, isWalletAuth: true };
        const routeResult = await routeToWallet(
          isExchangeAuth,
          walletUserId,
          shouldRoute
        );
        result = {
          ...result,
          isUserWalletGroups: routeResult?.isUserWalletGroups,
          userWalletGroups: routeResult?.userWalletGroups,
        };
      } else {
        const deviceLoginSuccess = await attemptDeviceLogin();
        if (deviceLoginSuccess) {
          const routeResult = await routeToWallet(
            isExchangeAuth,
            walletUserId,
            shouldRoute
          );
          result = {
            ...result,
            isWalletAuth: true,
            isUserWalletGroups: routeResult?.isUserWalletGroups,
            userWalletGroups: routeResult?.userWalletGroups,
          };
        }
      }

      return result;
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsWalletAuthenticated(false);
      setIsUserWalletGroups(false);
      result = {
        ...result,
        walletUserId: null,
        isWalletAuth: false,
        userWalletGroups: null,
        isUserWalletGroups: false,
      };
      return result;
    } finally {
      // Trigger chain loading now that user is authenticated
      if (!walletChains.length) loadChainsNow();
      if (!supportedCurrencies.length) refreshSupportedCurrencies();
      
      // Log performance metrics
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`⏱️ Authentication and routing completed in ${duration}ms`);
    }
  };

  // Cache management for wallet groups - Smart caching strategy
  const CACHE_DURATION = {
    SHORT: 30 * 60 * 1000, // 30 minutes - for active users
    MEDIUM: 24 * 60 * 60 * 1000, // 24 hours - for daily users
    LONG: 7 * 24 * 60 * 60 * 1000, // 7 days - for weekly users
    MAX: 30 * 24 * 60 * 60 * 1000, // 30 days - maximum cache age
  };

  // Helper function to check if cached data is still valid with smart duration
  const isCacheValid = async (): Promise<{
    isValid: boolean;
    shouldRefreshInBackground: boolean;
  }> => {
    try {
      const timestamp = await SecureStore.getItemAsync(
        StorageKeys.USER_WALLET_GROUPS_TIMESTAMP
      );
      if (!timestamp)
        return { isValid: false, shouldRefreshInBackground: false };

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      const age = now - cacheTime;

      // Smart cache validation based on age
      if (age < CACHE_DURATION.SHORT) {
        // Fresh cache - use immediately
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.MEDIUM) {
        // Cache is still valid but getting stale - use it but refresh in background
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.LONG) {
        // Cache is old but might still be useful - use it but definitely refresh
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.MAX) {
        // Very old cache - use it as fallback but refresh immediately
        return { isValid: true, shouldRefreshInBackground: true };
      } else {
        // Cache is too old - invalidate
        return { isValid: false, shouldRefreshInBackground: false };
      }
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return { isValid: false, shouldRefreshInBackground: false };
    }
  };

  // Helper function to load wallet groups from cache
  const loadWalletGroupsFromCache = async (): Promise<
    IUserWalletGroup[] | null
  > => {
    try {
      const cachedData = await SecureStore.getItemAsync(
        StorageKeys.USER_WALLET_GROUPS
      );
      if (!cachedData) return null;

      const parsedData = JSON.parse(cachedData);
      return parsedData;
    } catch (error) {
      console.error("Error loading wallet groups from cache:", error);
      return null;
    }
  };

  // Helper function to save wallet groups to cache
  const saveWalletGroupsToCache = async (
    walletGroups: IUserWalletGroup[]
  ): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        StorageKeys.USER_WALLET_GROUPS,
        JSON.stringify(walletGroups)
      );
      await SecureStore.setItemAsync(
        StorageKeys.USER_WALLET_GROUPS_TIMESTAMP,
        Date.now().toString()
      );
    } catch (error) {
      console.error("Error saving wallet groups to cache:", error);
    }
  };

  // Helper function to clear wallet groups cache
  const clearWalletGroupsCache = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(StorageKeys.USER_WALLET_GROUPS);
      await SecureStore.deleteItemAsync(
        StorageKeys.USER_WALLET_GROUPS_TIMESTAMP
      );
      console.log("🗑️ Wallet groups cache cleared");
    } catch (error) {
      console.error("Error clearing wallet groups cache:", error);
    }
  };

  // Portfolio cache management functions - per wallet group
  const isPortfolioCacheValid = async (
    userWalletGroupId?: string
  ): Promise<{
    isValid: boolean;
    shouldRefreshInBackground: boolean;
  }> => {
    try {
      if (!userWalletGroupId) {
        return { isValid: false, shouldRefreshInBackground: false };
      }

      const cacheKey = `${StorageKeys.PORTFOLIO_TIMESTAMP}_${userWalletGroupId}`;
      const timestamp = await SecureStore.getItemAsync(cacheKey);
      if (!timestamp)
        return { isValid: false, shouldRefreshInBackground: false };

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      const age = now - cacheTime;

      // Portfolio cache has shorter duration than wallet groups (more dynamic data)
      if (age < CACHE_DURATION.SHORT) {
        // Fresh portfolio cache - use immediately
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.MEDIUM) {
        // Portfolio cache is getting stale - use it but refresh in background
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.LONG) {
        // Old portfolio cache - use it but definitely refresh
        return { isValid: true, shouldRefreshInBackground: true };
      } else {
        // Portfolio cache is too old - invalidate
        return { isValid: false, shouldRefreshInBackground: false };
      }
    } catch (error) {
      console.error("Error checking portfolio cache validity:", error);
      return { isValid: false, shouldRefreshInBackground: false };
    }
  };

  // Load portfolio data for a specific wallet group from cache
  const loadPortfolioFromCache = async (
    userWalletGroupId: string
  ): Promise<any | null> => {
    try {
      const cacheKey = `${StorageKeys.PORTFOLIO_DATA}_${userWalletGroupId}`;
      const cachedData = await SecureStore.getItemAsync(cacheKey);
      if (!cachedData) return null;

      const parsedData = JSON.parse(cachedData);
      console.log(
        `🚀 Loading portfolio from cache for wallet group: ${userWalletGroupId}`
      );
      return parsedData;
    } catch (error) {
      console.error("Error loading portfolio from cache:", error);
      return null;
    }
  };

  // Save portfolio data for a specific wallet group to cache
  const savePortfolioToCache = async (
    portfolioData: any,
    userWalletGroupId: string
  ): Promise<void> => {
    try {
      const cacheKey = `${StorageKeys.PORTFOLIO_DATA}_${userWalletGroupId}`;
      const timestampKey = `${StorageKeys.PORTFOLIO_TIMESTAMP}_${userWalletGroupId}`;

      await SecureStore.setItemAsync(cacheKey, JSON.stringify(portfolioData));
      await SecureStore.setItemAsync(timestampKey, Date.now().toString());
      console.log(
        `💾 Portfolio cached successfully for wallet group: ${userWalletGroupId}`
      );
    } catch (error) {
      console.error("Error saving portfolio to cache:", error);
    }
  };

  // Clear portfolio cache for a specific wallet group
  const clearPortfolioCache = async (
    userWalletGroupId?: string
  ): Promise<void> => {
    try {
      if (userWalletGroupId) {
        // Clear specific wallet group cache
        await SecureStore.deleteItemAsync(
          `${StorageKeys.PORTFOLIO_DATA}_${userWalletGroupId}`
        );
        await SecureStore.deleteItemAsync(
          `${StorageKeys.PORTFOLIO_TIMESTAMP}_${userWalletGroupId}`
        );
        console.log(
          `🗑️ Portfolio cache cleared for wallet group: ${userWalletGroupId}`
        );
      } else {
        // Clear all portfolio caches
      }
    } catch (error) {
      console.error("Error clearing portfolio cache:", error);
    }
  };

  useEffect(() => {
    // Clear all portfolio cache on app start to ensure fresh data
    clearPortfolioCache(mainUserWalletGroup?.walletGroupId?._id);
    clearPortfolioCache(mainUserWalletGroup?._id);
  }, [mainUserWalletGroup]);

  const refreshPortfolioInBackground = async (): Promise<void> => {
    // Prevent multiple simultaneous background refreshes
    if (
      isBackgroundPortfolioRefresh ||
      isRetryingPendingWallets ||
      isAuthenticating ||
      isSendingTransaction
    ) {
      console.log(
        "⏸️ Background portfolio refresh already in progress or other operations running, skipping..."
      );
      return;
    }

    try {
      if (
        !isWalletAuthenticated ||
        !currentWalletUser ||
        !mainUserWalletGroup
      ) {
        return;
      }

      setIsBackgroundPortfolioRefresh(true);
      console.log("🔄 Refreshing portfolio in background...");
      const sdk = zapSDKService.getSDK();

      if (sdk && typeof sdk.portfolio?.getUserPortfolio === "function") {
        const portfolioOptions = mainUserWalletGroup?._id
          ? {
              mainUserWalletGroupId: mainUserWalletGroup._id,
              bypassCache: true,
            }
          : {};

        const portfolioData = await zapSDKService.executeWithNetworkHandling(
          () =>
            sdk.portfolio.getUserPortfolio(currentWalletUser, portfolioOptions),
          "getUserPortfolio"
        );

        console.log(
          "🔍 Portfolio data:",
          portfolioData.mainWalletGroupPortfolio.mainWalletPortfolio.accounts
            .filter((account) => account.balance > 0)
            .map((account) => [account.name, account.balance])
        );

        if (portfolioData) {
          await savePortfolioToCache(
            portfolioData,
            portfolioOptions.mainUserWalletGroupId
          );

          // Update state if user is still on the app
          setPortfolio(portfolioData);
          setLastUpdate(new Date());
          console.log("✅ Background portfolio refresh completed");
        }
      }
    } catch (error) {
      console.error("❌ Background portfolio refresh failed:", error);
      // Don't throw error - this is background operation
    } finally {
      setIsBackgroundPortfolioRefresh(false);
    }
  };

  // Helper function to create the base result object
  const createBaseResult = (): {
    exchangeUserId: string | null;
    isExchangeAuth: boolean;
    walletUserId: string | null;
    isWalletAuth: boolean;
    userWalletGroups: any[] | null;
    isUserWalletGroups: boolean;
  } => ({
    exchangeUserId: null,
    isExchangeAuth: false,
    walletUserId: null,
    isWalletAuth: false,
    userWalletGroups: null,
    isUserWalletGroups: false,
  });

  // Helper function to handle wallet groups error
  const handleWalletGroupsError = (error: any, result: any) => {
    console.error("Failed to get wallet groups:", error);

    if (
      error instanceof Error &&
      (error.message?.includes("404") ||
        error.message?.includes("Request failed"))
    ) {
      console.log(
        "ℹ️ No wallet groups found (404) - user needs to create wallets"
      );
      setIsUserWalletGroups(false);
      return {
        ...result,
        userWalletGroups: null,
        isUserWalletGroups: false,
      };
    } else {
      setIsUserWalletGroups(false);
      return {
        ...result,
        userWalletGroups: null,
        isUserWalletGroups: false,
      };
    }
  };

  // Helper function to set up main wallet group and credentials
  const setupMainWalletGroup = async (userWalletGroups: any[]) => {
    const storedMainWalletGroupId = await SecureStore.getItemAsync(
      StorageKeys.MAIN_WALLET_GROUP_ID
    );
    const mainUserWalletGroupId =
      storedMainWalletGroupId || userWalletGroups[0]._id;

    const selectedGroup =
      userWalletGroups.find(
        (group: any) => group._id === mainUserWalletGroupId
      ) || userWalletGroups[0];

    setMainUserWalletGroup(selectedGroup);

    const portfolio = await loadPortfolioFromCache(selectedGroup._id);
    if (portfolio) setPortfolio(portfolio);

    const credentials =
      await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
        mainUserWalletGroupId.toString()
      );
    setCurrentSeedPhrase(credentials?.credential.toString() || null);
  };

  // Helper function to process wallet groups when they exist
  const processWalletGroups = async (
    uWalletGroups: any,
    isExchangeAuth: boolean,
    shouldRoute: boolean,
    result: any
  ) => {
    setUserWalletGroups(uWalletGroups.userWalletGroups);
    setIsUserWalletGroups(true);

    await saveWalletGroupsToCache(uWalletGroups.userWalletGroups);

    await setupMainWalletGroup(uWalletGroups.userWalletGroups);

    console.log(
      "✅ Wallet authentication with groups found, routing to wallet"
    );

    const updatedResult = {
      ...result,
      userWalletGroups: uWalletGroups.userWalletGroups,
      isUserWalletGroups: true,
    };

    if (!isExchangeAuth && shouldRoute) {
      safeNavigateToWallet();
    }

    return updatedResult;
  };

  // Helper function to handle case when no wallet groups exist
  const handleNoWalletGroups = (result: any) => {
    setIsUserWalletGroups(false);
    console.log("⚠️ Wallet auth found but no wallet groups, routing to setup");

    return {
      ...result,
      userWalletGroups: null,
      isUserWalletGroups: false,
    };
  };

  // Helper function to fetch wallet groups from API (cache disabled for now)
  const loadWalletGroupsWithCache = async (
    walletUserId: string,
    isExchangeAuth: boolean,
    shouldRoute: boolean,
    result: any
  ) => {
    const cachedWalletGroups: IUserWalletGroup[] | null =
      await loadWalletGroupsFromCache();
    console.log("🔄 Fetching fresh wallet groups from API (cache disabled)");
    fetchAndProcessWalletGroups(
      walletUserId,
      isExchangeAuth,
      shouldRoute,
      result
    );
    return cachedWalletGroups as IUserWalletGroup[];
  };

  // Helper function to fetch and process wallet groups
  const fetchAndProcessWalletGroups = async (
    walletUserId: string,
    isExchangeAuth: boolean,
    shouldRoute: boolean,
    result: any
  ) => {
    try {
      const uWalletGroups = await zapSDKService.getUserWalletGroups(
        walletUserId,
        { useCache: false }
      );
      console.log("📱 Wallet groups found with wallet groups:", uWalletGroups);

      if (
        uWalletGroups.userWalletGroups &&
        uWalletGroups.userWalletGroups.length > 0
      ) {
        return await processWalletGroups(
          uWalletGroups,
          isExchangeAuth,
          shouldRoute,
          result
        );
      } else {
        return handleNoWalletGroups(result);
      }
    } catch (error) {
      return handleWalletGroupsError(error, result);
    }
  };

  // Main routeToWallet function - now much cleaner with caching
  const routeToWallet = async (
    isExchangeAuth: boolean,
    walletUserId: string | null,
    shouldRoute: boolean = true
  ) => {
    let result = createBaseResult();

    try {
      if (!userWalletGroups.length && walletUserId) {
        // Use the new caching logic for faster initialization
        const walletGroups = await loadWalletGroupsWithCache(
          walletUserId as string,
          isExchangeAuth,
          shouldRoute,
          result
        );
        if (walletGroups) {
          result = {
            ...result,
            userWalletGroups: [...walletGroups],
            isUserWalletGroups: true,
          };
        }
        return result;
      } else {
        result = { ...result, userWalletGroups, isUserWalletGroups: true };

        if (!isExchangeAuth && shouldRoute) {
          safeNavigateToWallet();
        }
        return result;
      }
    } catch (error) {
      console.error("Failed to get wallet groups:", error);
      result = { ...result, userWalletGroups, isUserWalletGroups: true };
      console.log(
        "✅ Wallet authentication found (groups check failed), staying on start screen"
      );
      return result;
    }
  };

  const setupWebSocketListeners = () => {
    // Listen for connection status
    const connectionStatus = zapSDKService.getConnectionStatus();
    setIsConnected(connectionStatus.connected);
    setLastUpdate(connectionStatus.connected ? new Date() : null);
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isInitialized) {
        // Reconnect WebSocket when app becomes active
        zapSDKService.reconnectWebSocket();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  };

  const attemptDeviceLogin = async () => {
    try {
      // Get persistent device fingerprint (stable, doesn't change)
      const deviceFingerprint = await getPersistentDeviceFingerprint();
      console.log("🔐 Using persistent device fingerprint for login");

      // Get push notification token (can change, so get fresh each time)
      let pushToken = "";
      try {
        if (Device.isDevice) {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === "granted") {
            pushToken = (await Notifications.getExpoPushTokenAsync()).data;
            console.log("📱 Push token obtained:", pushToken);
          }
        }
      } catch (error) {
        console.warn("Failed to get push token:", error);
      }

      // Device token is the IMEI or something else that is unique to the device
      const deviceToken =
        Device.osInternalBuildId ||
        Device.modelId ||
        `unknown-${uniqueId("supaaa-unique-id")}`;

      // Attempt device-based login
      const success = await walletLogin(
        deviceToken,
        deviceFingerprint,
        pushToken
      );

      if (success) {
        // After successful login, check auth type again
        console.log("✅ Device login successful, checking auth type...");
        // The wallet context will handle the routing based on the new auth state
        return true;
      } else {
        // If device login fails, show select track
        console.log("❌ Device login failed, showing select track");
        return false;
      }
    } catch (error) {
      console.error("Device authentication failed:", error);
      // Redirect to select track on error
      return false;
    }
  };

  // Get or create persistent device fingerprint
  const getPersistentDeviceFingerprint = async (): Promise<string> => {
    try {
      // Try to get existing fingerprint from secure storage
      const existingFingerprint = await SecureStore.getItemAsync(
        "device_fingerprint"
      );

      if (existingFingerprint) {
        console.log("📱 Using existing device fingerprint");
        return existingFingerprint;
      }

      // Create new persistent fingerprint
      console.log("🔧 Creating new persistent device fingerprint");
      const fingerprint =
        Device.osBuildFingerprint ||
        Device.osInternalBuildId ||
        Device.modelId ||
        `unknown-${uniqueId("supaaa-unique-id")}`;

      const fingerprintString = JSON.stringify(fingerprint);

      // Store in secure storage for future use
      await SecureStore.setItemAsync("device_fingerprint", fingerprintString);

      console.log("✅ New device fingerprint created and stored", fingerprint);
      return fingerprint;
    } catch (error) {
      console.error("Failed to get/create device fingerprint:", error);

      // Fallback to basic fingerprint if storage fails
      const fallbackFingerprint = {
        deviceId:
          Device.osInternalBuildId ||
          Device.modelId ||
          `unknown-${uniqueId("supaaa-unique-id")}`,
        deviceName: Device.deviceName || Device.modelName || "Unknown Device",
        deviceType: Device.deviceType || 0,
        osName: Device.osName || "Unknown OS",
        osVersion: Device.osVersion || "Unknown Version",
      };

      return JSON.stringify(fallbackFingerprint);
    }
  };

  // Authentication methods
  const walletLogin = async (
    deviceToken: string,
    deviceFingerprint: string,
    pushToken: string
  ): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const sdk = zapSDKService.getSDK();
      const result = await sdk.walletAuth.login({
        deviceToken,
        deviceFingerprint,
        pushToken,
      });

      if (result.success) {
        setIsWalletAuthenticated(true);
        setCurrentWalletUser(result.userId);
        await checkAuthenticationAndRoute(false);
        return true;
      } else {
        setError(result || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logoutFromExchange = async (): Promise<void> => {
    try {
      const sdk = zapSDKService.getSDK();
      await sdk.logoutFromExchange();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const exchangeLogin = async (email: string): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const sdk = zapSDKService.getSDK();
      const result = await sdk.sendExchangeOtp(email);

      if (result) {
        Alert.alert("Success", "OTP sent to your email");
        return true;
      } else {
        setError(result || "Failed to send OTP");
        return false;
      }
    } catch (error) {
      console.error("Exchange login error:", error);
      setError("Failed to send OTP");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const exchangeValidateOtp = async (
    email: string,
    otp: string
  ): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const sdk = zapSDKService.getSDK();
      const result = await sdk.validateExchangeOtp(email, otp);

      if (result) {
        setIsExchangeAuthenticated(true);
        setCurrentExchangeUser(result.data.user._id);
        await checkAuthenticationAndRoute(false);
        return true;
      } else {
        setError(result || "Invalid OTP");
        return false;
      }
    } catch (error) {
      console.error("OTP validation error:", error);
      setError("Invalid OTP");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Unified wallet creation function
  const createWalletGroup = async ({
    name,
    seedPhrase,
    privateKey,
    watchAddress,
    walletType = WALLET_GROUP_TYPE.GENERATED,
    walletClass = WALLET_GROUP_CLASS.SEEDPHRASE,
    searchChain,
  }: {
    name: string;
    seedPhrase?: string;
    privateKey?: string;
    watchAddress?: string;
    walletType?: WALLET_GROUP_TYPE;
    walletClass?: WALLET_GROUP_CLASS;
    searchChain?: string;
  }): Promise<{
    walletStorageId: string;
    name: string;
    isCreated: boolean;
    message?: string;
  } | null> => {
    try {
      setIsCreatingWallet(true);
      setError(null);
      let seedPhraseToUse = seedPhrase;

      if (!seedPhrase && !privateKey && !watchAddress) {
        seedPhraseToUse = await zapSDKService.generateSeedPhrase();
      }

      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          name,
          class: walletClass,
          chain: searchChain,
          credential: seedPhraseToUse || privateKey || watchAddress || "",
          derivationIndex: 0,
        });

      // Create wallet in SDK
      const result = await zapSDKService.createWalletGroupMultipurpose({
        name,
        seedPhrase: seedPhraseToUse,
        privateKey,
        watchAddress,
        walletType,
      });

      if (!result?.userWalletGroupId) {
        await WalletCredentialsStorage.markWalletCreationAttempt(
          walletStorageId,
          false
        );
        throw new Error("Failed to create wallet group");
      }

      await WalletCredentialsStorage.markWalletAsCreated(
        walletStorageId,
        result.userWalletGroupId
      );

      const newUserWalletGroups = await refreshUserWalletGroups();

      await switchWallet(result.userWalletGroupId, newUserWalletGroups);

      return {
        walletStorageId,
        name,
        isCreated: true,
      };
    } catch (error) {
      console.error("Wallet creation error:", error);
      setError("Failed to create wallet");
      return null;
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Store and derive credentials based on credential type
  const storeAndDeriveCredentials = async ({
    userWalletGroupId,
    seedPhrase,
    privateKey,
    watchAddress,
    searchChain,
    derivationIndex = 0,
  }: {
    userWalletGroupId: string;
    seedPhrase?: string;
    privateKey?: string;
    watchAddress?: string;
    searchChain?: string;
    derivationIndex?: number;
  }): Promise<{
    addresses: StoredAddress[];
    privateKeys: StoredPrivateKey[];
  }> => {
    try {
      console.log(
        "💾 Storing and deriving credentials for wallet:",
        userWalletGroupId
      );

      // Check if credentials are already stored
      const existingCredentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          userWalletGroupId
        );

      if (!existingCredentials) {
        // Store credentials if not already stored
        await WalletCredentialsStorage.storeWalletCredential({
          name: `Wallet ${userWalletGroupId}`,
          class: seedPhrase
            ? WALLET_GROUP_CLASS.SEEDPHRASE
            : privateKey
            ? WALLET_GROUP_CLASS.PRIVATE_KEY
            : WALLET_GROUP_CLASS.WATCH,
          chain: searchChain,
          credential: seedPhrase || privateKey || watchAddress || "",
          derivationIndex,
          userWalletGroupId,
        });
        console.log("✅ Credentials stored for wallet:", userWalletGroupId);
      }

      const addresses: StoredAddress[] = [];
      const privateKeys: StoredPrivateKey[] = [];

      if (watchAddress && searchChain) {
        const chainInfo = await getChainInfo(searchChain);
        // For watch addresses, just store the address
        console.log("📝 Storing watch address:", watchAddress);
        const addressData = {
          chainId: chainInfo.chainId,
          chainSymbol: searchChain,
          chainName: chainInfo.chainName,
          address: watchAddress,
          logoUrl: chainInfo.logoUrl,
          isEVM: chainInfo.isEVM,
          timestamp: Date.now(),
        };

        await AddressesStorage.storeAddresses(userWalletGroupId, [addressData]);
        addresses.push(addressData);
        console.log("✅ Watch address stored");
      } else if (privateKey && searchChain) {
        const chainInfo = await getChainInfo(searchChain);

        try {
          const derivedResult = await zapSDKService.derivePrivateKey(
            privateKey,
            searchChain
          );

          if (chainInfo.isEVM) {
            const evmChains = [
              "ETH",
              "MATIC",
              "ARB",
              "OP",
              "BASE",
              "AVAX",
              "BSC",
              "FTM",
              "SONIC",
              "BLAST",
              "PLS",
              "BERA",
              "GNO",
            ];

            for (const evmChain of evmChains) {
              const chainInformation =
                evmChain === searchChain
                  ? chainInfo
                  : await getChainInfo(evmChain);
              const addressData = {
                chainId: chainInformation.chainId,
                chainSymbol: evmChain,
                chainName: chainInformation.chainName,
                address: derivedResult.address,
                logoUrl: chainInformation.logoUrl,
                isEVM: true,
                timestamp: Date.now(),
              };

              const privateKeyData = {
                chainId: chainInformation.chainId,
                chainSymbol: evmChain,
                chainName: chainInformation.chainName,
                privateKey,
                logoUrl: chainInformation.logoUrl,
                isEVM: true,
                timestamp: Date.now(),
              };

              addresses.push(addressData);
              privateKeys.push(privateKeyData);
            }
          } else {
            const addressData = {
              chainId: chainInfo.chainId,
              chainSymbol: searchChain,
              chainName: chainInfo.chainName,
              address: derivedResult.address,
              logoUrl: chainInfo.logoUrl,
              isEVM: false,
              timestamp: Date.now(),
            };

            const privateKeyData = {
              chainId: chainInfo.chainId,
              chainSymbol: searchChain,
              chainName: chainInfo.chainName,
              privateKey,
              logoUrl: chainInfo.logoUrl,
              isEVM: false,
              timestamp: Date.now(),
            };

            addresses.push(addressData);
            privateKeys.push(privateKeyData);
          }

          await AddressesStorage.storeAddresses(userWalletGroupId, addresses);
          await PrivateKeysStorage.storePrivateKeys(
            userWalletGroupId,
            privateKeys
          );

          console.log(
            `✅ Private key and derived address stored for ${searchChain}`
          );
        } catch (error) {
          console.warn(
            `⚠️ Failed to derive ${searchChain} from private key:`,
            error
          );
        }
      } else if (seedPhrase) {
        console.log("🌱 Deriving multi-chain credentials from seed phrase");

        setIsAccountDeriving(true);
        // Store Seedphrase in centralized storage
        await SeedPhraseStorage.storeSeedPhrase(userWalletGroupId, seedPhrase);

        const derivedResult = await zapSDKService.deriveMultiChainAddresses(
          seedPhrase,
          derivationIndex
        );
        setIsAccountDeriving(false);

        for (const chainSymbol in derivedResult.addresses) {
          const chainInfo = await getChainInfo(chainSymbol);
          const addressData = {
            chainId: chainInfo.chainId,
            chainSymbol: chainSymbol,
            chainName: chainInfo.chainName,
            address: derivedResult.addresses[chainSymbol],
            logoUrl: chainInfo.logoUrl,
            isEVM: chainInfo.isEVM,
            timestamp: Date.now(),
          };

          const privateKeyData = {
            chainId: chainInfo.chainId,
            chainSymbol: chainSymbol,
            chainName: chainInfo.chainName,
            privateKey: derivedResult.privateKeys[chainSymbol],
            logoUrl: chainInfo.logoUrl,
            isEVM: chainInfo.isEVM,
            timestamp: Date.now(),
          };

          addresses.push(addressData);
          privateKeys.push(privateKeyData);
        }

        await AddressesStorage.storeAddresses(userWalletGroupId, addresses);
        await PrivateKeysStorage.storePrivateKeys(
          userWalletGroupId,
          privateKeys
        );
      }

      console.log("✅ All credentials stored and derived successfully");
      return { addresses, privateKeys };
    } catch (error) {
      console.error("❌ Failed to store and derive credentials:", error);
      setIsAccountDeriving(false);
      return { addresses: [], privateKeys: [] };
    }
  };

  // Centralized address and private key management
  const getAddresses = async (
    userWalletGroupId?: string
  ): Promise<StoredAddress[] | null> => {
    try {
      const walletId = userWalletGroupId || mainUserWalletGroup?._id;
      if (!walletId) {
        console.error("No wallet group ID provided");
        return null;
      }

      const addresses = await AddressesStorage.getAddresses(walletId);

      if (!addresses) return null;

      return addresses;
    } catch (error) {
      console.error("❌ Failed to get addresses:", error);
      return null;
    }
  };

  const getPrivateKeys = async (
    userWalletGroupId?: string,
    chainSymbol?: string
  ): Promise<StoredPrivateKey[] | null> => {
    try {
      const walletId = userWalletGroupId || mainUserWalletGroup?._id;
      if (!walletId) {
        console.error("No wallet group ID provided");
        return null;
      }

      const privateKeys = await PrivateKeysStorage.getPrivateKeys(walletId);

      if (!privateKeys) return null;

      if (chainSymbol) {
        return privateKeys.filter(
          (pk) => pk.chainSymbol.toLowerCase() === chainSymbol.toLowerCase()
        );
      }

      return privateKeys;
    } catch (error) {
      console.error("❌ Failed to get private keys:", error);
      return null;
    }
  };

  const getAddress = async (
    chainSymbol: string,
    userWalletGroupId?: string
  ): Promise<string | null> => {
    try {
      const walletId = userWalletGroupId || mainUserWalletGroup?._id;
      if (!walletId) {
        console.error("No wallet group ID provided");
        return null;
      }

      console.log(chainSymbol, "chainSymbol");

      const addresses = await getAddresses(walletId);
      const filteredAddresses = addresses?.filter(
        (addr) => addr.chainSymbol.toLowerCase() === chainSymbol.toLowerCase()
      );
      if (filteredAddresses && filteredAddresses.length > 0) {
        return filteredAddresses[0].address;
      }

      // For EVM chains, try to get ETH address first (since all EVM chains use same derivation)
      if (
        addresses?.length &&
        isEVMChain(chainSymbol) &&
        chainSymbol.toUpperCase() !== "ETH"
      ) {
        const ethAddress = addresses?.find(
          (addr) => addr?.chainSymbol?.toUpperCase() === "ETH"
        )?.address;
        if (ethAddress) {
          // Store the ETH address for this EVM chain too
          const chainInfo = await getChainInfo(chainSymbol);

          const addressData = {
            chainId: chainInfo.chainId,
            chainSymbol: chainSymbol,
            chainName: chainInfo.chainName,
            address: ethAddress,
            logoUrl: chainInfo.logoUrl,
            isEVM: chainInfo.isEVM,
            timestamp: Date.now(),
          };

          await AddressesStorage.storeAddresses(walletId, [addressData]);
          console.log(`✅ Reused ETH address for EVM chain ${chainSymbol}`);
          return ethAddress;
        }
      }

      console.error("❌ Failed to get address for chain");
      return null;
    } catch (error) {
      console.error("❌ Failed to get address for chain:", error);
      return null;
    }
  };

  const getPrivateKey = async (
    chainSymbol: string,
    userWalletGroupId?: string
  ): Promise<string | null> => {
    try {
      const walletId = userWalletGroupId || mainUserWalletGroup?._id;
      if (!walletId) {
        console.error("No wallet group ID provided");
        return null;
      }

      // First, try to get stored private key for this specific chain
      const privateKeys = await getPrivateKeys(walletId, chainSymbol);
      if (privateKeys && privateKeys.length > 0) {
        return privateKeys[0].privateKey;
      }

      // For EVM chains, try to get ETH private key first (since all EVM chains use same derivation)
      if (isEVMChain(chainSymbol) && chainSymbol.toUpperCase() !== "ETH") {
        console.log(
          `🔍 EVM chain ${chainSymbol} - checking for existing ETH private key first`
        );
        const ethPrivateKeys = await getPrivateKeys(walletId, "ETH");
        if (ethPrivateKeys && ethPrivateKeys.length > 0) {
          // Store the ETH private key for this EVM chain too
          const ethPrivateKey = ethPrivateKeys[0];
          const chainInfo = await getChainInfo(chainSymbol);

          const privateKeyData = {
            chainId: chainInfo.chainId,
            chainSymbol: chainSymbol,
            chainName: chainInfo.chainName,
            privateKey: ethPrivateKey.privateKey,
            logoUrl: chainInfo.logoUrl,
            isEVM: chainInfo.isEVM,
            timestamp: Date.now(),
          };

          await PrivateKeysStorage.storePrivateKeys(walletId, [privateKeyData]);
          console.log(`✅ Reused ETH private key for EVM chain ${chainSymbol}`);
          return ethPrivateKey.privateKey;
        }
      }

      console.error("❌ Failed to get private key for chain:", error);
      return null;
    } catch (error) {
      console.error("❌ Failed to get private key for chain:", error);
      return null;
    }
  };

  const getSeedPhrase = async (
    userWalletGroupId?: string
  ): Promise<string | null> => {
    try {
      const walletId = userWalletGroupId || mainUserWalletGroup?._id;
      if (!walletId) {
        console.error("No wallet group ID provided");
        return null;
      }

      // First, try to get stored seed phrase from centralized storage
      const storedSeedPhrase = await SeedPhraseStorage.getSeedPhrase(walletId);

      if (storedSeedPhrase?.seedPhrase) {
        console.log(
          "✅ Retrieved seed phrase from centralized storage for wallet:",
          walletId
        );
        return storedSeedPhrase.seedPhrase;
      }

      // If no stored seed phrase, get from credentials and store it
      console.log(
        "🔍 No stored seed phrase found, retrieving from credentials and storing..."
      );
      const credentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          walletId
        );
      if (!credentials) {
        console.error("No credentials found for wallet group:", walletId);
        return null;
      }

      // Check if this is a seed phrase wallet
      if (credentials.class === "SEEDPHRASE" && credentials.credential) {
        // Store the seed phrase in centralized storage for future use
        await SeedPhraseStorage.storeSeedPhrase(
          walletId,
          credentials.credential,
          credentials.derivationIndex
        );

        console.log(
          "✅ Retrieved and stored seed phrase for wallet:",
          walletId
        );
        return credentials.credential;
      }

      console.warn(
        "⚠️ Wallet is not a seed phrase wallet or no seed phrase found"
      );
      return null;
    } catch (error) {
      console.error("❌ Failed to get seed phrase:", error);
      return null;
    }
  };

  const getSeedPhrases = async (): Promise<any[] | null> => {
    try {
      const seedPhrases = await SeedPhraseStorage.getAllSeedPhrases();
      return seedPhrases;
    } catch (error) {
      console.error("❌ Failed to get seed phrases:", error);
      return null;
    }
  };

  // Check if a chain is EVM-compatible
  const isEVMChain = (chainSymbol: string): boolean => {
    const evmChains = [
      "ETH",
      "MATIC",
      "ARB",
      "OP",
      "BASE",
      "AVAX",
      "BNB",
      "BSC",
      "FTM",
      "ONE",
      "GNO",
      "BLAST",
      "PLS",
      "SONIC",
      "BERA",
    ];
    return evmChains.includes(chainSymbol.toUpperCase());
  };

  // Get chain info for storage
  const getChainInfo = async (
    chainSymbol: string
  ): Promise<{
    chainId: number;
    chainName: string;
    logoUrl?: string;
    isEVM: boolean;
  }> => {
    // Default chain info - you can expand this with more chains
    const chainInfoMap: { [key: string]: any } = {
      ETH: { chainId: 1, chainName: "Ethereum", isEVM: true },
      BTC: { chainId: 0, chainName: "Bitcoin", isEVM: false },
      SOL: { chainId: 101, chainName: "Solana", isEVM: false },
      TRX: { chainId: 195, chainName: "Tron", isEVM: false },
      MATIC: { chainId: 137, chainName: "Polygon", isEVM: true },
      ARB: { chainId: 42161, chainName: "Arbitrum", isEVM: true },
      OP: { chainId: 10, chainName: "Optimism", isEVM: true },
      BASE: { chainId: 8453, chainName: "Base", isEVM: true },
      AVAX: { chainId: 43114, chainName: "Avalanche", isEVM: true },
      BNB: { chainId: 56, chainName: "BSC", isEVM: true },
      BSC: { chainId: 56, chainName: "BSC", isEVM: true },
      FTM: { chainId: 250, chainName: "Fantom", isEVM: true },
      ONE: { chainId: 1666600000, chainName: "Harmony", isEVM: true },
      GNO: { chainId: 100, chainName: "Gnosis", isEVM: true },
      BLAST: { chainId: 81457, chainName: "Blast", isEVM: true },
      PLS: { chainId: 369, chainName: "PulseChain", isEVM: true },
      SONIC: { chainId: 146, chainName: "Sonic", isEVM: true },
      BERA: { chainId: 80094, chainName: "Berachain", isEVM: true },
    };

    return (
      chainInfoMap[chainSymbol] || {
        chainId: 1,
        chainName: chainSymbol,
        isEVM: true,
      }
    );
  };

  const createAccounts = async ({
    userWalletGroupId,
    seedPhrase,
    privateKey,
    searchChain,
    watchAddress,
    derivationIndex,
    walletStorageId,
  }: {
    userWalletGroupId: string;
    seedPhrase?: string;
    privateKey?: string;
    searchChain?: string;
    watchAddress?: string;
    derivationIndex?: number;
    walletStorageId: string;
  }): Promise<{ success: boolean; error?: string; shouldRetry?: boolean }> => {
    try {
      const sdk = zapSDKService.getSDK();

      // Derive and store credentials using our centralized system
      const accounts = await storeAndDeriveCredentials({
        userWalletGroupId,
        seedPhrase,
        privateKey,
        searchChain,
        watchAddress,
        derivationIndex,
      });

      const addresses: Record<string, string> = {},
        hashedPrivateKeys: Record<string, string> = {};

      for (let i = 0; i < accounts.addresses.length; i++) {
        addresses[accounts.addresses[i].chainSymbol] =
          accounts.addresses[i].address;
        hashedPrivateKeys[accounts.privateKeys[i].chainSymbol] =
          WalletUtils.hashPrivateKey(accounts.privateKeys[i].privateKey);
      }

      await zapSDKService.executeWithNetworkHandling(
        () =>
          sdk.wallets.addAccountsToWallet({
            userWalletGroupId,
            accounts: accounts.addresses.map((addr) => ({
              walletAddress: addr.address,
              chainSymbol: addr.chainSymbol,
              hashedPrivateKey: hashedPrivateKeys[addr.chainSymbol] || "",
            })),
          }),
        "addAccountsToWallet"
      );
      console.log("✅ Successfully added accounts to SDK without derivation");

      await WalletCredentialsStorage.markWalletAsAccountsCreated(
        walletStorageId,
        userWalletGroupId
      );

      console.log(
        "✅ Accounts created successfully for wallet:",
        walletStorageId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Failed to create accounts:", error);

      // Check if it's a validation error (400 status)
      if (error?.status === 400 || error?.response?.status === 400) {
        console.error(
          "❌ Validation error - stopping retry for wallet:",
          walletStorageId
        );
        await WalletCredentialsStorage.markWalletAsFailed(
          walletStorageId,
          "Validation failed: " + (error?.message || "Invalid parameters")
        );
        return {
          success: false,
          error:
            "Validation failed: " + (error?.message || "Invalid parameters"),
          shouldRetry: false,
        };
      }

      // Check if it's an authentication error (401/403 status)
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        console.error(
          "🔐 Authentication error - stopping retry for wallet:",
          walletStorageId
        );
        await WalletCredentialsStorage.markWalletAsFailed(
          walletStorageId,
          "Authentication failed: " + (error?.message || "Not authenticated")
        );
        return {
          success: false,
          error:
            "Authentication failed: " + (error?.message || "Not authenticated"),
          shouldRetry: false,
        };
      }

      // For other errors, allow retry
      console.warn(
        "⚠️ Temporary error - will retry later for wallet:",
        walletStorageId
      );
      return {
        success: false,
        error: error?.message || "Unknown error",
        shouldRetry: true,
      };
    }
  };

  // Wallet Groups methods
  const refreshUserWalletGroups = async (): Promise<any> => {
    try {
      if (!isWalletAuthenticated || !currentWalletUser) {
        console.log("⚠️ Cannot refresh wallet groups - not authenticated");
        return [];
      }

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        console.log("⚠️ Cannot refresh wallet groups - SDK not available");
        return [];
      }

      console.log("🔄 Refreshing user wallet groups...");
      const uWalletGroups = await zapSDKService.getUserWalletGroups(
        currentWalletUser,
        { useCache: false }
      );

      // Handle both direct array and object with userWalletGroups property
      let walletGroupsArray: IUserWalletGroup[] = [];
      if (Array.isArray(uWalletGroups)) {
        walletGroupsArray = uWalletGroups;
      } else if (
        uWalletGroups &&
        uWalletGroups.userWalletGroups &&
        Array.isArray(uWalletGroups.userWalletGroups)
      ) {
        walletGroupsArray = uWalletGroups.userWalletGroups;
      } else {
        console.warn("⚠️ Invalid user wallet groups response:", uWalletGroups);
        setUserWalletGroups([]);
        return [];
      }

      console.log("✅ User wallet groups refreshed:", walletGroupsArray.length);

      await clearWalletGroupsCache();
      await clearPortfolioCache(mainUserWalletGroup?._id);
      if (walletGroupsArray.length > 0) {
        await saveWalletGroupsToCache(walletGroupsArray);
      }

      setUserWalletGroups(walletGroupsArray);
      return walletGroupsArray;
    } catch (error) {
      console.error("❌ Failed to refresh user wallet groups:", error);
      return [];
    }
  };

  // Portfolio methods with smart caching
  const refreshPortfolio = async (): Promise<void> => {
    try {
      // Handle race condition when switching wallets quickly
      if (isRefreshingPortfolio && portfolioAbortController) {
        portfolioAbortController.abort();
        setPortfolioAbortController(null);
        setIsRefreshingPortfolio(false);
      }

      // Check if user is authenticated before making portfolio request
      if (!isWalletAuthenticated || !currentWalletUser) {
        setError("Wallet User not authenticated");
        return;
      }

      console.log(
        "🔍 Refreshing portfolio for wallet group:",
        mainUserWalletGroup?._id
      ),
        mainUserWalletGroup?.name;
      // Check if we have cached portfolio data for this wallet group
      const cacheStatus = await isPortfolioCacheValid(mainUserWalletGroup?._id);

      if (cacheStatus.isValid) {
        const cachedPortfolio = await loadPortfolioFromCache(
          mainUserWalletGroup?._id
        );
        console.log(
          "🔍 Cached portfolio:",
          cachedPortfolio.mainWalletGroupPortfolio
        );
        if (cachedPortfolio) {
          // Verify the cached portfolio is for the correct wallet group
          const cachedWalletGroupId =
            cachedPortfolio?.mainWalletGroupPortfolio?.walletGroup?._id;
          const currentWalletGroupId = mainUserWalletGroup?.walletGroupId?._id;

          console.log("🔍 Cached wallet group id:", cachedWalletGroupId);
          console.log("🔍 Current wallet group id:", currentWalletGroupId);

          if (cachedWalletGroupId !== currentWalletGroupId) {
            // Ignore cached data and fetch fresh
          } else {
            setPortfolio(cachedPortfolio);
            setLastUpdate(new Date());
            setError(null);

            console.log(
              "🔍 Portfolio cached successfully",
              cacheStatus.shouldRefreshInBackground
            );

            // If cache is stale, refresh in background
            if (cacheStatus.shouldRefreshInBackground) {
              refreshPortfolioInBackground();
            }
            return;
          }
        }
      }

      // If cache is invalid or empty, fetch from API
      setIsRefreshingPortfolio(true);

      // Create new AbortController for this request
      const abortController = new AbortController();
      setPortfolioAbortController(abortController);

      const sdk = zapSDKService.getSDK();

      // Check if portfolio method exists
      if (
        sdk.portfolio &&
        typeof sdk.portfolio.getUserPortfolio === "function"
      ) {
        // Always pass the mainUserWalletGroupId if it exists
        const portfolioOptions = mainUserWalletGroup?._id
          ? {
              mainUserWalletGroupId: mainUserWalletGroup._id,
              bypassCache: true,
            }
          : {};

        // Check if request was aborted before making the call
        if (abortController.signal.aborted) {
          return;
        }

        const portfolioData = await zapSDKService.executeWithNetworkHandling(
          () =>
            sdk.portfolio.getUserPortfolio(currentWalletUser, portfolioOptions),
          "getUserPortfolio"
        );

        console.log(
          "🔍 Portfolio data:",
          portfolioData.mainWalletGroupPortfolio.mainWalletPortfolio.accounts
            .filter((account) => account.balance > 0)
            .map((account) => [account.name, account.balance])
        );

        // Check if request was aborted after API call
        if (abortController.signal.aborted) {
          return;
        }
        // Cache the portfolio data for this wallet group
        if (portfolioData) {
          await savePortfolioToCache(
            portfolioData,
            portfolioOptions.mainUserWalletGroupId
          );
        }

        setPortfolio(portfolioData);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setPortfolio(null);
      }
    } catch (error: any) {
      setError(
        "Failed to refresh portfolio. Please check your authentication."
      );
    } finally {
      setIsRefreshingPortfolio(false);
      setPortfolioAbortController(null);
    }
  };

  const getWalletPortfolio = async (
    userWalletGroupId: string
  ): Promise<any> => {
    try {
      const sdk = zapSDKService.getSDK();

      // Check if portfolio method exists
      if (
        sdk.portfolio &&
        typeof sdk.portfolio.getUserPortfolio === "function"
      ) {
        return await sdk.portfolio.getUserPortfolio(currentWalletUser || "", {
          mainUserWalletGroupId: userWalletGroupId || "",
        });
      } else {
        console.warn("Portfolio method not available on SDK");
        return null;
      }
    } catch (error) {
      console.error("Failed to get wallet portfolio:", error);
      return null;
    }
  };

  // Transaction methods
  const sendTransaction = async (
    toAddress: string,
    amount: number,
    currency: string
  ): Promise<string | null> => {
    try {
      setIsSendingTransaction(true);
      setError(null);

      const sdk = zapSDKService.getSDK();

      // This would need to be implemented based on the specific currency
      let txHash: string;

      if (currency === "ETH") {
        const result = await zapSDKService.sendTransaction({
          fromAddress:
            portfolio?.mainWalletGroupPortfolio?.mainWalletPortfolio
              ?.accounts[0].address || "",
          toAddress: toAddress,
          amount: amount,
          chain: "ETH",
          privateKey: "", // Private key would need to be retrieved securely
        });

        txHash = result; // result is already the transaction hash
      } else {
        // Handle other currencies
        throw new Error(`Currency ${currency} not supported yet`);
      }

      // Refresh portfolio after transaction
      await refreshPortfolio();

      return txHash;
    } catch (error) {
      console.error("Send transaction error:", error);
      setError("Failed to send transaction");
      return null;
    } finally {
      setIsSendingTransaction(false);
    }
  };

  const getTransactionHistory = async (accountId?: string): Promise<any[]> => {
    try {
      if (!accountId) {
        console.warn("No accountId provided for transaction history");
        return [];
      }

      const sdk = zapSDKService.getSDK();
      if (!sdk || !sdk.transactionHistory) {
        console.warn("SDK or transactionHistory module not available");
        return [];
      }

      console.log("Fetching transaction history for accountId:", accountId);

      // Get transaction history using the SDK
      const response = await sdk.transactionHistory.getTransactionHistory({
        accountId: accountId,
        limit: 50,
        offset: 0,
      });

      console.log("Transaction history response:", response);

      // Return the transactions array from the response
      return response.transactions || [];
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      return [];
    }
  };

  // Safe navigation function that waits for router to be ready
  const safeNavigateToWallet = () => {
    // Prevent infinite navigation loops
    if (hasNavigatedToWallet) {
      console.log("Already navigated to wallet, skipping navigation");
      return;
    }

    const attemptNavigation = (attempts: number = 0) => {
      if (attempts >= 5) {
        console.log("Max navigation attempts reached, giving up");
        return;
      }

      try {
        if (router && typeof router.replace === "function") {
          setHasNavigatedToWallet(true);
          router.replace("/dashboard/home/wallet-home/home");
          console.log("✅ Successfully navigated to wallet home");
        } else {
          console.log(`Router not ready, attempt ${attempts + 1}/5`);
          setTimeout(() => attemptNavigation(attempts + 1), 1000);
        }
      } catch (error) {
        console.log(`Navigation attempt ${attempts + 1} failed:`, error);
        setTimeout(() => attemptNavigation(attempts + 1), 1000);
      }
    };

    // Start navigation attempts after a delay
    setTimeout(() => attemptNavigation(), 1000);
  };

  // Retry creating pending wallets
  const retryPendingWallets = async (): Promise<void> => {
    // Skip retry if we're in the middle of creating a wallet or already retrying
    if (
      isCreatingWallet ||
      isRetryingPendingWallets ||
      isAuthenticating ||
      isSendingTransaction
    ) {
      console.log("⏸️ Skipping retry - other operations in progress");
      return;
    }

    setIsRetryingPendingWallets(true);

    try {
      const pendingWallets = await WalletCredentialsStorage.getPendingWallets();
      const accountsPendingWallets =
        await WalletCredentialsStorage.getAccountsPendingWallets();
      const failedWallets = await WalletCredentialsStorage.getFailedWallets();

      console.log("🔄 Retrying pending wallets:", pendingWallets.length);
      console.log(
        "🔄 Retrying accounts pending wallets:",
        accountsPendingWallets.length
      );
      console.log("❌ Failed wallets (won't retry):", failedWallets.length);

      if (failedWallets.length > 0) {
        console.log(
          "Failed wallets details:",
          failedWallets.map((w) => ({
            name: w.name,
            reason: w.failureReason,
            retries: w.retryCount,
          }))
        );
      }

      for (const wallet of pendingWallets) {
        try {
          const sdk = zapSDKService.getSDK();
          let result;

          switch (wallet.class) {
            case WALLET_GROUP_CLASS.SEEDPHRASE:
              result = await sdk.createWalletGroupMultipurpose({
                name: wallet.name,
                seedPhrase: wallet.credential,
                walletType: WALLET_GROUP_TYPE.GENERATED,
              });
              break;
            case WALLET_GROUP_CLASS.PRIVATE_KEY:
              result = await sdk.createWalletGroupMultipurpose({
                name: wallet.name,
                privateKey: wallet.credential,
                walletType: WALLET_GROUP_TYPE.IMPORT,
              });
              break;
            case WALLET_GROUP_CLASS.WATCH:
              result = await sdk.createWalletGroupMultipurpose({
                name: wallet.name,
                watchAddress: wallet.credential,
                walletType: WALLET_GROUP_TYPE.WATCH,
              });
              break;
          }

          if (result?.userWalletGroupId) {
            await WalletCredentialsStorage.markWalletAsCreated(
              wallet.id,
              result?.userWalletGroupId
            );
            console.log(
              "✅ Pending wallet created successfully:",
              wallet.name,
              result?.userWalletGroupId
            );

            // Note: We don't store derived credentials here because:
            // 1. The SDK will handle derivation during account creation
            // 2. This prevents double derivation
            // 3. Credentials will be stored when createAccounts is called
          } else {
            await WalletCredentialsStorage.markWalletCreationAttempt(
              wallet.id,
              false
            );
            console.log("⚠️ Pending wallet creation failed:", wallet.name);
          }
        } catch (error) {
          await WalletCredentialsStorage.markWalletCreationAttempt(
            wallet.id,
            false
          );
          console.error("Error retrying wallet creation:", wallet.name, error);
        }
      }

      for (const account of accountsPendingWallets) {
        console.log('🔄 Retrying accounts for wallet:', {
          id: account.id,
          name: account.name,
          userWalletGroupId: account.userWalletGroupId,
          isCreated: account.isCreated,
          areAccountsCreated: account.areAccountsCreated
        });

        try {
          const result = await createAccounts({
            userWalletGroupId: account.userWalletGroupId || "",
            seedPhrase:
              account.class === WALLET_GROUP_CLASS.SEEDPHRASE
                ? account.credential
                : undefined,
            privateKey:
              account.class === WALLET_GROUP_CLASS.PRIVATE_KEY
                ? account.credential
                : undefined,
            watchAddress:
              account.class === WALLET_GROUP_CLASS.WATCH
                ? account.credential
                : undefined,
            derivationIndex: account.derivationIndex,
            walletStorageId: account.id,
          });

          if (result.success) {
            console.log("✅ Account creation successful for:", account.id);
          } else if (!result.shouldRetry) {
            console.error(
              "❌ Account creation failed permanently for:",
              account.id,
              result.error
            );
            // Don't retry this wallet anymore
          } else {
            console.warn(
              "⚠️ Account creation failed temporarily for:",
              account.id,
              result.error
            );
            // Will retry later
          }
        } catch (error) {
          console.error("Failed to retry accounts pending wallets:", error);
        }
      }
    } catch (error) {
      console.error("Failed to retry pending wallets:", error);
    } finally {
      setIsRetryingPendingWallets(false);
    }
  };

  // SDK access
  const getSDK = (): ZapSDK | null => {
    return zapSDKService.isSDKInitialized() ? zapSDKService.getSDK() : null;
  };

  // Centralized wallet group removal
  const removeWalletGroup = async (
    walletGroupId: string,
    userWalletGroupId: string
  ): Promise<boolean> => {
    try {
      console.log("🗑️ Removing wallet group:", walletGroupId);

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Remove from SDK
      await zapSDKService.deleteWalletGroup(walletGroupId);
      console.log("✅ Wallet group removed from SDK");

      // Remove credentials from storage
      await WalletCredentialsStorage.deleteCredentialsByUserWalletGroupId(
        userWalletGroupId
      );
      console.log("✅ Wallet credentials removed from storage");

      // Clear stored addresses, private keys, and seed phrase
      try {
        await AddressesStorage.clearAddresses(userWalletGroupId);
        await PrivateKeysStorage.clearPrivateKeys(userWalletGroupId);
        await SeedPhraseStorage.clearSeedPhrase(userWalletGroupId);
        console.log(
          "✅ Stored addresses, private keys, and seed phrase cleared"
        );
      } catch (error) {
        console.warn("⚠️ Failed to clear stored credentials:", error);
        // Don't throw - this is not critical for wallet removal
      }

      // Clear portfolio cache for this wallet group
      await clearPortfolioCache(userWalletGroupId);

      // If this was the main wallet group, switch to another one
      if (mainUserWalletGroup?._id === userWalletGroupId) {
        // Get updated wallet groups after removal
        const updatedWalletGroups = await refreshUserWalletGroups();

        console.log(
          "Should switch to new main wallet group:",
          updatedWalletGroups.length > 0
        );

        if (updatedWalletGroups && updatedWalletGroups.length > 0) {
          // Switch to the first available wallet group
          const newMainGroup = updatedWalletGroups[0];
          await switchWallet(newMainGroup._id, updatedWalletGroups);

          await saveWalletGroupsToCache(updatedWalletGroups);

          console.log(
            "✅ Switched to new main wallet group:",
            newMainGroup._id
          );
        } else {
          // No wallet groups left, clear main wallet group
          setMainUserWalletGroup(null);
          setCurrentSeedPhrase(null);
          setPortfolio(null);

          // Clear stored main wallet group ID
          await SecureStore.deleteItemAsync(StorageKeys.MAIN_WALLET_GROUP_ID);

          console.log(
            "✅ No wallet groups remaining, cleared main wallet group"
          );
        }
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to remove wallet group:", error);
      throw error;
    }
  };

  // Wallet switching
  const switchWallet = async (
    userWalletGroupId: string,
    walletGroupsToUse?: any[]
  ): Promise<void> => {
    const groupsToUse = walletGroupsToUse || userWalletGroups;
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Find the selected user wallet group
      const selectedGroup = userWalletGroups.find(
        (group) => group._id === userWalletGroupId
      );

      if (!selectedGroup) {
        throw new Error("Selected wallet group not found");
      }

      // Update the main user wallet group state
      setMainUserWalletGroup(selectedGroup);

      // Clear portfolio state to prevent stale data from previous wallet group
      setPortfolio(null);
      // Load portfolio from cache
      const portfolio = await loadPortfolioFromCache(selectedGroup._id);
      if (portfolio) setPortfolio(portfolio);
      setLastUpdate(null);
      setError(null);
      // Store the main wallet group ID in storage for persistence
      await SecureStore.setItemAsync(
        StorageKeys.MAIN_WALLET_GROUP_ID,
        userWalletGroupId
      );
      // Get credentials for the selected wallet group
      const credentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          userWalletGroupId
        );
      if (credentials?.class === WALLET_GROUP_CLASS.SEEDPHRASE)
        setCurrentSeedPhrase(credentials?.credential.toString() || null);
    } catch (error) {
      console.error("Failed to switch wallet:", error);
      throw error;
    }
  };

  const contextValue: WalletContextType = {
    // State
    isInitialized,
    isWalletAuthenticated,
    isExchangeAuthenticated,
    currentExchangeUser,
    currentWalletUser,
    currentSeedPhrase,
    userWalletGroups,
    isUserWalletGroups,
    mainUserWalletGroup,
    portfolio,
    transactions,
    isLoading,
    isInitializing,
    isAuthenticating,
    isRefreshingPortfolio,
    isSendingTransaction,
    isBackgroundWalletGroupsRefresh,
    isBackgroundPortfolioRefresh,
    error,

    // Authentication
    walletLogin,
    logoutFromExchange,
    exchangeLogin,
    exchangeValidateOtp,

    // Wallet Operations
    createWalletGroup,

    // Portfolio
    refreshPortfolio,
    getWalletPortfolio,
    
    // Wallet Groups
    refreshUserWalletGroups,

    // Transactions
    sendTransaction,
    getTransactionHistory,

    // Real-time Updates
    isConnected,
    lastUpdate,

    // SDK Access
    getSDK,

    // Account Management
    retryPendingWallets,
    isRetryingPendingWallets,
    isCreatingWallet,
    setIsCreatingWallet,
    
    // Wallet Switching
    switchWallet,
    removeWalletGroup,

    // Address and Private Key Management
    getAddresses,
    getPrivateKeys,
    getAddress,
    getPrivateKey,
    getSeedPhrase,
    getSeedPhrases,

    // Account Derivation
    isAccountDeriving,
    setIsAccountDeriving,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
export default WalletContext;

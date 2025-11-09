/**
 * Wallet Context - Zap SDK Integration
 *
 * Provides wallet state management and operations throughout the app.
 * Integrates with the Zap SDK for blockchain operations.
 */

import { WALLET_GROUP_CLASS, WALLET_GROUP_TYPE } from "@/configs/constants";
import { BatchBalanceService } from "@/services/batch-balance.service";
import { exchangeActions } from "@/src/modules/exchange/presentation/state/exchange-slice";
import { setProcessedPortfolio } from "@/state/reducers/portfolio.reducer";
import { IUserWalletGroup, WalletContextType } from "@/types/main";
import {
  ExchangeValidateOtpResponse,
  IUserPortfolio,
  UserModel,
  UserPortfolioData,
  WalletUtils,
  ZapSDK,
} from "@zap/blockchain-sdk";
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
  useRef,
  useState,
} from "react";
import { AppState, InteractionManager } from "react-native";
import { useDispatch } from "react-redux";
import { useChains } from "../chains/chains-context";
import zapSDKService from "../sdk/zap-sdk.service";
import { twoFactorAuthService } from "../services/two-factor-auth.service";
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
  const { loadChainsNow, walletChains, setWalletChains } = useChains();
  const {
    refreshDefaultTokens,
    defaultTokens,
    refreshSupportedCurrenciesForSwap,
    supportedCurrenciesForSwap,
    defaultTokensMap,
    setDefaultTokens,
    setSupportedCurrenciesForSwap,
  } = useSupportedCurrencies();
  const dispatch = useDispatch();
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [isExchangeAuthenticated, setIsExchangeAuthenticated] = useState(false);
  const [currentExchangeUser, setCurrentExchangeUser] = useState<string | null>(
    null
  );
  const [exchangeUserData, setExchangeUserData] = useState<UserModel | null>(
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
  const [mainUserWalletGroup, setMainUserWalletGroup] =
    useState<IUserWalletGroup | null>(null);
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

  // Track wallets currently being derived to prevent duplicate derivations
  const derivingWalletsRef = useRef<Set<string>>(new Set());
  
  // Track if exchange has already routed (to prevent wallet routing after exchange routes)
  const hasNavigatedToExchangeRef = useRef<boolean>(false);

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

  // Track if fast auth check has already run
  const fastAuthCheckCompleteRef = useRef(false);

  useEffect(() => {
    if (isInitialized) {
      // Only run SDK-based check if fast check hasn't already completed
      // This prevents duplicate routing and ensures SDK validates cached IDs
      if (!fastAuthCheckCompleteRef.current) {
        checkAuthenticationAndRoute();
      } else {
        // Fast check already ran, just verify with SDK (but don't re-route)
        console.log(
          "⚡ Fast auth check already completed, verifying with SDK silently"
        );
      }
      setupWebSocketListeners();
      setupAppStateListener();
    }
  }, [isInitialized]);

  // Load cached auth user IDs very early (before SDK initialization)
  useEffect(() => {
    const loadCachedAuthIds = async () => {
      try {
        // Load wallet user ID
        const cachedWalletUserId = await SecureStore.getItemAsync(
          StorageKeys.WALLET_USER_ID
        );

        // Load exchange user ID
        const cachedExchangeUserId = await SecureStore.getItemAsync(
          StorageKeys.EXCHANGE_USER_ID
        );

        // Set state immediately
        if (cachedWalletUserId) {
          setCurrentWalletUser(cachedWalletUserId);
          setIsWalletAuthenticated(true);
          console.log(
            "✅ Wallet user ID loaded from cache:",
            cachedWalletUserId
          );
        }

        if (cachedExchangeUserId) {
          setCurrentExchangeUser(cachedExchangeUserId);
          setIsExchangeAuthenticated(true);
          console.log(
            "✅ Exchange user ID loaded from cache:",
            cachedExchangeUserId
          );
        }

        // If we have cached auth IDs, we can check authentication immediately
        // without waiting for SDK initialization
        // Pass cached values directly to avoid React state timing issues
        if (cachedWalletUserId || cachedExchangeUserId) {
          console.log(
            "🚀 Fast auth check: Using cached user IDs, routing without waiting for SDK"
          );
          // Run immediately with cached values (don't wait for state updates)
          await checkAuthenticationAndRouteFast(
            cachedWalletUserId,
            cachedExchangeUserId
          );
          fastAuthCheckCompleteRef.current = true;
        }
      } catch (error) {
        console.error("Error loading cached auth IDs:", error);
      }
    };
    loadCachedAuthIds();
  }, []);

  // Load userWalletGroups from cache on mount if not already loaded
  useEffect(() => {
    const loadWalletGroupsFromCacheOnMount = async () => {
      // Only load if we don't already have wallet groups
      if (userWalletGroups.length === 0 && !isUserWalletGroups) {
        const cachedWalletGroups = await loadWalletGroupsFromCache();
        if (cachedWalletGroups && cachedWalletGroups.length > 0) {
          setUserWalletGroups(cachedWalletGroups);
          setIsUserWalletGroups(true);
          console.log(
            "✅ User wallet groups loaded from cache on mount:",
            cachedWalletGroups.length
          );

          // Setup main wallet group from cached data
          await setupMainWalletGroup(cachedWalletGroups);
        }
      }
    };
    loadWalletGroupsFromCacheOnMount();
  }, []); // Only run on mount

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

  const setExchangeAndRoute = async (
    exchangeUserId: string,
    isExchangeAuth: boolean,
    shouldRoute: boolean,
    result: {
      exchangeUserId: string | null;
      isExchangeAuth: boolean;
      walletUserId: string | null;
      isWalletAuth: boolean;
      userWalletGroups: any[] | null;
      isUserWalletGroups: boolean;
    },
    exchangeUser?: UserModel | null
  ) => {
    setCurrentExchangeUser(exchangeUserId);
    setIsExchangeAuthenticated(true);

    // Set exchangeUserData if provided
    if (exchangeUser) {
      setExchangeUserData(exchangeUser);
    }

    console.log("✅ Exchange authentication found, routing to exchange");
    result = { ...result, exchangeUserId, isExchangeAuth };

    // Only route if user has completed onboarding (has username) and is not a guest
    if (shouldRoute) {
      let user = exchangeUser || exchangeUserData;
      
      // If we don't have user data, try to fetch it
      if (!user) {
        try {
          user = await zapSDKService.getExchangeUser();
          if (user) {
            setExchangeUserData(user);
          }
        } catch (error) {
          console.log("Could not fetch exchange user:", error);
        }
      }
      
      const isGuest = user?.isGuest || false;
      if (user?.username && !isGuest) {
        console.log("✅ User has username and is not a guest, routing to exchange screen");
        hasNavigatedToExchangeRef.current = true;
        router.replace("/dashboard/home/wallet-home/swap");
      } else if (isGuest) {
        console.log(
          "⚠️ User is a guest, skipping exchange routing"
        );
      } else {
        console.log(
          "⚠️ User doesn't have username yet, skipping routing to allow onboarding completion",
          "User data:", user ? { hasUsername: !!user.username, isGuest: user.isGuest } : "no user data"
        );
      }
    }
    return result;
  };

  const setWalletAndRoute = async (
    walletUserId: string,
    isWalletAuth: boolean,
    shouldRoute: boolean,
    result: {
      exchangeUserId: string | null;
      isExchangeAuth: boolean;
      walletUserId: string | null;
      isWalletAuth: boolean;
      userWalletGroups: IUserWalletGroup[] | null;
      isUserWalletGroups: boolean;
    },
    isExchangeAuth?: boolean
  ) => {
    console.log("Wallet is authenticated with wallet auth", isWalletAuth);
    setCurrentWalletUser(walletUserId);
    setIsWalletAuthenticated(true);
    console.log("Wallet is authenticated with wallet auth", walletUserId);

    result = { ...result, walletUserId, isWalletAuth: true };
    const routeResult = await routeToWallet(
      isWalletAuth,
      walletUserId,
      shouldRoute,
      isExchangeAuth || false
    );
    result = {
      ...result,
      isUserWalletGroups: routeResult?.isUserWalletGroups,
      userWalletGroups: routeResult?.userWalletGroups,
    };
    return result;
  };

  // Fast authentication check using cached user IDs (runs before SDK initialization)
  const checkAuthenticationAndRouteFast = async (
    cachedWalletUserId?: string | null,
    cachedExchangeUserId?: string | null,
    shouldRoute: boolean = true
  ) => {
    const startTime = Date.now();
    console.log("⚡ Fast authentication check (using cached user IDs)");

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
      // Use passed cached values directly (avoid React state timing issues)
      const walletUserId = cachedWalletUserId || currentWalletUser;
      const isWalletAuth = !!walletUserId;
      const exchangeUserId = cachedExchangeUserId || currentExchangeUser;
      const isExchangeAuth = !!exchangeUserId;

      console.log(
        "⚡ Fast check - Wallet Auth:",
        isWalletAuth,
        walletUserId,
        "Exchange Auth:",
        isExchangeAuth,
        exchangeUserId
      );

      // Try to get exchange user data if we have exchange auth but no user data
      let exchangeUserForFastRouting: UserModel | null = exchangeUserData || null;
      if (isExchangeAuth && exchangeUserId && !exchangeUserForFastRouting) {
        // Try to get from storage or fetch if needed
        try {
          const storedUser = await SecureStore.getItemAsync(StorageKeys.USER_PROFILE);
          if (storedUser) {
            exchangeUserForFastRouting = JSON.parse(storedUser);
          }
        } catch (error) {
          console.log("Could not load exchange user from storage:", error);
        }
      }

      if (isExchangeAuth && exchangeUserId) {
        result = await setExchangeAndRoute(
          exchangeUserId,
          isExchangeAuth,
          shouldRoute,
          result,
          exchangeUserForFastRouting || null
        );
      }
      
      // Only route to wallet if exchange hasn't already routed (unless exchange user is a guest)
      const isExchangeGuest = exchangeUserForFastRouting?.isGuest || false;
      const shouldRouteToWalletFast = !hasNavigatedToExchangeRef.current || isExchangeGuest;
      
      if (isWalletAuth && walletUserId && shouldRouteToWalletFast) {
        // For fast path, use cached wallet groups directly - skip all SDK/API calls
        const cachedWalletGroups = await loadWalletGroupsFromCache();

        if (cachedWalletGroups && cachedWalletGroups.length > 0) {
          // Update state immediately so other parts of the app can use it
          setUserWalletGroups(cachedWalletGroups);
          setIsUserWalletGroups(true);

          // Setup main wallet group from cached data
          await setupMainWalletGroup(cachedWalletGroups);

          // We have cached wallet groups - route immediately without any SDK calls
          result = {
            ...result,
            walletUserId,
            isWalletAuth: true,
            userWalletGroups: cachedWalletGroups,
            isUserWalletGroups: true,
          };

          if (shouldRoute && shouldRouteToWalletFast && cachedWalletGroups.length > 0) {
            console.log(
              "✅ Fast path: Routing to wallet with cached wallet groups (no SDK calls)"
            );
            safeNavigateToWallet();
          }
        } else {
          // No cached wallet groups - this shouldn't happen if cache is working
          // But fall back gracefully (will wait for SDK)
          console.log(
            "⚠️ Fast path: No cached wallet groups found, will use normal flow when SDK is ready"
          );
          // Don't call setWalletAndRoute here - it will trigger API calls
          // Just set the result and let SDK-based check handle it later
          result = {
            ...result,
            walletUserId,
            isWalletAuth: true,
            userWalletGroups: null,
            isUserWalletGroups: false,
          };
        }
      }

      const duration = Date.now() - startTime;
      console.log(`⚡ Fast authentication check completed in ${duration}ms`);
      return result;
    } catch (error) {
      console.error("Fast authentication check failed:", error);
      return result;
    }
  };

  const checkAuthenticationAndRoute = async (shouldRoute: boolean = true) => {
    const startTime = Date.now();
    console.log("🚀 Starting authentication and routing check (with SDK)");

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
      // Try cached values first (fast path)
      let walletUserId = currentWalletUser;
      let exchangeUserId = currentExchangeUser;
      let isWalletAuth = !!walletUserId;
      let isExchangeAuth = !!exchangeUserId;

      // Fall back to SDK if cached values not available
      if (!walletUserId) {
        walletUserId = await zapSDKService.getCurrentUserId();
        isWalletAuth = !!walletUserId;
        // Save to cache if found
        if (walletUserId) {
          await SecureStore.setItemAsync(
            StorageKeys.WALLET_USER_ID,
            walletUserId
          );
          setCurrentWalletUser(walletUserId);
          setIsWalletAuthenticated(true);
        }
      }

      let exchangeUserForRouting: UserModel | null = null;

      if (!exchangeUserId) {
        const exchangeUser = await zapSDKService.getExchangeUser();
        exchangeUserId = exchangeUser?._id || null;
        isExchangeAuth = !!exchangeUserId;
        // Save to cache if found
        if (exchangeUserId) {
          await SecureStore.setItemAsync(
            StorageKeys.EXCHANGE_USER_ID,
            exchangeUserId
          );
          setCurrentExchangeUser(exchangeUserId);
          setIsExchangeAuthenticated(true);
          if (exchangeUser) {
            setExchangeUserData(exchangeUser);
            exchangeUserForRouting = exchangeUser;
          }
        }
      } else {
        // We have cached exchangeUserId, verify with SDK
        isExchangeAuth = await zapSDKService.isExchangeAuthenticated();
        // Get fresh user data if we have cached ID
        if (isExchangeAuth && !exchangeUserData) {
          const exchangeUser = await zapSDKService.getExchangeUser();
          if (exchangeUser) {
            setExchangeUserData(exchangeUser);
            exchangeUserForRouting = exchangeUser;
          }
        } else if (exchangeUserData) {
          exchangeUserForRouting = exchangeUserData;
        }
      }

      // Check exchange auth first - exchange routing takes priority
      if (isExchangeAuth && exchangeUserId) {
        result = await setExchangeAndRoute(
          exchangeUserId,
          isExchangeAuth,
          shouldRoute,
          result,
          exchangeUserForRouting || null
        );
      }
      
      // Only route to wallet if exchange hasn't already routed (unless exchange user is a guest)
      const isExchangeGuest = exchangeUserForRouting?.isGuest || false;
      const shouldRouteToWallet = !hasNavigatedToExchangeRef.current || isExchangeGuest;
      
      if (isWalletAuth && walletUserId && shouldRouteToWallet) {
        // User has wallet authentication - check for wallet groups
        result = await setWalletAndRoute(
          walletUserId,
          isWalletAuth,
          shouldRoute && shouldRouteToWallet, // Only route if exchange hasn't routed
          result,
          isExchangeAuth
        );
      } else if (!hasNavigatedToExchangeRef.current) {
        // Only attempt device login if exchange hasn't routed
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
      if (!defaultTokens.length) refreshDefaultTokens();
      if (!supportedCurrenciesForSwap.length)
        refreshSupportedCurrenciesForSwap();

      // Log performance metrics
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`⏱️ Authentication and routing completed in ${duration}ms`);
    }
  };

  // Cache management for wallet groups - Smart caching strategy
  const CACHE_DURATION = {
    SHORT: 2 * 60 * 1000, // 5 minutes - for active users
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
        console.log("⚠️ isPortfolioCacheValid: No wallet ID provided");
        return { isValid: false, shouldRefreshInBackground: false };
      }

      const cacheKey = `${StorageKeys.PORTFOLIO_TIMESTAMP}_${userWalletGroupId}`;
      const dataKey = `${StorageKeys.PORTFOLIO_DATA}_${userWalletGroupId}`;

      console.log(`🔍 Checking cache validity for wallet ${userWalletGroupId}`);
      console.log(`  - Timestamp key: ${cacheKey}`);
      console.log(`  - Data key: ${dataKey}`);

      const timestamp = await SecureStore.getItemAsync(cacheKey);
      const dataExists = await SecureStore.getItemAsync(dataKey);

      console.log(`  - Timestamp exists: ${!!timestamp}`);
      console.log(`  - Data exists: ${!!dataExists}`);

      if (!timestamp) {
        console.log(`  ❌ No timestamp found - cache invalid`);
        return { isValid: false, shouldRefreshInBackground: false };
      }

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      const age = now - cacheTime;
      const ageMinutes = Math.floor(age / (60 * 1000));

      // Portfolio cache has shorter duration than wallet groups (more dynamic data)
      if (age < CACHE_DURATION.SHORT) {
        // Fresh portfolio cache - use immediately
        console.log(
          `  ✅ Cache is FRESH (< ${CACHE_DURATION.SHORT / (60 * 1000)} min)`
        );
        return { isValid: true, shouldRefreshInBackground: false };
      } else if (age < CACHE_DURATION.MEDIUM) {
        // Portfolio cache is getting stale - use it but refresh in background
        console.log(
          `  ✅ Cache is STALE but valid (< ${
            CACHE_DURATION.MEDIUM / (60 * 1000)
          } min)`
        );
        return { isValid: true, shouldRefreshInBackground: true };
      } else if (age < CACHE_DURATION.LONG) {
        // Old portfolio cache - use it but definitely refresh
        console.log(
          `  ✅ Cache is OLD but valid (< ${
            CACHE_DURATION.LONG / (60 * 1000)
          } min)`
        );
        return { isValid: true, shouldRefreshInBackground: true };
      } else {
        // Portfolio cache is too old - invalidate
        console.log(
          `  ❌ Cache is TOO OLD (> ${
            CACHE_DURATION.LONG / (60 * 1000)
          } min) - invalid`
        );
        return { isValid: false, shouldRefreshInBackground: false };
      }
    } catch (error) {
      console.error("❌ Error checking portfolio cache validity:", error);
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
      const timestamp = Date.now();

      console.log(
        `💾 Saving portfolio to cache for wallet ${userWalletGroupId}:`
      );
      console.log(`  - Data key: ${cacheKey}`);
      console.log(`  - Timestamp key: ${timestampKey}`);
      console.log(
        `  - Timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`
      );
      console.log(
        `  - Has mainWalletGroupPortfolio: ${!!portfolioData?.mainWalletGroupPortfolio}`
      );

      const dataString = JSON.stringify(portfolioData);
      console.log(`  - Data size: ${dataString.length} bytes`);

      await SecureStore.setItemAsync(cacheKey, dataString);
      await SecureStore.setItemAsync(timestampKey, timestamp.toString());

      // Verify it was saved
      const verifyTimestamp = await SecureStore.getItemAsync(timestampKey);
      const verifyData = await SecureStore.getItemAsync(cacheKey);
      console.log(`  ✅ Cache saved and verified:`);
      console.log(`     - Timestamp exists: ${!!verifyTimestamp}`);
      console.log(`     - Data exists: ${!!verifyData}`);

      console.log(
        `💾 Portfolio cached successfully for wallet group: ${userWalletGroupId}`
      );
    } catch (error) {
      console.error("❌ Error saving portfolio to cache:", error);
      // Log the error details
      if (error instanceof Error) {
        console.error("  - Error message:", error.message);
        console.error("  - Error stack:", error.stack);
      }
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
        // Clear processed portfolio cache
        await SecureStore.deleteItemAsync(
          `${StorageKeys.PROCESSED_PORTFOLIO}_${userWalletGroupId}`
        );
        await SecureStore.deleteItemAsync(
          `${StorageKeys.PROCESSED_PORTFOLIO_TIMESTAMP}_${userWalletGroupId}`
        );
        // Clear aggregated balances cache
        await SecureStore.deleteItemAsync(
          `${StorageKeys.AGGREGATED_BALANCES}_${userWalletGroupId}`
        );
        await SecureStore.deleteItemAsync(
          `${StorageKeys.AGGREGATED_BALANCES_TIMESTAMP}_${userWalletGroupId}`
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

    // Route to wallet if wallet groups exist - wallet groups take priority
    // But don't route if exchange already routed (unless exchange user is a guest)
    if (shouldRoute && uWalletGroups.userWalletGroups.length > 0) {
      // Check if exchange user is a guest - if so, allow wallet routing
      const exchangeUser = exchangeUserData;
      const isExchangeGuest = exchangeUser?.isGuest || false;
      
      // Don't route to wallet if exchange already routed (unless exchange user is a guest)
      if (hasNavigatedToExchangeRef.current && !isExchangeGuest) {
        console.log("⚠️ Exchange already routed (and not a guest), skipping wallet routing");
      } else if (!isExchangeAuth || isExchangeGuest) {
      console.log(
        "✅ Wallet groups found, routing to wallet screen (wallet groups take priority)"
      );
      safeNavigateToWallet();
      }
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
    result: any,
    skipApiCall: boolean = false // Fast path flag to skip API calls
  ) => {
    const cachedWalletGroups: IUserWalletGroup[] | null =
      await loadWalletGroupsFromCache();

    // For fast path, skip API calls and just return cached data
    if (skipApiCall) {
      console.log(
        "⚡ Fast path: Using cached wallet groups, skipping API call"
      );
      return cachedWalletGroups as IUserWalletGroup[];
    }

    // Normal path: fetch fresh data from API (but don't await it - return cached immediately)
    console.log("🔄 Fetching fresh wallet groups from API (cache disabled)");
    // Fire and forget - don't block on API call
    fetchAndProcessWalletGroups(
      walletUserId,
      isExchangeAuth,
      shouldRoute,
      result
    ).catch((err) => {
      console.warn("Background wallet groups fetch failed:", err);
    });

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
    shouldRoute: boolean = true,
    hasExchangeAuth: boolean = false
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
        if (walletGroups && walletGroups.length > 0) {
          result = {
            ...result,
            userWalletGroups: [...walletGroups],
            isUserWalletGroups: true,
          };
          // Route to wallet if wallet groups found in cache
          // Wallet groups take priority over exchange auth
          // But don't route if exchange already routed (unless exchange user is a guest)
          if (shouldRoute) {
            // Check if exchange user is a guest - if so, allow wallet routing
            const exchangeUser = exchangeUserData;
            const isExchangeGuest = exchangeUser?.isGuest || false;
            
            // Don't route to wallet if exchange already routed (unless exchange user is a guest)
            if (hasNavigatedToExchangeRef.current && !isExchangeGuest) {
              console.log("⚠️ Exchange already routed (and not a guest), skipping wallet routing");
            } else if (!hasExchangeAuth || isExchangeGuest) {
            console.log(
              "✅ Wallet groups found in cache, routing to wallet screen"
            );
            safeNavigateToWallet();
            }
          }
        }
        return result;
      } else {
        result = { ...result, userWalletGroups, isUserWalletGroups: true };

        // Route to wallet if wallet groups exist, regardless of exchange auth
        // Wallet groups take priority over exchange auth
        // But don't route if exchange already routed (unless exchange user is a guest)
        if (shouldRoute && userWalletGroups.length > 0) {
          // Check if exchange user is a guest - if so, allow wallet routing
          const exchangeUser = exchangeUserData;
          const isExchangeGuest = exchangeUser?.isGuest || false;
          
          // Don't route to wallet if exchange already routed (unless exchange user is a guest)
          if (hasNavigatedToExchangeRef.current && !isExchangeGuest) {
            console.log("⚠️ Exchange already routed (and not a guest), skipping wallet routing");
          } else if (!hasExchangeAuth || isExchangeGuest) {
          console.log("✅ Wallet groups found, routing to wallet screen");
          safeNavigateToWallet();
          }
        } else if (!hasExchangeAuth && shouldRoute && !hasNavigatedToExchangeRef.current) {
          // Only check exchange auth condition if no wallet groups and exchange hasn't routed
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
      console.log(
        "🔐 Using persistent device fingerprint for login",
        deviceFingerprint
      );

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
      const deviceToken: string =
        Device.osInternalBuildId ||
        Device.modelId ||
        `unknown-${uniqueId("supaaa-unique-id")}`;

      // Attempt device-based login
      const success = await walletLogin(
        deviceToken,
        JSON.stringify(deviceFingerprint),
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
        console.log(
          "📱 Using existing device fingerprint",
          existingFingerprint
        );
        return JSON.parse(existingFingerprint);
      }

      // Create new persistent fingerprint
      console.log("🔧 Creating new persistent device fingerprint");
      const fingerprint: string =
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

        // Save wallet user ID to cache for fast future access
        await SecureStore.setItemAsync(
          StorageKeys.WALLET_USER_ID,
          result.userId
        );
        console.log("✅ Wallet user ID saved to cache:", result.userId);

        await checkAuthenticationAndRoute(!!exchangeUserData?.username);
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

  const getExchangeUser = async (): Promise<UserModel | null> => {
    try {
      if (!isExchangeAuthenticated) {
        return null;
      }

      // Return cached data if available
      if (exchangeUserData) {
        return exchangeUserData;
      }

      // If no cached data, fetch from SDK
      const userData = await zapSDKService.getExchangeUser();
      return userData;
    } catch (error) {
      console.error("Failed to get exchange user:", error);
      return null;
    }
  };

  const logoutFromExchange = async (): Promise<void> => {
    try {
      // Use the advanced SDK service with network handling
      await zapSDKService.logoutFromExchange();

      // Clear exchange authentication state
      setIsExchangeAuthenticated(false);
      setCurrentExchangeUser(null);
      setExchangeUserData(null);
      
      // Reset exchange routing ref
      hasNavigatedToExchangeRef.current = false;

      // Clear exchange history/activities from Redux state
      dispatch(exchangeActions.clearExchangeActivities());
      console.log("✅ Exchange activities cleared from state");

      // Clear cached exchange user ID
      await SecureStore.deleteItemAsync(StorageKeys.EXCHANGE_USER_ID);
      console.log("✅ Exchange user ID cleared from cache");

      console.log("✅ Exchange logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if SDK logout fails, clear local state
      setIsExchangeAuthenticated(false);
      setCurrentExchangeUser(null);
      setExchangeUserData(null);
      
      // Reset exchange routing ref
      hasNavigatedToExchangeRef.current = false;

      // Clear exchange history/activities from Redux state even on error
      dispatch(exchangeActions.clearExchangeActivities());
      console.log("✅ Exchange activities cleared from state (error path)");

      // Clear cached exchange user ID even on error
      await SecureStore.deleteItemAsync(StorageKeys.EXCHANGE_USER_ID).catch(
        () => {}
      );
    }
  };

  const exchangeLogin = async (email: string): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Use the advanced SDK service with network handling and circuit breaker
      const result = await zapSDKService.sendExchangeOtp(email);

      if (result) {
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
    otp: string,
    totp?: string // 2FA code parameter
  ): Promise<ExchangeValidateOtpResponse | boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Use the advanced SDK service with network handling and circuit breaker
      const result = await zapSDKService.validateExchangeOtp(email, otp, totp) as ExchangeValidateOtpResponse | null | undefined;

      if (result) {
        // Check if the response indicates 2FA is required (successful response with 2FA flag)
        // The API returns 200 with message "2FA Required" and data.twoFA: true
        const requires2FA = 
          result.message?.toLowerCase().includes('2fa required') ||
          result.message?.toLowerCase().includes('2fa') ||
          (result.data as any)?.twoFA === true;

        if (requires2FA && !totp) {
          // 2FA is required but no 2FA code was provided
          // According to the 2FA guide: 
          // 1. validateOtp returns partialToken when 2FA is required
          // 2. Use sdk.twoFA.login(code, partialToken) to complete login
          const partialToken = (result.data as any)?.partialToken;
          
          if (!partialToken) {
            setError("2FA is required but partial token is missing. Please try again.");
            return false;
          }
          
          // Show 2FA input bottom sheet
          return new Promise<ExchangeValidateOtpResponse | boolean>((resolve, reject) => {
            twoFactorAuthService.show2FAInput(async (code: string) => {
              try {
                // According to the guide, backend expects: POST /auth/2fa/login with { code, partialToken }
                // But SDK sends: { email, code, sessionToken }
                // The SDK uses sessionToken but backend expects partialToken
                // We need to make a direct API call with the correct parameters
                const sdk = zapSDKService.getSDK();
                
                // Get the HTTP client from SDK to make direct API call
                // The SDK's httpClient should be accessible
                const httpClient = (sdk as any).httpClient || (sdk as any).client || (sdk as any).exchangeAuth?.httpClient;
                
                if (!httpClient) {
                  throw new Error("HTTP client not available for 2FA login");
                }
                
                // Make direct POST request to /auth/2fa/login with correct parameters
                // Backend expects: { code, partialToken }
                const loginResult = await httpClient.post('/auth/2fa/login', {
                  code,
                  partialToken,
                }) as any;
                
                // Extract data from response if wrapped
                // Backend response structure: { data: { user, token, refreshToken, session }, message, success }
                const resultData = loginResult?.data || loginResult;
                const responseData = resultData?.data || resultData;
                
                // The login result should contain user, token, refreshToken, session
                // According to the guide, backend returns: { data: { user, token, refreshToken, session } }
                if (responseData && (responseData.user || responseData.data?.user)) {
                  const user = responseData.user || responseData.data?.user;
                  const token = responseData.token || responseData.data?.token;
                  const refreshToken = responseData.refreshToken || responseData.data?.refreshToken;
                  const session = responseData.session || responseData.data?.session;
                  
                  // Create a response object matching ExchangeValidateOtpResponse format
                  const authResult = {
                    success: true,
                    message: "Login successful",
                    data: {
                      user: user as any, // SDK response may have different structure
                      token: token || "",
                      refreshToken: refreshToken || "",
                      session: session || {},
                    },
                  } as ExchangeValidateOtpResponse;
                  
                  // Set authentication state
                  // SDK now automatically stores tokens after 2FA login, no need to manually store them
                  const exchangeUserId = user?._id || responseData.userId || null;
                  if (exchangeUserId) {
                    // Store user profile
                    if (user) {
                      await SecureStore.setItemAsync(
                        StorageKeys.USER_PROFILE,
                        JSON.stringify(user)
                      );
                    }
                    
                    setIsExchangeAuthenticated(true);
                    setCurrentExchangeUser(exchangeUserId);
                    setExchangeUserData(user as UserModel | null);

                    // Save exchange user ID to cache
                    await SecureStore.setItemAsync(
                      StorageKeys.EXCHANGE_USER_ID,
                      exchangeUserId
                    );
                    console.log("✅ Exchange user ID saved to cache:", exchangeUserId);

                    await checkAuthenticationAndRoute();
                  }
                  
                  resolve(authResult);
                } else {
                  // Invalid 2FA code or incomplete response
                  reject(new Error("Invalid 2FA code. Please try again."));
                }
              } catch (retryError: any) {
                // Extract error message from the error - this will be displayed in the 2FA input sheet
                const errorMessage = retryError?.message || retryError?.response?.data?.message || "Invalid 2FA code. Please try again.";
                // Reject so the 2FA input sheet can display the error and stay open
                reject(new Error(errorMessage));
              }
            });
          });
        }

        // Check if we have a full user object (login complete)
        // If 2FA was required and we provided it, the response should have a full user object
        const exchangeUserId = result.data?.user?._id || (result.data as any)?.userId || null;
        const hasFullUser = !!result.data?.user;
        
        // Only proceed with login if we have a full user object (not just userId/partialToken)
        if (exchangeUserId && hasFullUser) {
          // Full login successful
        setIsExchangeAuthenticated(true);
        setCurrentExchangeUser(exchangeUserId);
        setExchangeUserData(result.data.user as UserModel | null);

        // Save exchange user ID to cache for fast future access
          await SecureStore.setItemAsync(
            StorageKeys.EXCHANGE_USER_ID,
            exchangeUserId
          );
          console.log("✅ Exchange user ID saved to cache:", exchangeUserId);

        await checkAuthenticationAndRoute();
        return result;
        } else if (requires2FA && totp) {
          // Still requires 2FA even after providing code - invalid code
          // Throw error so the 2FA input can show it
          throw new Error("Invalid 2FA code. Please try again.");
        } else if (requires2FA && !totp) {
          // 2FA is required - don't proceed with login/routing
          // The 2FA input should have been shown above
          // Return false to indicate login is not complete
          return false;
        } else if (!hasFullUser) {
          // No full user object - don't proceed with login
          // This could be a partial response or error
          return false;
      } else {
          // Other response - return as-is but don't proceed with login
          return result;
        }
      } else {
        setError("Invalid OTP");
        return false;
      }
    } catch (error: any) {
      console.error("OTP validation error:", error);
      
      // Check if this is a 2FA required error (401 with 2FA message)
      const is2FAError = 
        error?.response?.status === 401 &&
        (
          error?.response?.data?.message?.toLowerCase().includes('2fa') ||
          error?.response?.data?.message?.toLowerCase().includes('totp') ||
          error?.response?.data?.message?.toLowerCase().includes('two factor') ||
          error?.response?.data?.message?.toLowerCase().includes('authentication code') ||
          error?.response?.data?.message?.toLowerCase().includes('verification code') ||
          (Array.isArray(error?.response?.data?.errors) && 
           error.response.data.errors.some((e: string) => 
             e.toLowerCase().includes('2fa') || 
             e.toLowerCase().includes('totp') ||
             e.toLowerCase().includes('two factor')
           ))
        );
      
      if (is2FAError) {
        // Re-throw the error so the HTTP interceptor can handle it
        // The interceptor will show the 2FA input bottom sheet
        throw error;
      }
      
      // For other errors (like invalid OTP or invalid 2FA code)
      // Check if this is an invalid 2FA code error (500 with "Invalid OTP" message)
      const isInvalid2FA = totp && (
        (error?.response?.status === 500 || error?.response?.status === 400) &&
        (
          error?.response?.data?.message?.toLowerCase().includes('invalid') ||
          error?.response?.data?.message?.toLowerCase().includes('otp') ||
          error?.message?.toLowerCase().includes('invalid')
        )
      );
      
      const errorMessage = error?.message || error?.response?.data?.message || "Invalid OTP. Please try again.";
      
      // If this is an invalid 2FA code error, re-throw so the 2FA input can display it
      // Otherwise, set error and return false
      if (isInvalid2FA) {
        // Re-throw so the promise in the 2FA input callback rejects
        throw new Error(errorMessage);
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const completeOnboarding = async (data: {
    username?: string | null;
    userSource?: string | null;
    referralCode?: string | null;
    userId?: string | null;
  }): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Extract userId from data and use it, or fall back to currentExchangeUser
      const userId = data.userId || currentExchangeUser;

      // Remove userId from data object before passing to SDK
      const { userId: _, ...onboardingData } = data;

      const result = await zapSDKService.completeOnboarding(
        userId,
        onboardingData
      );

      // Prefer user in response if present; otherwise fetch current exchange user
      let user: any = result?.data?.user || null;
      if (!user) {
        try {
          user = await zapSDKService.getExchangeUser();
        } catch {}
      }

      if (user && user._id) {
        setIsExchangeAuthenticated(true);
        setCurrentExchangeUser(user._id);
        setExchangeUserData(user);
        return {
          success: true,
          message: "Onboarding completed successfully",
        };
      }

      return {
        success: !!result?.success,
        message: result?.message || "Failed to complete onboarding",
      };
    } catch (error: any) {
      console.error("Complete onboarding error:", error);
      setError("Failed to complete onboarding");
      return {
        success: false,
        message: error?.message || "Failed to complete onboarding",
      };
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

      setPortfolio(null);
      setLastUpdate(null);
      setError(null);

      // Force refresh when switching to newly created wallet to ensure fresh data
      await switchWallet(result.userWalletGroupId, newUserWalletGroups, true);

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

      // GUARD: Check if derivation is already in progress for this wallet
      if (derivingWalletsRef.current.has(userWalletGroupId)) {
        console.log(
          `⏸️ Derivation already in progress for wallet ${userWalletGroupId}, waiting and checking storage...`
        );
        // Wait a bit and check storage - derivation might have completed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const existingAddresses = await AddressesStorage.getAddresses(
          userWalletGroupId
        );
        const existingPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
          userWalletGroupId
        );
        if (existingAddresses && existingAddresses.length > 0) {
          console.log(
            `✅ Found addresses after waiting (derivation completed): ${existingAddresses.length} addresses`
          );
          return {
            addresses: existingAddresses,
            privateKeys: existingPrivateKeys || [],
          };
        }
        // If still not found, proceed with derivation (original call might have failed)
        console.log(
          `⚠️ Still no addresses found after waiting, proceeding with derivation...`
        );
      }

      // Mark this wallet as being derived
      derivingWalletsRef.current.add(userWalletGroupId);

      try {
        // FIRST: Check if addresses and private keys are already stored
        // If they exist, return them immediately without deriving again
        console.log(
          `🔍 Checking for existing stored addresses and private keys for wallet: ${userWalletGroupId}`
        );
        const existingAddresses = await AddressesStorage.getAddresses(
          userWalletGroupId
        );
        const existingPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
          userWalletGroupId
        );

        console.log(`🔍 Storage check result:`, {
          existingAddressesCount: existingAddresses?.length || 0,
          existingPrivateKeysCount: existingPrivateKeys?.length || 0,
          existingAddresses: existingAddresses ? "exists" : "null",
          existingPrivateKeys: existingPrivateKeys ? "exists" : "null",
        });

        if (
          existingAddresses &&
          existingAddresses.length > 0 &&
          existingPrivateKeys &&
          existingPrivateKeys.length > 0
        ) {
          console.log(
            `✅ Found existing stored addresses (${existingAddresses.length}) and private keys (${existingPrivateKeys.length}) - skipping derivation`
          );
          return {
            addresses: existingAddresses,
            privateKeys: existingPrivateKeys,
          };
        } else if (existingAddresses && existingAddresses.length > 0) {
          // If we have addresses but no private keys, log a warning but still return what we have
          console.log(
            `⚠️ Found existing addresses (${
              existingAddresses.length
            }) but no private keys (${
              existingPrivateKeys?.length || 0
            }). Returning addresses only.`
          );
          return {
            addresses: existingAddresses,
            privateKeys: existingPrivateKeys || [],
          };
        }

        console.log(
          "ℹ️ No existing addresses found - proceeding with derivation..."
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

          await AddressesStorage.storeAddresses(userWalletGroupId, [
            addressData,
          ]);
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
          await SeedPhraseStorage.storeSeedPhrase(
            userWalletGroupId,
            seedPhrase
          );

          // Use InteractionManager to defer heavy computation and allow UI to remain responsive
          // This prevents the app from freezing during crypto derivation
          const derivedResult = await new Promise<any>((resolve, reject) => {
            // Wait for any pending interactions to complete, then run derivation
            InteractionManager.runAfterInteractions(() => {
              // Further defer to next tick to ensure UI is fully responsive
              setTimeout(async () => {
                try {
                  const result = await zapSDKService.deriveMultiChainAddresses(
                    seedPhrase,
                    derivationIndex
                  );
                  resolve(result);
                } catch (error) {
                  reject(error);
                }
              }, 100); // Small delay to ensure UI thread is free
            });
          });

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

          console.log(
            `💾 Storing ${addresses.length} addresses and ${privateKeys.length} private keys for wallet: ${userWalletGroupId}`
          );
          await AddressesStorage.storeAddresses(userWalletGroupId, addresses);
          await PrivateKeysStorage.storePrivateKeys(
            userWalletGroupId,
            privateKeys
          );

          // Verify storage was successful
          const verifyAddresses = await AddressesStorage.getAddresses(
            userWalletGroupId
          );
          const verifyPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
            userWalletGroupId
          );
          console.log(
            `✅ Storage verification: ${
              verifyAddresses?.length || 0
            } addresses and ${
              verifyPrivateKeys?.length || 0
            } private keys stored for wallet: ${userWalletGroupId}`
          );
        }

        console.log("✅ All credentials stored and derived successfully");
        return { addresses, privateKeys };
      } catch (innerError) {
        console.error("❌ Error in derivation logic:", innerError);
        throw innerError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error("❌ Failed to store and derive credentials:", error);
      setIsAccountDeriving(false);
      return { addresses: [], privateKeys: [] };
    } finally {
      // Always remove from deriving set when done
      derivingWalletsRef.current.delete(userWalletGroupId);
      console.log(`✅ Removed wallet ${userWalletGroupId} from deriving set`);
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

      let addresses = await AddressesStorage.getAddresses(walletId);

      // If no addresses found, try to derive them on-demand
      if (!addresses || addresses.length === 0) {
        // Check if already deriving for this wallet to prevent duplicate derivations
        if (derivingWalletsRef.current.has(walletId)) {
          console.log(
            "⏳ Address derivation already in progress for wallet:",
            walletId
          );
          // Wait a bit and retry getting addresses
          await new Promise((resolve) => setTimeout(resolve, 500));
          addresses = await AddressesStorage.getAddresses(walletId);
          if (addresses && addresses.length > 0) {
            return addresses;
          }
          return null;
        }

        console.log(
          "⚠️ No stored addresses found, attempting to derive on-demand for wallet:",
          walletId
        );

        // Check if we have credentials for this wallet
        const walletCredentials =
          await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
            walletId
          );

        if (walletCredentials && walletCredentials.credential) {
          try {
            // Mark wallet as being derived
            derivingWalletsRef.current.add(walletId);

            console.log(
              "🔄 Deriving addresses on-demand for wallet:",
              walletId
            );
            // Use InteractionManager to defer heavy computation and allow UI to remain responsive
            // This prevents the app from freezing during crypto derivation
            const derived = await new Promise<{
              addresses: StoredAddress[];
              privateKeys: any[];
            }>((resolve, reject) => {
              InteractionManager.runAfterInteractions(() => {
                setTimeout(async () => {
                  try {
                    const result = await storeAndDeriveCredentials({
                      userWalletGroupId: walletId,
                      seedPhrase:
                        walletCredentials.class ===
                        WALLET_GROUP_CLASS.SEEDPHRASE
                          ? walletCredentials.credential
                          : undefined,
                      privateKey:
                        walletCredentials.class ===
                        WALLET_GROUP_CLASS.PRIVATE_KEY
                          ? walletCredentials.credential
                          : undefined,
                      watchAddress:
                        walletCredentials.class === WALLET_GROUP_CLASS.WATCH
                          ? walletCredentials.credential
                          : undefined,
                      derivationIndex: walletCredentials.derivationIndex,
                    });
                    resolve(result);
                  } catch (error) {
                    reject(error);
                  }
                }, 100); // Small delay to ensure UI thread is free
              });
            });

            if (derived.addresses && derived.addresses.length > 0) {
              console.log(
                "✅ Successfully derived addresses on-demand:",
                derived.addresses.length
              );
              addresses = derived.addresses;
            }
          } catch (deriveError) {
            console.error(
              "❌ Failed to derive addresses on-demand:",
              deriveError
            );
          } finally {
            // Remove from deriving set
            derivingWalletsRef.current.delete(walletId);
          }
        } else {
          console.warn(
            "⚠️ No credentials found for wallet, cannot derive addresses:",
            walletId
          );
        }
      }

      return addresses || null;
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

      console.log(
        `📍 getAddress called for ${chainSymbol}, walletId: ${walletId}`
      );

      // getAddresses will now derive addresses on-demand if not found
      const addresses = await getAddresses(walletId);
      const filteredAddresses = addresses?.filter(
        (addr) => addr.chainSymbol.toLowerCase() === chainSymbol.toLowerCase()
      );
      if (filteredAddresses && filteredAddresses.length > 0) {
        console.log(`✅ Found address for ${chainSymbol}`);
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

          // Get existing addresses and add the new one
          const existingAddresses =
            (await AddressesStorage.getAddresses(walletId)) || [];
          const updatedAddresses = [...existingAddresses, addressData];
          await AddressesStorage.storeAddresses(walletId, updatedAddresses);
          console.log(`✅ Reused ETH address for EVM chain ${chainSymbol}`);
          return ethAddress;
        }
      }

      console.warn(
        `⚠️ No address found for ${chainSymbol} (even after on-demand derivation attempt)`
      );
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
      console.log("📝 createAccounts called:", {
        userWalletGroupId,
        walletStorageId,
        hasSeedPhrase: !!seedPhrase,
        hasPrivateKey: !!privateKey,
        hasWatchAddress: !!watchAddress,
        derivationIndex,
      });

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Derive and store credentials using our centralized system
      console.log("🔄 Step 1: Calling storeAndDeriveCredentials...");
      const accounts = await storeAndDeriveCredentials({
        userWalletGroupId,
        seedPhrase,
        privateKey,
        searchChain,
        watchAddress,
        derivationIndex,
      });

      console.log("✅ Step 1 Complete: storeAndDeriveCredentials finished:", {
        addressesCount: accounts.addresses.length,
        privateKeysCount: accounts.privateKeys.length,
        addresses: accounts.addresses.map((a) => ({
          chain: a.chainSymbol,
          address: a.address.substring(0, 10) + "...",
        })),
      });

      if (accounts.addresses.length === 0) {
        console.error(
          "❌ Step 1 Failed: No addresses derived! Cannot add accounts to wallet."
        );
        return {
          success: false,
          error: "No addresses were derived",
          shouldRetry: true,
        };
      }

      console.log("🔄 Step 2: Preparing account data for SDK...");
      const addresses: Record<string, string> = {},
        hashedPrivateKeys: Record<string, string> = {};

      for (let i = 0; i < accounts.addresses.length; i++) {
        addresses[accounts.addresses[i].chainSymbol] =
          accounts.addresses[i].address;
        hashedPrivateKeys[accounts.privateKeys[i].chainSymbol] =
          WalletUtils.hashPrivateKey(accounts.privateKeys[i].privateKey);
      }

      const accountsToAdd = accounts.addresses.map((addr) => ({
        walletAddress: addr.address,
        chainSymbol: addr.chainSymbol,
        hashedPrivateKey: hashedPrivateKeys[addr.chainSymbol] || "",
      }));

      console.log("🔄 Step 3: Preparing to call SDK addAccountsToWallet:", {
        userWalletGroupId,
        accountsCount: accountsToAdd.length,
        chainSymbols: accountsToAdd.map((a) => a.chainSymbol),
        accountDetails: accountsToAdd.map((a) => ({
          chain: a.chainSymbol,
          address: a.walletAddress.substring(0, 10) + "...",
          hasHash: !!a.hashedPrivateKey,
        })),
      });

      try {
        console.log("🔄 Step 4: Calling SDK addAccountsToWallet NOW...");

        // Add timeout to prevent hanging forever
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("addAccountsToWallet timed out after 30 seconds"));
          }, 30000); // 30 second timeout
        });

        const sdkCallPromise = zapSDKService.executeWithNetworkHandling(() => {
          console.log(
            "🔄 Inside SDK executeWithNetworkHandling wrapper, calling sdk.wallets.addAccountsToWallet..."
          );
          const result = sdk.wallets.addAccountsToWallet({
            userWalletGroupId,
            accounts: accountsToAdd,
          });
          console.log("🔄 SDK call returned (may be promise):", typeof result);
          return result;
        }, "addAccountsToWallet");

        console.log("⏳ Waiting for SDK call to complete...");
        const addAccountsResult = (await Promise.race([
          sdkCallPromise,
          timeoutPromise,
        ])) as any;

        console.log("✅ Step 4 Complete: Successfully added accounts to SDK:", {
          userWalletGroupId,
          accountsCount: accountsToAdd.length,
          result: addAccountsResult,
          resultType: typeof addAccountsResult,
        });
      } catch (addAccountsError) {
        console.error("❌ Step 4 Failed: Failed to add accounts to SDK:", {
          error: addAccountsError,
          message:
            addAccountsError instanceof Error
              ? addAccountsError.message
              : String(addAccountsError),
          stack:
            addAccountsError instanceof Error
              ? addAccountsError.stack
              : undefined,
          errorType: typeof addAccountsError,
          errorKeys:
            addAccountsError && typeof addAccountsError === "object"
              ? Object.keys(addAccountsError)
              : "not an object",
        });
        throw addAccountsError; // Re-throw to be caught by outer try-catch
      }

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

  const normalizeUserTokenList = (
    userTokenList: IUserPortfolio[] | { data: IUserPortfolio[] } | undefined
  ): IUserPortfolio[] => {
    return Array.isArray(userTokenList)
      ? userTokenList
      : (userTokenList as { data: IUserPortfolio[] })?.data || [];
  };

  // Portfolio methods with smart caching
  const refreshPortfolio = async (
    explicitWalletId?: string,
    bypassCache?: boolean
  ): Promise<void> => {
    try {
      // Handle race condition when switching wallets quickly
      if (isRefreshingPortfolio && portfolioAbortController) {
        portfolioAbortController.abort();
        setPortfolioAbortController(null);
        setIsRefreshingPortfolio(false);
      }

      setIsRefreshingPortfolio(true);

      // Check if user is authenticated before making portfolio request
      if (!isWalletAuthenticated || !currentWalletUser) {
        setError("Wallet User not authenticated");
        setIsRefreshingPortfolio(false);
        return;
      }

      // IMPORTANT: Capture the current wallet ID at the start of the function
      // This prevents race conditions where the wallet might change during execution
      const walletIdToRefresh = explicitWalletId || mainUserWalletGroup?._id;

      if (!walletIdToRefresh) {
        console.warn(
          "⚠️ No wallet ID available for portfolio refresh, skipping..."
        );
        setError("No wallet ID available for portfolio refresh");
        setIsRefreshingPortfolio(false);
        return;
      }

      // Check if we have cached portfolio data for this wallet group
      const cacheStatus = await isPortfolioCacheValid(walletIdToRefresh);

      if (cacheStatus.isValid && !bypassCache) {
        const cachedPortfolio = await loadPortfolioFromCache(walletIdToRefresh);
        console.log(
          "🔍 Cached portfolio:",
          cachedPortfolio.mainWalletGroupPortfolio
        );
        if (cachedPortfolio) {
          // Verify the cached portfolio is for the correct wallet group
          const cachedWalletGroupId =
            cachedPortfolio?.mainWalletGroupPortfolio?.walletGroup?._id;
          const currentWalletGroupId = mainUserWalletGroup?.walletGroupId?._id;

          if (cachedWalletGroupId !== currentWalletGroupId) {
            // Ignore cached data and fetch fresh
            console.log(
              "⚠️ Cached wallet group ID doesn't match, fetching fresh"
            );
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
              console.log("refreshing portfolio in background");
              refreshPortfolio(walletIdToRefresh, true);
            } else {
              setIsRefreshingPortfolio(false);
            }
            return;
          }
        }
      }

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
        // Use the captured walletIdToRefresh to ensure we refresh the correct wallet
        const portfolioOptions = walletIdToRefresh
          ? {
              mainUserWalletGroupId: walletIdToRefresh,
              bypassCache: true,
            }
          : {};

        // Check if request was aborted before making the call
        if (abortController.signal.aborted) {
          return;
        }

        // STEP 1: Get portfolio data from backend (token list with metadata)
        console.log(
          `🔄 Calling getUserPortfolio with bypassCache: ${portfolioOptions.bypassCache}, walletId: ${walletIdToRefresh}`
        );

        let portfolioData = await zapSDKService.executeWithNetworkHandling(
          () =>
            sdk.portfolio.getUserPortfolio(currentWalletUser, portfolioOptions),
          "getUserPortfolio"
        );

        console.log("portfolioData.userTokenList", portfolioData.userTokenList);

        if (!portfolioData) {
          console.error(
            "❌ getUserPortfolio returned null/undefined - cannot proceed"
          );
          setIsRefreshingPortfolio(false);
          return;
        }

        console.log(
          `✅ getUserPortfolio completed - checking token statuses...`
        );

        // Debug: Check token statuses in the fresh portfolio response
        if (!portfolioData.userTokenList) {
          console.warn("⚠️ portfolioData.userTokenList is missing or null");
        } else {
          const userTokenList = normalizeUserTokenList(
            portfolioData.userTokenList
          );

          console.log(`🔍 Fresh portfolio response from backend:`, {
            totalTokens: userTokenList.length,
            enabledCount: userTokenList.filter((t) => t.status === "ENABLED")
              .length,
            disabledCount: userTokenList.filter((t) => t.status === "DISABLED")
              .length,
            hiddenCount: userTokenList.filter((t) => t.status === "HIDDEN")
              .length,
          });
        }

        // Check if wallet changed during the async operation
        // If it did, abort this refresh to prevent showing wrong wallet's data
        if (mainUserWalletGroup?._id !== walletIdToRefresh) {
          console.log(
            "⚠️ Wallet changed during portfolio fetch, aborting refresh...",
            `Expected: ${walletIdToRefresh}, Got: ${mainUserWalletGroup?._id}`
          );
          setIsRefreshingPortfolio(false);
          return;
        }

        // Check if request was aborted after API call
        if (abortController.signal.aborted) {
          return;
        }

        if (!portfolioData) {
          setPortfolio(null);
          setIsRefreshingPortfolio(false);
          return;
        }

        // STEP 2: Get wallet addresses for all chains
        const addressesByChain = new Map<string, string>();

        if (!walletChains || walletChains.length === 0) {
          await loadChainsNow();

          if (!walletChains || walletChains.length === 0) {
            // Set Timeout to retry in 1 second
            await setTimeout(async () => {}, 500);
          }
        }

        if (walletChains && walletChains.length > 0) {
          console.log(
            `📍 Getting addresses for wallet: ${walletIdToRefresh} (captured wallet ID)`
          );
          for (const chain of walletChains) {
            try {
              // Pass explicit walletIdToRefresh to getAddress to avoid stale state
              const address = await getAddress(chain.symbol, walletIdToRefresh);
              if (address) {
                addressesByChain.set(chain.symbol, address);
              } else {
                console.warn(`  ⚠️ No address found for ${chain.symbol}`);
              }
            } catch (error) {
              console.warn(
                `Failed to get address for chain ${chain.symbol}:`,
                error
              );
            }
          }
          console.log(
            `📍 Collected ${addressesByChain.size} addresses for wallet ${walletIdToRefresh}`
          );
        }

        // STEP 4: Extract tokens from portfolio and fetch batch balances
        if (addressesByChain.size > 0 && portfolioData.userTokenList) {
          try {
            const tokens = BatchBalanceService.extractTokensFromPortfolio(
              portfolioData,
              addressesByChain
            );

            if (tokens.length > 0) {
              // STEP 5: Group tokens by address
              const addressGroups =
                BatchBalanceService.groupTokensByAddress(tokens);

              // STEP 6: Create batch requests for each address
              const batchRequests =
                BatchBalanceService.createBatchRequests(addressGroups);

              // STEP 7: Fetch batch balances for all addresses in parallel
              if (batchRequests.length > 0) {
                console.log(
                  `🔄 Fetching batch balances for ${batchRequests.length} address(es) with ${tokens.length} tokens`
                );

                const batchResponses =
                  await BatchBalanceService.fetchBatchBalancesForAllAddresses(
                    batchRequests
                  );

                // STEP 8: Merge all results (including native balances)
                const { balanceResults, nativeBalances } =
                  BatchBalanceService.mergeBatchResults(batchResponses);

                // STEP 9: Update portfolio with batch balance results
                portfolioData =
                  BatchBalanceService.updatePortfolioWithBatchBalances(
                    portfolioData,
                    balanceResults,
                    nativeBalances,
                    defaultTokensMap
                  ) as UserPortfolioData;
              }
            }
          } catch (batchError) {
            console.warn(
              "⚠️ Batch balance fetch failed, using portfolio balances:",
              batchError
            );
          }
        }

        // Final check: Verify wallet hasn't changed before setting state
        if (mainUserWalletGroup?._id !== walletIdToRefresh) {
          console.log(
            "⚠️ Wallet changed before setting portfolio state, aborting...",
            `Expected: ${walletIdToRefresh}, Got: ${mainUserWalletGroup?._id}`
          );
          setIsRefreshingPortfolio(false);
          return;
        }

        // STEP 9: Cache and set portfolio
        if (portfolioData) {
          // CRITICAL: Use the captured walletIdToRefresh to ensure we cache for the correct wallet
          // This prevents race conditions where the wallet might change during the refresh
          console.log(
            `💾 Caching portfolio for wallet: ${walletIdToRefresh} (captured at start of refresh)`
          );
          await savePortfolioToCache(portfolioData, walletIdToRefresh);
        }

        // Cast to UserPortfolioData for setPortfolio (it accepts any)
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
        accountId,
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
  const retryPendingWallets = async (force: boolean = false): Promise<void> => {
    // Skip retry if we're in the middle of creating a wallet or already retrying
    // Unless force=true (e.g., explicitly called after wallet creation)
    if (
      !force &&
      (isCreatingWallet ||
        isRetryingPendingWallets ||
        isAuthenticating ||
        isSendingTransaction)
    ) {
      console.log("⏸️ Skipping retry - other operations in progress:", {
        isCreatingWallet,
        isRetryingPendingWallets,
        isAuthenticating,
        isSendingTransaction,
        force,
      });
      return;
    }

    console.log("🔄 retryPendingWallets called - starting...", { force });
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

      // If no accounts pending wallets, log all credentials to debug
      if (accountsPendingWallets.length === 0) {
        console.warn("⚠️ No accounts pending wallets found!");
        const allCredentials =
          await WalletCredentialsStorage.getAllCredentials();
        console.log(
          "📋 All stored wallet credentials:",
          Object.values(allCredentials).map((w) => ({
            id: w.id,
            name: w.name,
            userWalletGroupId: w.userWalletGroupId,
            isCreated: w.isCreated,
            areAccountsCreated: w.areAccountsCreated,
            retryCount: w.retryCount,
            isFailed: w.isFailed,
          }))
        );
      }

      // Debug: Log details of accounts pending wallets
      if (accountsPendingWallets.length > 0) {
        console.log(
          "📋 Accounts pending wallets details:",
          accountsPendingWallets.map((w) => ({
            id: w.id,
            name: w.name,
            userWalletGroupId: w.userWalletGroupId,
            isCreated: w.isCreated,
            areAccountsCreated: w.areAccountsCreated,
            hasCredential: !!w.credential,
          }))
        );
      }

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
        console.log("🔄 Retrying accounts for wallet:", {
          id: account.id,
          name: account.name,
          userWalletGroupId: account.userWalletGroupId,
          isCreated: account.isCreated,
          areAccountsCreated: account.areAccountsCreated,
          hasCredential: !!account.credential,
          class: account.class,
        });

        try {
          if (!account.userWalletGroupId) {
            console.error("❌ No userWalletGroupId for account:", account.id);
            continue;
          }

          if (!account.credential) {
            console.error("❌ No credential for account:", account.id);
            continue;
          }

          console.log("🔄 Calling createAccounts for wallet:", {
            walletStorageId: account.id,
            userWalletGroupId: account.userWalletGroupId,
            name: account.name,
            class: account.class,
            hasCredential: !!account.credential,
            derivationIndex: account.derivationIndex,
          });

          const result = await createAccounts({
            userWalletGroupId: account.userWalletGroupId,
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

          console.log("📊 createAccounts result:", {
            success: result.success,
            shouldRetry: result.shouldRetry,
            error: result.error,
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
          console.error(
            "❌ Failed to retry accounts pending wallets:",
            account.id,
            error
          );
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
      console.log("🗑️ Removing wallet group:", {
        walletGroupId,
        userWalletGroupId,
      });

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Remove from SDK
      // If wallet group doesn't exist (404), continue with cleanup anyway
      // This handles cases where the wallet group was already deleted
      try {
        await zapSDKService.deleteWalletGroup(walletGroupId);
        console.log("✅ Wallet group removed from SDK");
      } catch (deleteError: any) {
        // Check for 404 "not found" error in multiple ways
        // The error structure can vary depending on how it's wrapped
        // Error can have: code="HTTP_ERROR", message="Wallet group not found"
        // or status/statusCode=404, or response.status=404
        const errorMessage = (deleteError?.message || "").toLowerCase();
        const errorCode = deleteError?.code;
        const errorStatus =
          deleteError?.status ||
          deleteError?.statusCode ||
          deleteError?.response?.status;

        const isNotFoundError =
          errorMessage.includes("not found") ||
          errorMessage.includes("wallet group not found") ||
          errorStatus === 404 ||
          (errorCode === "HTTP_ERROR" && errorMessage.includes("not found"));

        if (isNotFoundError) {
          console.warn(
            "⚠️ Wallet group not found on backend (may already be deleted), continuing with local cleanup...",
            {
              errorCode: errorCode,
              errorMessage: deleteError?.message,
              errorStatus: errorStatus,
            }
          );
          // Don't throw - continue with cleanup
        } else {
          // For other errors, re-throw
          console.error(
            "❌ Unexpected error deleting wallet group:",
            deleteError
          );
          throw deleteError;
        }
      }

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

      // Clear all caches for this wallet group (portfolio, processed portfolio, aggregated balances)
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

          // Save updated wallet groups list to cache (old one already removed)
          await saveWalletGroupsToCache(updatedWalletGroups);

          console.log(
            "✅ Switched to new main wallet group:",
            newMainGroup._id
          );
        } else {
          // No wallet groups left, clear all related caches
          setMainUserWalletGroup(null);
          setCurrentSeedPhrase(null);
          setPortfolio(null);

          // Clear stored main wallet group ID
          await SecureStore.deleteItemAsync(StorageKeys.MAIN_WALLET_GROUP_ID);

          // Clear user wallet groups cache since there are none left
          await clearWalletGroupsCache();

          console.log(
            "✅ No wallet groups remaining, cleared main wallet group and cache"
          );
        }
      } else {
        // Not the main wallet group, but we still need to update the cache
        // Refresh and save the updated wallet groups list
        const updatedWalletGroups = await refreshUserWalletGroups();
        if (updatedWalletGroups && updatedWalletGroups.length > 0) {
          await saveWalletGroupsToCache(updatedWalletGroups);
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
    walletGroupsToUse?: any[],
    forceRefresh: boolean = false
  ): Promise<void> => {
    const groupsToUse = walletGroupsToUse || userWalletGroups;
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Find the selected user wallet group
      const selectedGroup = groupsToUse.find(
        (group) => group._id === userWalletGroupId
      );

      if (!selectedGroup) {
        throw new Error("Selected wallet group not found");
      }

      // IMPORTANT: Update the main user wallet group state FIRST
      setMainUserWalletGroup(selectedGroup);

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
      if (credentials?.class === WALLET_GROUP_CLASS.SEEDPHRASE) {
        setCurrentSeedPhrase(credentials?.credential.toString() || null);
      }

      const cacheStatus = await isPortfolioCacheValid(userWalletGroupId);
      console.log(`📋 Cache status for ${userWalletGroupId}:`, cacheStatus);

      let cachedPortfolio = null;
      if (cacheStatus.isValid) {
        cachedPortfolio = await loadPortfolioFromCache(userWalletGroupId);
      }

      // If we have a valid cached portfolio, load it immediately to prevent UI clearing
      if (
        cachedPortfolio &&
        cachedPortfolio?.mainWalletGroupPortfolio?.mainWalletPortfolio
      ) {
        // Set cached portfolio immediately - this prevents the asset list from clearing
        setPortfolio(cachedPortfolio);
        setLastUpdate(new Date());
        setError(null);
      } else {
        // No valid cache - we need to refresh immediately
        // Only set to null if forceRefresh is false (to show loading state)
        if (!forceRefresh) {
          setPortfolio(null);
          setLastUpdate(null);
          setError(null);
        } else {
          console.log(
            `🔄 Force refresh requested for wallet ${userWalletGroupId} (no cache)`
          );
        }
      }
    } catch (error) {
      console.error("Failed to switch wallet:", error);
      setError("Failed to switch wallet");
      throw error;
    }
  };

  const loadAllDataFromCache = async () => {
    const cachedWalletUserId = await SecureStore.getItemAsync(
      StorageKeys.WALLET_USER_ID
    );
    setCurrentWalletUser(cachedWalletUserId);
    const cachedExchangeUserId = await SecureStore.getItemAsync(
      StorageKeys.EXCHANGE_USER_ID
    );
    setCurrentExchangeUser(cachedExchangeUserId);

    const cachedDefaultTokens = await SecureStore.getItemAsync(
      StorageKeys.DEFAULT_TOKENS
    );
    if (cachedDefaultTokens) {
      setDefaultTokens(JSON.parse(cachedDefaultTokens));
    }
    const cachedSupportedCurrenciesForSwap = await SecureStore.getItemAsync(
      StorageKeys.SUPPORTED_CURRENCIES_FOR_SWAP
    );
    if (cachedSupportedCurrenciesForSwap) {
      setSupportedCurrenciesForSwap(
        JSON.parse(cachedSupportedCurrenciesForSwap)
      );
    }
    const cachedWalletChains = await SecureStore.getItemAsync(
      StorageKeys.WALLET_CHAINS
    );
    if (cachedWalletChains) {
      setWalletChains(JSON.parse(cachedWalletChains));
    }
    const cachedMainWalletGroupId = await SecureStore.getItemAsync(
      StorageKeys.MAIN_WALLET_GROUP_ID
    );
    const cachedUserWalletGroups = await SecureStore.getItemAsync(
      StorageKeys.USER_WALLET_GROUPS
    );
    if (cachedUserWalletGroups) {
      setUserWalletGroups(JSON.parse(cachedUserWalletGroups));
      setMainUserWalletGroup(
        JSON.parse(cachedUserWalletGroups).find(
          (group: any) => group._id === cachedMainWalletGroupId
        )
      );
    }
    if (cachedMainWalletGroupId) {
      const cachedPortfolio = await loadPortfolioFromCache(
        cachedMainWalletGroupId
      );
      setPortfolio(cachedPortfolio);
      setLastUpdate(new Date());
      setError(null);
    }
    const cachedProcessedPortfolio = await SecureStore.getItemAsync(
      StorageKeys.PROCESSED_PORTFOLIO
    );
    if (cachedProcessedPortfolio) {
      dispatch(setProcessedPortfolio(JSON.parse(cachedProcessedPortfolio)));
    }
  };

  const contextValue: WalletContextType = {
    // State
    isInitialized,
    isWalletAuthenticated,
    isExchangeAuthenticated,
    currentExchangeUser,
    exchangeUserData,
    currentWalletUser,
    currentSeedPhrase,
    userWalletGroups,
    isUserWalletGroups,
    mainUserWalletGroup,
    portfolio,
    setPortfolio, // Expose setPortfolio for optimistic updates
    transactions,
    isLoading,
    isInitializing,
    isAuthenticating,
    isRefreshingPortfolio,
    isSendingTransaction,
    error,

    loadAllDataFromCache,

    // Authentication
    walletLogin,
    logoutFromExchange,
    exchangeLogin,
    exchangeValidateOtp,
    getExchangeUser,
    setCurrentExchangeUser,
    setExchangeUserData,
    setIsExchangeAuthenticated,
    completeOnboarding,

    // Wallet Operations
    createWalletGroup,

    // Portfolio
    refreshPortfolio,
    getWalletPortfolio,

    // Wallet Groups
    refreshUserWalletGroups,

    // Transactions
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

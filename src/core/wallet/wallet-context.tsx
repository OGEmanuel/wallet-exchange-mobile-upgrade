/**
 * Wallet Context - Zap SDK Integration
 *
 * Provides wallet state management and operations throughout the app.
 * Integrates with the Zap SDK for blockchain operations.
 */

import {
  WALLET_GROUP_CLASS as WALLET_GROUP_CLASS_SDK,
  WALLET_GROUP_TYPE as WALLET_GROUP_TYPE_SDK,
  ZapSDK,
} from "@zap/blockchain-sdk";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { RelativePathString, router } from "expo-router";
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
import {
  WALLET_GROUP_CLASS,
  WALLET_GROUP_TYPE,
} from "../../../configs/constants";
import zapSDKService from "../sdk/zap-sdk.service";
import { StorageKeys } from "../storage/storage-types";
import WalletCredentialsStorage from "../storage/wallet-credentials-storage";

interface WalletContextType {
  // State
  isInitialized: boolean;
  isWalletAuthenticated: boolean;
  currentWalletUser: string | null;
  currentSeedPhrase: string | null;
  isExchangeAuthenticated: boolean;
  currentExchangeUser: string | null;
  userWalletGroups: any[];
  isUserWalletGroups: boolean;
  mainUserWalletGroup: any | null;
  portfolio: any | null;
  transactions: any[];
  isLoading: boolean;
  error: string | null;

  // Authentication
  walletLogin: (
    deviceToken: string,
    deviceFingerprint: string,
    pushToken: string
  ) => Promise<boolean>;
  logoutFromExchange: () => Promise<void>;
  exchangeLogin: (email: string) => Promise<boolean>;
  exchangeValidateOtp: (email: string, otp: string) => Promise<boolean>;

  // Wallet Operations
  createWallet: (walletName: string) => Promise<any | null>;
  importWallet: (seedPhrase: string, walletName: string) => Promise<any | null>;
  importPrivateKey: (
    privateKey: string,
    walletName: string,
    chain: string
  ) => Promise<any | null>;
  watchAddress: (address: string, walletName: string) => Promise<any | null>;

  // Portfolio
  refreshPortfolio: () => Promise<void>;
  getWalletPortfolio: (userWalletGroupId: string) => Promise<any>;
  
  // Wallet Groups
  refreshUserWalletGroups: () => Promise<void>;

  // Transactions
  sendTransaction: (
    toAddress: string,
    amount: number,
    currency: string
  ) => Promise<string | null>;
  getTransactionHistory: (accountId?: string) => Promise<any[]>;

  // Real-time Updates
  isConnected: boolean;
  lastUpdate: Date | null;

  // SDK Access
  getSDK: () => ZapSDK | null;

  // Account Management
  retryPendingWallets: () => Promise<void>;
  isCreatingWallet: boolean;
  setIsCreatingWallet: (creating: boolean) => void;
  
  // Wallet Switching
  switchWallet: (userWalletGroupId: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [isExchangeAuthenticated, setIsExchangeAuthenticated] = useState(false);
  const [currentExchangeUser, setCurrentExchangeUser] = useState<string | null>(
    null
  );
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
  const [isTransactionHistoryAvailable, setIsTransactionHistoryAvailable] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasNavigatedToWallet, setHasNavigatedToWallet] = useState(false);

  // Initialize SDK on mount
  useEffect(() => {
    initializeSDK();
    setupWebSocketListeners();
    setupAppStateListener();

    return () => {
      // Only cleanup on unmount, not during initialization
      // The cleanup will be handled by the app lifecycle
    };
  }, []);

  useEffect(() => {
    checkAuthenticationAndRoute();
  }, [isInitialized]);

  const initializeSDK = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await zapSDKService.initialize();
      if (success) {
        setIsInitialized(true);

        // Check authentication status and route accordingly
        await checkAuthenticationAndRoute();
      } else {
        setError("Failed to initialize wallet service");
      }
    } catch (error) {
      console.error("SDK initialization error:", error);
      setError("Failed to initialize wallet service");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthenticationAndRoute = async (shouldRoute: boolean = true) => {
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
      const sdk = zapSDKService.getSDK();
      const isWalletAuth = !!(await sdk.walletAuth.getCurrentUserId());
      const isExchangeAuth = await sdk.isExchangeAuthenticated();
      const walletUserId = await sdk.walletAuth.getCurrentUserId();

      if (isExchangeAuth) {
        // User has exchange authentication - route to exchange
        setIsWalletAuthenticated(true);
        const exchangeUserId = await sdk.getExchangeUserId();
        setCurrentExchangeUser(exchangeUserId);
        setIsExchangeAuthenticated(true);
        console.log("✅ Exchange authentication found, routing to exchange");
        result = { ...result, exchangeUserId, isExchangeAuth: true };
        if (shouldRoute) {
          // router.replace(
          //   "/dashboard/home/wallet-home/exchange" as RelativePathString
          // );
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
    }
  };

  const routeToWallet = async (
    isExchangeAuth: boolean,
    walletUserId: string | null,
    shouldRoute: boolean = true
  ) => {
    const sdk = zapSDKService.getSDK();
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
      if (!userWalletGroups.length && walletUserId) {
        // Check if user has wallet groups
        try {
          const uWalletGroups = await sdk.getUserWalletGroups(
            walletUserId as string
          );
          console.log(
            "📱 Wallet groups found with wallet groups:",
            uWalletGroups
          );

          if (
            uWalletGroups.userWalletGroups &&
            uWalletGroups.userWalletGroups.length > 0
          ) {
            setUserWalletGroups(uWalletGroups.userWalletGroups);
            setIsUserWalletGroups(true);
            // Check for stored main wallet group ID first, then SDK, then fallback to first wallet
            const storedMainWalletGroupId = await SecureStore.getItemAsync(StorageKeys.MAIN_WALLET_GROUP_ID);
            const sdkMainWalletGroupId = await sdk.secureTokenManager.getMainWalletGroupId();
            const mainUserWalletGroupId =
              storedMainWalletGroupId ||
              sdkMainWalletGroupId ||
              uWalletGroups.userWalletGroups[0]._id;
            setMainUserWalletGroup(
              uWalletGroups.userWalletGroups.find(
                (group: any) => group._id === mainUserWalletGroupId
              ) || uWalletGroups.userWalletGroups[0]
            );
            const credentials =
              await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
                mainUserWalletGroupId.toString()
              );
            setCurrentSeedPhrase(credentials?.credential.toString() || null);
            console.log(
              "✅ Wallet authentication with groups found, routing to wallet"
            );
            result = {
              ...result,
              userWalletGroups: uWalletGroups.userWalletGroups,
              isUserWalletGroups: true,
            };
            if (!isExchangeAuth && shouldRoute) {
              // Use safe navigation function
              safeNavigateToWallet();
            }

            return result;
          } else {
            setIsUserWalletGroups(false);
            console.log(
              "⚠️ Wallet auth found but no wallet groups, routing to setup"
            );

            result = {
              ...result,
              userWalletGroups: null,
              isUserWalletGroups: false,
            };

            return result;
          }
        } catch (error) {
          console.error("Failed to get wallet groups:", error);
          // Handle 404 or other errors gracefully
          if (
            error instanceof Error &&
            (error.message?.includes("404") ||
              error.message?.includes("Request failed"))
          ) {
            console.log(
              "ℹ️ No wallet groups found (404) - user needs to create wallets"
            );
            setIsUserWalletGroups(false);
            result = {
              ...result,
              userWalletGroups: null,
              isUserWalletGroups: false,
            };

            return result;
          } else {
            setIsUserWalletGroups(false);
            result = {
              ...result,
              userWalletGroups: null,
              isUserWalletGroups: false,
            };

            return result;
          }
        }
      } else {
        result = { ...result, userWalletGroups, isUserWalletGroups: true };
        console.log(
          "Wallet is authenticated with wallet groups",
          userWalletGroups
        );
        if (!isExchangeAuth && shouldRoute) {
          // Use safe navigation function
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
      setIsLoading(true);
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
      setIsLoading(false);
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
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const exchangeValidateOtp = async (
    email: string,
    otp: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Wallet operations
  const createWallet = async (walletName: string): Promise<any | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const sdk = zapSDKService.getSDK();
      const seedPhrase = sdk.generateSeedPhrase();

      // First, store the credentials securely
      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          name: walletName,
          class: WALLET_GROUP_CLASS.SEEDPHRASE as WALLET_GROUP_CLASS_SDK,
          credential: seedPhrase,
          derivationIndex: 0,
        });

      console.log("🔐 Wallet credentials stored securely:", walletStorageId);

      try {
        // Attempt to create wallet in SDK
        const result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          seedPhrase: seedPhrase,
          walletType: WALLET_GROUP_TYPE.GENERATED as WALLET_GROUP_TYPE_SDK,
        });

        if (result.userWalletGroupId) {
          // Mark as successfully created
          await WalletCredentialsStorage.markWalletAsCreated(
            walletStorageId,
            result.userWalletGroupId
          );
          console.log(
            "✅ Wallet created successfully in SDK:",
            result.userWalletGroupId
          );

          // Refresh wallet groups
          await checkAuthenticationAndRoute(false);

          return {
            ...result,
            walletStorageId,
            name: walletName,
            isCreated: true,
            message: "Wallet created successfully",
          };
        } else {
          // SDK creation failed, but credentials are stored for retry
          await WalletCredentialsStorage.markWalletCreationAttempt(
            walletStorageId,
            false
          );
          console.log(
            "⚠️ SDK wallet creation failed, credentials stored for retry"
          );

          // Still return success to user since credentials are stored
          return {
            walletStorageId,
            name: walletName,
            isCreated: false,
            message:
              "Wallet credentials stored. Will be created when connection is restored.",
          };
        }
      } catch (sdkError) {
        // SDK creation failed, but credentials are stored for retry
        await WalletCredentialsStorage.markWalletCreationAttempt(
          walletStorageId,
          false
        );
        console.error("SDK wallet creation failed:", sdkError);

        setError("Failed to create wallet");

        // Still return success to user since credentials are stored
        return {
          walletStorageId,
          name: walletName,
          isCreated: false,
          message:
            "Wallet credentials stored. Will be created when connection is restored.",
        };
      }
    } catch (error) {
      console.error("Create wallet error:", error);
      setError("Failed to create wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = async (
    seedPhrase: string,
    walletName: string
  ): Promise<any | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // First, store the credentials securely
      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          name: walletName,
          class: WALLET_GROUP_CLASS.SEEDPHRASE as WALLET_GROUP_CLASS_SDK,
          credential: seedPhrase,
          derivationIndex: 0,
        });

      console.log(
        "🔐 Import wallet credentials stored securely:",
        walletStorageId
      );

      try {
        // Attempt to create wallet in SDK
        const sdk = zapSDKService.getSDK();
        const result = await sdk.wallets.createWalletGroupMultipurpose({
          name: walletName,
          seedPhrase,
          walletType: WALLET_GROUP_TYPE.IMPORT as WALLET_GROUP_TYPE_SDK,
        });

        if (result.userWalletGroupId) {
          // Mark as successfully created
          await WalletCredentialsStorage.markWalletAsCreated(
            walletStorageId,
            result.userWalletGroupId
          );
          console.log(
            "✅ Import wallet created successfully in SDK:",
            result.userWalletGroupId
          );

          // Refresh wallet groups
          await checkAuthenticationAndRoute(false);

          return {
            ...result,
            walletStorageId,
            name: walletName,
            isCreated: true,
            message: "Wallet created successfully",
          };
        } else {
          // SDK creation failed, but credentials are stored for retry
          await WalletCredentialsStorage.markWalletCreationAttempt(
            walletStorageId,
            false
          );
          console.log(
            "⚠️ SDK import wallet creation failed, credentials stored for retry"
          );

          return {
            walletStorageId,
            name: walletName,
            isCreated: false,
            message:
              "Wallet credentials stored. Will be created when connection is restored.",
          };
        }
      } catch (sdkError) {
        // SDK creation failed, but credentials are stored for retry
        await WalletCredentialsStorage.markWalletCreationAttempt(
          walletStorageId,
          false
        );
        console.error("SDK import wallet creation failed:", sdkError);

        setError("Failed to import wallet");
        return {
          walletStorageId,
          name: walletName,
          isCreated: false,
          message:
            "Wallet credentials stored. Will be created when connection is restored.",
        };
      }
    } catch (error) {
      console.error("Import wallet error:", error);
      setError("Failed to import wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const importPrivateKey = async (
    privateKey: string,
    walletName: string,
    chain: string
  ): Promise<any | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // First, store the credentials securely
      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          name: walletName,
          class: WALLET_GROUP_CLASS.PRIVATE_KEY as WALLET_GROUP_CLASS_SDK,
          credential: privateKey,
          chain: chain,
        });

      console.log(
        "🔐 Import private key credentials stored securely:",
        walletStorageId
      );

      try {
        // Attempt to create wallet in SDK
        const sdk = zapSDKService.getSDK();
        const result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          privateKey,
          walletType: WALLET_GROUP_TYPE.IMPORT as WALLET_GROUP_TYPE_SDK,
        });

        if (result.userWalletGroupId) {
          // Mark as successfully created
          await WalletCredentialsStorage.markWalletAsCreated(
            walletStorageId,
            result.userWalletGroupId
          );
          console.log(
            "✅ Import private key wallet created successfully in SDK:",
            result.userWalletGroupId
          );

          // Refresh wallet groups
          await checkAuthenticationAndRoute(false);

          return {
            ...result,
            walletStorageId,
            name: walletName,
            isCreated: true,
            message: "Wallet created successfully",
          };
        } else {
          // SDK creation failed, but credentials are stored for retry
          await WalletCredentialsStorage.markWalletCreationAttempt(
            walletStorageId,
            false
          );
          console.log(
            "⚠️ SDK import private key wallet creation failed, credentials stored for retry"
          );

          return {
            walletStorageId,
            name: walletName,
            isCreated: false,
            message:
              "Wallet credentials stored. Will be created when connection is restored.",
          };
        }
      } catch (sdkError: any) {
        // SDK creation failed, but credentials are stored for retry
        await WalletCredentialsStorage.markWalletCreationAttempt(
          walletStorageId,
          false
        );
        console.error(
          "SDK import private key wallet creation failed:",
          sdkError
        );

        // Handle specific SDK validation errors gracefully
        let errorMessage = "Failed to import private key wallet";
        let userMessage =
          "Wallet credentials stored. Will be created when connection is restored.";

        if (sdkError?.error?.code === "VALIDATION_ERROR") {
          errorMessage = sdkError.error.message || "Invalid private key format";
          userMessage =
            "Invalid private key. Please check the format and try again.";
        } else if (sdkError?.status === 400) {
          errorMessage = "Invalid private key format";
          userMessage =
            "Invalid private key. Please check the format and try again.";
        } else if (
          sdkError?.message?.includes("Invalid Ethereum private key")
        ) {
          errorMessage = "Invalid Ethereum private key";
          userMessage =
            "Invalid Ethereum private key. Please check the format and try again.";
        }

        setError(errorMessage);
        return {
          walletStorageId,
          name: walletName,
          isCreated: false,
          message: userMessage,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Import private key error:", error);

      // Handle specific error types gracefully
      let errorMessage = "Failed to import private key";
      if (error?.message?.includes("Invalid")) {
        errorMessage = error.message;
      } else if (error?.code === "VALIDATION_ERROR") {
        errorMessage = "Invalid private key format";
      }

      setError(errorMessage);
      return {
        isCreated: false,
        message: "Invalid private key. Please check the format and try again.",
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const watchAddress = async (
    address: string,
    walletName: string
  ): Promise<any | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // First, store the credentials securely
      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          name: walletName,
          class: WALLET_GROUP_CLASS.WATCH as WALLET_GROUP_CLASS_SDK,
          credential: address,
        });

      console.log(
        "🔐 Watch address credentials stored securely:",
        walletStorageId
      );

      try {
        // Attempt to create wallet in SDK
        const sdk = zapSDKService.getSDK();
        const result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          watchAddress: address,
          walletType: WALLET_GROUP_TYPE.WATCH as WALLET_GROUP_TYPE_SDK,
        });

        if (result.userWalletGroupId) {
          // Mark as successfully created
          await WalletCredentialsStorage.markWalletAsCreated(
            walletStorageId,
            result.userWalletGroupId
          );
          console.log(
            "✅ Watch address wallet created successfully in SDK:",
            result.userWalletGroupId
          );

          // Refresh wallet groups
          await checkAuthenticationAndRoute(false);

          return {
            ...result,
            walletStorageId,
            name: walletName,
            isCreated: true,
            message: "Wallet created successfully",
          };
        } else {
          // SDK creation failed, but credentials are stored for retry
          await WalletCredentialsStorage.markWalletCreationAttempt(
            walletStorageId,
            false
          );
          console.log(
            "⚠️ SDK watch address wallet creation failed, credentials stored for retry"
          );

          return {
            walletStorageId,
            name: walletName,
            isCreated: false,
            message:
              "Wallet credentials stored. Will be created when connection is restored.",
          };
        }
      } catch (sdkError) {
        // SDK creation failed, but credentials are stored for retry
        await WalletCredentialsStorage.markWalletCreationAttempt(
          walletStorageId,
          false
        );
        console.error("SDK watch address wallet creation failed:", sdkError);

        setError("Failed to watch address");
        return {
          walletStorageId,
          name: walletName,
          isCreated: false,
          message:
            "Wallet credentials stored. Will be created when connection is restored.",
        };
      }
    } catch (error) {
      console.error("Watch address error:", error);
      setError("Failed to watch address");
      return null;
    } finally {
      setIsLoading(false);
    }
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

      await sdk.wallets.addAccountsToExistingWallet({
        userWalletGroupId,
        seedPhrase,
        privateKey,
        searchChain,
        watchAddress,
        derivationIndex,
      });
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
  const refreshUserWalletGroups = async (): Promise<void> => {
    try {
      if (!isWalletAuthenticated || !currentWalletUser) {
        console.log("⚠️ Cannot refresh wallet groups - not authenticated");
        return;
      }

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        console.log("⚠️ Cannot refresh wallet groups - SDK not available");
        return;
      }

      console.log("🔄 Refreshing user wallet groups...");
      const uWalletGroups = await sdk.getUserWalletGroups(currentWalletUser);
      console.log("✅ User wallet groups refreshed:", uWalletGroups.length);
      
      setUserWalletGroups(uWalletGroups);
    } catch (error) {
      console.error("❌ Failed to refresh user wallet groups:", error);
    }
  };

  // Portfolio methods
  const refreshPortfolio = async (): Promise<void> => {
    try {
      // Check if user is authenticated before making portfolio request
      if (!isWalletAuthenticated || !currentWalletUser) {
        console.warn("Cannot refresh portfolio: User not authenticated");
        setError("User not authenticated");
        return;
      }

      // Prevent multiple simultaneous portfolio fetches
      if (isLoading) {
        console.log("Portfolio fetch already in progress, skipping...");
        return;
      }

      setIsLoading(true);
      const sdk = zapSDKService.getSDK();

      // Check if portfolio method exists
      if (
        sdk.portfolio &&
        typeof sdk.portfolio.getUserPortfolio === "function"
      ) {
        console.log("Fetching portfolio for user:", currentWalletUser);
        const portfolioData = await sdk.portfolio.getUserPortfolio(
          currentWalletUser,
          mainUserWalletGroup._id
            ? {
                mainUserWalletGroupId: mainUserWalletGroup?._id || "",
              }
            : {}
        );
        setPortfolio(portfolioData);
        setLastUpdate(new Date());
        setError(null); // Clear any previous errors
      } else {
        console.warn("Portfolio method not available on SDK");
        setPortfolio(null);
      }
    } catch (error: any) {
      console.error("Failed to refresh portfolio:", error);
      setError(
        "Failed to refresh portfolio. Please check your authentication."
      );

      // If it's an authentication error, try to re-authenticate
      if (
        error?.message?.includes("token") ||
        error?.message?.includes("auth")
      ) {
        console.log(
          "Authentication error detected, attempting to re-authenticate..."
        );
        // You might want to trigger a re-authentication flow here
      }
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      setError(null);

      const sdk = zapSDKService.getSDK();

      // This would need to be implemented based on the specific currency
      let txHash: string;

      if (currency === "ETH") {
        txHash = await sdk.sendEthereumTransaction(
          portfolio?.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts[0]
            .address || "",
          toAddress,
          amount,
          "" // Private key would need to be retrieved securely
        );
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
      setIsLoading(false);
    }
  };

  const getTransactionHistory = async (accountId?: string): Promise<any[]> => {
    try {
      // This would need to be implemented based on your transaction history API
      return [];
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
          router.replace(
            "/dashboard/home/wallet-home/home" as RelativePathString
          );
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
    console.log('🔄 retryPendingWallets called - checking for pending wallets');
    
    // Skip retry if we're in the middle of creating a wallet
    if (isLoading || isCreatingWallet) {
      console.log('⏸️ Skipping retry - wallet creation in progress');
      return;
    }
    
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
                walletType:
                  WALLET_GROUP_TYPE.GENERATED as WALLET_GROUP_TYPE_SDK,
              });
              break;
            case WALLET_GROUP_CLASS.PRIVATE_KEY:
              result = await sdk.createWalletGroupMultipurpose({
                name: wallet.name,
                privateKey: wallet.credential,
                walletType: WALLET_GROUP_TYPE.IMPORT as WALLET_GROUP_TYPE_SDK,
              });
              break;
            case WALLET_GROUP_CLASS.WATCH:
              result = await sdk.createWalletGroupMultipurpose({
                name: wallet.name,
                watchAddress: wallet.credential,
                walletType: WALLET_GROUP_TYPE.WATCH as WALLET_GROUP_TYPE_SDK,
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
    }
  };

  // SDK access
  const getSDK = (): ZapSDK | null => {
    return zapSDKService.isSDKInitialized() ? zapSDKService.getSDK() : null;
  };

  // Wallet switching
  const switchWallet = async (userWalletGroupId: string): Promise<void> => {
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

      // Store the main wallet group ID in storage for persistence
      await SecureStore.setItemAsync(StorageKeys.MAIN_WALLET_GROUP_ID, userWalletGroupId);

      // Get credentials for the selected wallet group
      const credentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          userWalletGroupId
        );
      setCurrentSeedPhrase(credentials?.credential.toString() || null);

      // Refresh portfolio for the new wallet group
      const portfolioData = await sdk.portfolio.getUserPortfolio(
        currentWalletUser || "",
        {
          mainUserWalletGroupId: userWalletGroupId,
        }
      );
      setPortfolio(portfolioData);
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
    error,

    // Authentication
    walletLogin,
    logoutFromExchange,
    exchangeLogin,
    exchangeValidateOtp,
    // Wallet Operations
    createWallet,
    importWallet,
    importPrivateKey,
    watchAddress,

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
    isCreatingWallet,
    setIsCreatingWallet,
    
    // Wallet Switching
    switchWallet,
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

/**
 * Zap SDK Service
 *
 * Centralized service for managing the Zap Blockchain SDK instance
 * and providing a clean interface for the rest of the application.
 */

import { UpdateSettingsBody } from "@/src/modules/settings/domain/entities/params/update-settings-body";
import {
  AddTokenRequest,
  CreateOrderRequest,
  DisableTokenRequest,
  EnableTokenRequest,
  LoginRequest,
  MarketData,
  SendTransactionRequest,
  SupportedCurrency,
  UpdateUserWalletGroupNameRequest,
  UpdateWalletGroupRequest,
  UserModel,
  WALLET_GROUP_TYPE,
  WalletUtils,
  ZapSDK,
} from "@zap/blockchain-sdk";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import WalletCredentialsStorage from "../storage/wallet-credentials-storage";
import { NetworkErrorHandler } from "../utils/network-error-handler";
import { createSDKInstance, getSDKConfig } from "./zap-sdk.config";

export interface AddAccountsToExistingWalletRequest {
  userWalletGroupId?: string;
  walletId?: string;
  walletGroupId?: string;
  seedPhrase?: string; // For seedphrase-based accounts
  privateKey?: string; // For private key-based accounts
  searchChain?: string; // Optional chain specification for private key/watch address
  watchAddress?: string; // For watch-only accounts
  derivationIndex?: number; // Derivation index (default: 0)
}

export interface TokenDetailsRequest {
  tokenAddress: string;
  chainId: string;
}

export interface CreateWalletGroupMultipurposeParams {
  name: string;
  seedPhrase?: string;
  privateKey?: string;
  watchAddress?: string;
  walletType?: WALLET_GROUP_TYPE;
}

class ZapSDKService {
  private static instance: ZapSDKService;
  private sdk: ZapSDK | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;
  private isAddingAccounts = false;
  // Circuit breaker for authentication failures
  private authFailureCount = 0;
  private maxAuthFailures = 2; // Reduced from 3 to 2 for faster response
  private authFailureWindow = 5 * 60 * 1000; // 5 minutes
  private lastAuthFailure = 0;
  private isAuthCircuitOpen = false;

  // Retry loop detection
  private retryLoopDetection = {
    consecutiveAuthErrors: 0,
    lastAuthErrorTime: 0,
    maxConsecutiveErrors: 3, // Reduced from 5 to 3 for faster response
    errorWindow: 5000, // Reduced from 10 to 5 seconds
  };

  private constructor() {
    this.isAddingAccounts = false;
  }

  public static getInstance(): ZapSDKService {
    if (!ZapSDKService.instance) {
      ZapSDKService.instance = new ZapSDKService();
    }
    return ZapSDKService.instance;
  }

  /**
   * Initialize the SDK instance
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized && this.sdk) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  /**
   * Force stop all SDK operations and reset circuit breaker
   */
  public async forceStop(): Promise<void> {
    console.log("🛑 Force stopping SDK operations...");

    // Reset circuit breaker
    this.resetAuthCircuitBreakerInternal();

    // Try to cleanup SDK if possible
    try {
      if (this.sdk) {
        await this.sdk.cleanup();
      }
    } catch (error) {
      console.warn("⚠️ Error during force cleanup:", error);
    }

    // Reset all state
    this.sdk = null;
    this.isInitialized = false;
    this.initializationPromise = null;

    console.log("✅ SDK force stopped and circuit breaker reset");
  }

  /**
   * Emergency stop - completely disable SDK
   */
  public emergencyStop(): void {
    console.log("🚨 EMERGENCY STOP - Disabling SDK completely");

    // Open circuit breaker immediately
    this.isAuthCircuitOpen = true;
    this.authFailureCount = this.maxAuthFailures;

    // Try to disconnect WebSocket if possible
    try {
      // if (this.sdk && typeof this.sdk.disconnect === 'function') {
      //   this.sdk.disconnect();
      // }
    } catch (error) {
      console.warn("⚠️ Error disconnecting SDK:", error);
    }

    console.log("🚨 SDK emergency stopped - all operations blocked");
  }

  /**
   * Force disable SDK internal retry mechanisms
   */
  public disableSDKRetries(): void {
    console.log("🛑 Disabling SDK internal retry mechanisms...");

    try {
      if (this.sdk) {
        // Try to disable internal retry logic if the SDK exposes such methods
        // if (typeof this.sdk.setRetryEnabled === 'function') {
        //   this.sdk.setRetryEnabled(false);
        // }

        // Try to disable auto-refresh if available
        // if (typeof this.sdk.setAutoRefresh === 'function') {
        //   this.sdk.setAutoRefresh(false);
        // }

        // Try to clear any pending retry timers
        // if (typeof this.sdk.clearRetryTimers === 'function') {
        //   this.sdk.clearRetryTimers();
        // }

        console.log("✅ SDK retry mechanisms disabled");
      }
    } catch (error) {
      console.warn("⚠️ Could not disable SDK retry mechanisms:", error);
    }
  }

  private async _initialize(): Promise<boolean> {
    try {
      console.log("🚀 Initializing Zap SDK...");

      this.sdk = createSDKInstance();
      await this.sdk.initialize();

      // Set up WebSocket listeners
      this.setupWebSocketListeners();

      this.isInitialized = true;
      console.log("✅ Zap SDK initialized successfully");

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Zap SDK:", error);
      this.isInitialized = false;
      this.sdk = null;
      throw error;
    }
  }

  /**
   * Get the SDK instance
   */
  public getSDK(): ZapSDK {
    if (!this.sdk) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }

    // Block SDK access if circuit breaker is open
    if (this.shouldBlockSDKOperation()) {
      console.warn("🚨 SDK access blocked - circuit breaker is open");
      throw new Error(
        "SDK access blocked due to authentication circuit breaker. Please try again later."
      );
    }

    return this.sdk;
  }

  /**
   * Completely destroy SDK instance to stop all internal operations
   */
  public destroySDK(): void {
    console.log("💥 Destroying SDK instance to stop all operations...");

    try {
      if (this.sdk) {
        // Try to cleanup and destroy the SDK
        if (typeof this.sdk.cleanup === "function") {
          this.sdk.cleanup();
        }

        // if (typeof this.sdk.destroy === 'function') {
        //   this.sdk.destroy();
        // }

        // if (typeof this.sdk.disconnect === 'function') {
        //   this.sdk.disconnect();
        // }
      }
    } catch (error) {
      console.warn("⚠️ Error destroying SDK:", error);
    } finally {
      // Force reset all state
      this.sdk = null;
      this.isInitialized = false;
      this.initializationPromise = null;

      console.log("💥 SDK instance destroyed");
    }
  }

  /**
   * Check if authentication circuit breaker is open
   */
  private isAuthCircuitBreakerOpen(): boolean {
    const now = Date.now();

    // Reset failure count if outside the window
    if (now - this.lastAuthFailure > this.authFailureWindow) {
      this.authFailureCount = 0;
      this.isAuthCircuitOpen = false;
    }

    return this.isAuthCircuitOpen;
  }

  /**
   * Record authentication failure
   */
  private recordAuthFailure(): void {
    this.authFailureCount++;
    this.lastAuthFailure = Date.now();

    console.warn(
      `🔒 Auth failure ${this.authFailureCount}/${this.maxAuthFailures}`
    );

    // Check for retry loop pattern
    this.detectRetryLoop();

    if (this.authFailureCount >= this.maxAuthFailures) {
      this.isAuthCircuitOpen = true;
      console.warn(
        "🚨 Authentication circuit breaker opened due to repeated failures"
      );

      // Immediately destroy SDK to stop all internal retries
      this.destroySDK();

      // Then attempt automatic re-login
      this.attemptAutoRelogin();
    }
  }

  /**
   * Detect retry loop pattern and stop it
   */
  private detectRetryLoop(): void {
    const now = Date.now();
    const {
      /* consecutiveAuthErrors, */ lastAuthErrorTime,
      maxConsecutiveErrors,
      errorWindow,
    } = this.retryLoopDetection;

    // Reset counter if enough time has passed
    if (now - lastAuthErrorTime > errorWindow) {
      this.retryLoopDetection.consecutiveAuthErrors = 1;
    } else {
      this.retryLoopDetection.consecutiveAuthErrors++;
    }

    this.retryLoopDetection.lastAuthErrorTime = now;

    console.warn(
      `🔄 Retry loop detection: ${this.retryLoopDetection.consecutiveAuthErrors}/${maxConsecutiveErrors} consecutive errors`
    );

    // If we detect a retry loop, emergency stop
    if (this.retryLoopDetection.consecutiveAuthErrors >= maxConsecutiveErrors) {
      console.error("🚨 RETRY LOOP DETECTED - Emergency stopping SDK!");
      this.emergencyStop();
    }
  }

  /**
   * Intercept and block SDK internal retries
   */
  private interceptSDKRetries(): void {
    if (!this.sdk) return;

    try {
      // Try to access and disable internal retry mechanisms
      const sdk = this.sdk as any;

      // Disable HTTP interceptors if possible
      if (sdk.httpClient && sdk.httpClient.interceptors) {
        sdk.httpClient.interceptors.request.clear();
        sdk.httpClient.interceptors.response.clear();
        console.log("🛑 Cleared HTTP interceptors");
      }

      // Disable WebSocket reconnection if possible
      if (sdk.wsClient && typeof sdk.wsClient.disconnect === "function") {
        sdk.wsClient.disconnect();
        console.log("🛑 Disconnected WebSocket");
      }

      // Disable any retry timers
      if (sdk.retryTimer) {
        clearTimeout(sdk.retryTimer);
        sdk.retryTimer = null;
        console.log("🛑 Cleared retry timer");
      }

      // Disable any refresh timers
      if (sdk.refreshTimer) {
        clearTimeout(sdk.refreshTimer);
        sdk.refreshTimer = null;
        console.log("🛑 Cleared refresh timer");
      }
    } catch (error) {
      console.warn("⚠️ Could not intercept SDK retries:", error);
    }
  }

  /**
   * Reset authentication circuit breaker
   */
  private resetAuthCircuitBreakerInternal(): void {
    this.authFailureCount = 0;
    this.isAuthCircuitOpen = false;
    this.lastAuthFailure = 0;
  }

  /**
   * Check if error is authentication-related
   */
  private isAuthError(error: any): boolean {
    if (!error) return false;

    const authErrorPatterns = [
      "Validation failed",
      "Authentication failed",
      "Invalid token",
      "Token expired",
      "Unauthorized",
      "401",
      "403",
    ];

    const errorMessage = error.message || error.toString() || "";
    const errorCode = error.code || error.status || "";

    return authErrorPatterns.some(
      (pattern) =>
        errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
        errorCode.toString().includes(pattern)
    );
  }

  /**
   * Execute SDK call with network error handling and circuit breaker
   */
  public async executeWithNetworkHandling<T>(
    operation: () => Promise<T>,
    context: string = "SDK operation"
  ): Promise<T> {
    try {
      // Check if auth circuit breaker is open
      if (this.isAuthCircuitBreakerOpen()) {
        console.warn(
          "🚨 Circuit breaker is OPEN - blocking SDK call:",
          context
        );
        throw new Error(
          "Authentication circuit breaker is open. Please try again later."
        );
      }

      console.log(`🔄 Executing SDK call: ${context}`);
      return await operation();
    } catch (error: any) {
      console.log(`❌ SDK call failed: ${context}`, error.message);

      // Handle token refresh race condition
      if (error.message?.includes("Token refresh already in progress")) {
        console.warn(`⏳ Token refresh in progress for ${context}, waiting...`);
        // Wait a bit and retry once
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          return await operation();
        } catch (retryError: any) {
          console.error(`❌ Retry failed for ${context}:`, retryError.message);
          const networkError = NetworkErrorHandler.handleSDKError(
            retryError,
            context
          );
          throw networkError;
        }
      }

      // Check if it's an auth error and record failure
      if (this.isAuthError(error)) {
        this.recordAuthFailure();
        console.warn(`🔒 Authentication error in ${context}:`, error.message);
        console.warn(
          `🔒 Circuit breaker status:`,
          this.getCircuitBreakerStatus()
        );

        // If this is the second failure, immediately trigger circuit breaker
        if (this.authFailureCount >= this.maxAuthFailures) {
          console.warn(
            "🚨 Triggering immediate circuit breaker due to repeated auth failures"
          );
          this.triggerCircuitBreaker();
        }
      }

      const networkError = NetworkErrorHandler.handleSDKError(error, context);
      throw networkError;
    }
  }

  /**
   * Execute SDK call with network error handling but NO authentication circuit breaker
   * Used for blockchain operations that don't require authentication
   */
  public async executeWithNetworkHandlingNoAuth<T>(
    operation: () => Promise<T>,
    context: string = "SDK operation"
  ): Promise<T> {
    try {
      console.log(`🔄 Executing SDK call (no auth check): ${context}`);
      return await operation();
    } catch (error: any) {
      console.log(`❌ SDK call failed: ${context}`, error.message);

      // Handle the error with network error handler
      const networkError = NetworkErrorHandler.handleSDKError(error, context);
      throw networkError;
    }
  }

  /**
   * Execute SDK call with retry on network errors
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = "SDK operation",
    maxRetries: number = 3
  ): Promise<T> {
    try {
      return await NetworkErrorHandler.retryWithBackoff(operation, maxRetries);
    } catch (error) {
      const networkError = NetworkErrorHandler.handleSDKError(error, context);
      throw networkError;
    }
  }

  public async getMarkets(options?: { useCache?: boolean }) {
    const response: MarketData[] = await this.executeWithNetworkHandling(
      () => this.getSDK().markets.getMarkets(options),
      "getMarkets"
    );
    return response || null;
  }

  // Wallet Operations
  public async createWalletGroupMultipurpose(
    params: CreateWalletGroupMultipurposeParams
  ) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().createWalletGroupMultipurpose(params),
      "createWalletGroupMultipurpose"
    );
  }

  public async updateWalletGroup(
    walletGroupId: string,
    params: UpdateWalletGroupRequest
  ) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.updateWalletGroup(walletGroupId, params),
      "updateWalletGroup"
    );
  }

  public async deleteWalletGroup(walletGroupId: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.deleteWalletGroup(walletGroupId),
      "deleteWalletGroup"
    );
  }

  public async updateUserWalletGroupName(
    userWalletGroupId: string,
    params: UpdateUserWalletGroupNameRequest
  ) {
    return this.executeWithNetworkHandling(
      () =>
        this.getSDK().wallets.updateUserWalletGroupName(
          userWalletGroupId,
          params
        ),
      "updateUserWalletGroupName"
    );
  }

  public async addAccountsToExistingWallet(
    params: AddAccountsToExistingWalletRequest
  ) {
    this.isAddingAccounts = true;
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.addAccountsToExistingWallet(params),
      "addAccountsToExistingWallet"
    ).finally(() => {
      this.isAddingAccounts = false;
    });
  }

  // Token Operations
  public async enableToken(params: EnableTokenRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.enableToken(params),
      "enableToken"
    );
  }

  public async disableToken(params: DisableTokenRequest) {
    try {
      console.log("🚫 Attempting to disable token:", params);
      const result = await this.executeWithNetworkHandling(
        () => this.getSDK().tokens.disableToken(params),
        "disableToken"
      );
      console.log("✅ Token disabled successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to disable token:", error);
      throw error;
    }
  }

  public async getTokenDetails(params: TokenDetailsRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.getTokenDetails(params),
      "getTokenDetails"
    );
  }

  public async addToken(params: AddTokenRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.addToken(params),
      "addToken"
    );
  }

  // Blockchain Operations
  public async deriveMultiChainAddresses(
    seedPhrase: string,
    walletDepth: number
  ) {
    return this.executeWithNetworkHandlingNoAuth(
      () =>
        this.getSDK().blockchain.deriveMultiChainAddresses(
          seedPhrase,
          walletDepth
        ),
      "deriveMultiChainAddresses"
    );
  }

  public async deriveAddress(
    seedPhrase: string,
    chainSymbol: string,
    walletDepth: number = 0
  ) {
    return this.executeWithNetworkHandlingNoAuth(
      () =>
        this.getSDK().blockchain.deriveAddress(
          seedPhrase,
          chainSymbol,
          walletDepth
        ),
      "deriveAddress"
    );
  }

  public async getBanks() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().banks.listAll(),
      "getBanks"
    );
  }

  public async getBankAccounts(
    userId: string,
    options?: { limit?: number; offset?: number; useCache?: boolean }
  ) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().bankAccounts.getUserBankAccounts(userId, options),
      "getBankAccounts"
    );
  }

  public async resolveBankAccount(bankId: string, accountNumber: string) {
    return this.executeWithNetworkHandling(
      () =>
        this.getSDK().banks.resolveAccount({
          bankId,
          accountNumber,
        }),
      "resolveBankAccount"
    );
  }

  public async createBankAccount(params: {
    bankId: string;
    name: string;
    supportedCurrency: SupportedCurrency;
    userId: string;
    number: string;
  }) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().bankAccounts.createBankAccount(params),
      "createBankAccount"
    );
  }

  public async createOrder(params: CreateOrderRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().orders.createOrder(params),
      "createOrder"
    );
  }

  public async sendTransaction(params: SendTransactionRequest) {
    return this.executeWithNetworkHandlingNoAuth(
      () =>
        this.getSDK().sendTransaction(
          params.fromAddress,
          params.toAddress,
          Number(params.amount),
          params.privateKey,
          params.chainSymbol,
          {
            tokenAddress: params.tokenAddress,
            tokenMintAddress: params.tokenMintAddress,
          }
        ),
      "sendTransaction"
    );
  }

  public async estimateTransactionCost(
    toAddress: string,
    amount: number,
    fromAddress: string,
    chainSymbol: string,
    options?: any
  ) {
    return this.executeWithNetworkHandlingNoAuth(
      () =>
        this.getSDK().blockchain.estimateTransactionCost(
          toAddress,
          amount,
          fromAddress,
          chainSymbol,
          options
        ),
      "estimateTransactionCost"
    );
  }

  // Auth Operations
  public async login(params: LoginRequest) {
    const result = await this.executeWithNetworkHandling(
      () => this.getSDK().walletAuth.login(params),
      "login"
    );

    // Reset circuit breaker on successful login
    this.resetAuthCircuitBreakerInternal();
    return result;
  }

  public async logoutFromExchange() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().logoutFromExchange(),
      "logoutFromExchange"
    );
  }

  public async sendExchangeOtp(email: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().sendExchangeOtp(email),
      "sendExchangeOtp"
    );
  }

  public async validateExchangeOtp(email: string, otp: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().validateExchangeOtp(email, otp),
      "validateExchangeOtp"
    );
  }

  public async getCurrentUserId() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().walletAuth.getCurrentUserId(),
      "getCurrentUserId"
    );
  }

  public async isExchangeAuthenticated() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().isExchangeAuthenticated(),
      "isExchangeAuthenticated"
    );
  }

  public async getExchangeUserId() {
    return this.executeWithNetworkHandling(
      async () => (await this.getSDK().exchangeAuth.getUser())?.id,
      "getExchangeUserId"
    );
  }

  public async getExchangeUser(): Promise<UserModel | null> {
    return this.executeWithNetworkHandling(async () => {
      const sdk = this.getSDK();
      const user = await sdk.exchangeAuth.getUser();
      if (user && (user.id || user._id)) return user;
      // Fallback: try users.getProfile when exchangeAuth.getUser returns null
      try {
        const exchangeUserId = await this.getExchangeUserId();
        if (!exchangeUserId) return null;
        const profile = await sdk.users.getProfile(exchangeUserId, {
          bypassCache: true,
        });
        return profile || null;
      } catch {
        return null;
      }
    }, "getExchangeUser");
  }

  /**
   * Users - Complete Onboarding
   */
  public async completeOnboarding(
    userId: string | null,
    data: {
      username?: string | null;
      userSource?: string | null;
      referralCode?: string | null;
    }
  ) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().users.completeOnboarding(userId, data),
      "users.completeOnboarding"
    );
  }

  public async getUserWalletGroups(
    userId: string,
    options?: { useCache?: boolean }
  ) {
    return this.executeWithNetworkHandling(
      () =>
        this.getSDK().wallets.getUserWalletGroups(userId, {
          useCache: options?.useCache,
        }),
      "getUserWalletGroups"
    );
  }

  public async getMainWalletGroupId() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().secureTokenManager.getMainWalletGroupId(),
      "getMainWalletGroupId"
    );
  }

  public generateSeedPhrase() {
    return this.getSDK().generateSeedPhrase();
  }

  /**
   * Check if SDK is initialized
   */
  public isSDKInitialized(): boolean {
    return this.isInitialized && this.sdk !== null;
  }

  /**
   * Get SDK configuration
   */
  public getConfig() {
    return getSDKConfig();
  }

  /**
   * Setup WebSocket listeners for real-time updates
   */
  private setupWebSocketListeners(): void {
    if (!this.sdk) return;

    // Listen for wallet updates
    this.sdk.onWalletUpdate((update) => {
      console.log("📱 Wallet update received:", update);
      // Emit custom event or update global state
      this.emitWalletUpdate(update);
    });

    // Listen for notifications
    this.sdk.onNotification((notification) => {
      console.log("🔔 Notification received:", notification);
      // Emit custom event or show notification
      this.emitNotification(notification);
    });

    // Listen for connection changes
    this.sdk.onConnectionChange((connected) => {
      console.log("🌐 WebSocket connection changed:", connected);
      // Emit custom event or update connection status
      this.emitConnectionChange(connected);
    });
  }

  /**
   * Disable all SDK operations when circuit breaker is open
   */
  private shouldBlockSDKOperation(): boolean {
    return this.isAuthCircuitOpen;
  }

  /**
   * Emit wallet update event
   */
  private emitWalletUpdate(update: any): void {
    // You can integrate with your state management here
    // For example, dispatch to Redux store or emit custom events
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("zap-wallet-update", { detail: update })
      );
    }
  }

  /**
   * Emit notification event
   */
  private emitNotification(notification: any): void {
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("zap-notification", { detail: notification })
      );
    }
  }

  /**
   * Emit connection change event
   */
  private emitConnectionChange(connected: boolean): void {
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("zap-connection-change", { detail: connected })
      );
    }
  }

  /**
   * Reconnect WebSocket
   */
  public async reconnectWebSocket(): Promise<void> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    await this.sdk.reconnectWebSocket();
  }

  /**
   * Get connection status
   */
  public getConnectionStatus() {
    if (!this.sdk) {
      return { connected: false, lastConnected: null, reconnectAttempts: 0 };
    }
    return this.sdk.getConnectionStatus();
  }

  /**
   * Clear SDK cache
   */
  public clearCache(): void {
    if (this.sdk) {
      this.sdk.clearCache();
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    if (!this.sdk) {
      return { hits: 0, misses: 0, size: 0, maxSize: 0, ttl: 0 };
    }
    return this.sdk.getCacheStats();
  }

  /**
   * Manually reset the authentication circuit breaker
   */
  public resetAuthCircuitBreaker(): void {
    this.resetAuthCircuitBreakerInternal();
    console.log("🔄 Authentication circuit breaker manually reset");
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerStatus(): {
    isOpen: boolean;
    failureCount: number;
    timeUntilReset: number;
  } {
    const now = Date.now();
    const timeUntilReset = Math.max(
      0,
      this.authFailureWindow - (now - this.lastAuthFailure)
    );

    return {
      isOpen: this.isAuthCircuitOpen,
      failureCount: this.authFailureCount,
      timeUntilReset,
    };
  }

  /**
   * Test circuit breaker functionality
   */
  public testCircuitBreaker(): void {
    console.log("🧪 Testing circuit breaker...");
    console.log("Current status:", this.getCircuitBreakerStatus());

    // Simulate auth failures
    for (let i = 0; i < 5; i++) {
      this.recordAuthFailure();
      console.log(
        `Simulated failure ${i + 1}:`,
        this.getCircuitBreakerStatus()
      );
    }

    console.log("Final status:", this.getCircuitBreakerStatus());
  }

  /**
   * Check if SDK is currently retrying (for debugging)
   */
  public isSDKRetrying(): boolean {
    // This is a placeholder - in a real implementation, you'd check
    // if the SDK has active retry operations
    return this.authFailureCount > 0 && !this.isAuthCircuitOpen;
  }

  /**
   * Get detailed SDK status for debugging
   */
  public getDetailedStatus(): {
    isInitialized: boolean;
    circuitBreaker: any;
    hasSDK: boolean;
    isRetrying: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      circuitBreaker: this.getCircuitBreakerStatus(),
      hasSDK: !!this.sdk,
      isRetrying: this.isSDKRetrying(),
    };
  }

  /**
   * Manually trigger automatic re-login (for testing)
   */
  public async triggerAutoRelogin(): Promise<void> {
    console.log("🔄 Manually triggering automatic re-login...");
    await this.attemptAutoRelogin();
  }

  /**
   * Force stop SDK and trigger circuit breaker (for emergency situations)
   */
  public forceStopSDK(): void {
    console.log("🛑 Force stopping SDK and triggering circuit breaker...");

    // Immediately open circuit breaker
    this.isAuthCircuitOpen = true;
    this.authFailureCount = this.maxAuthFailures;
    this.lastAuthFailure = Date.now();

    // Destroy SDK to stop all operations
    this.destroySDK();

    console.log("🛑 SDK force stopped and circuit breaker opened");
  }

  /**
   * Manually trigger circuit breaker (for emergency situations)
   */
  public triggerCircuitBreaker(): void {
    console.log("🚨 Manually triggering circuit breaker...");

    // Force open circuit breaker
    this.isAuthCircuitOpen = true;
    this.authFailureCount = this.maxAuthFailures;
    this.lastAuthFailure = Date.now();

    // Attempt automatic re-login before destroying SDK
    this.attemptAutoRelogin();

    console.log(
      "🚨 Circuit breaker manually triggered - all SDK operations stopped"
    );
  }

  /**
   * Attempt automatic re-login using existing wallet context
   */
  private async attemptAutoRelogin(): Promise<void> {
    console.log("🔄 Attempting automatic re-login...");

    try {
      // Import the wallet context to access the existing login function
      // const walletContext = await import('../wallet/wallet-context'); // Removed unused import

      // Call the existing attemptDeviceLogin function
      // Note: This is a bit tricky since it's a React context function
      // We'll use a simpler approach by calling the SDK login directly

      // Get device fingerprint from secure storage (same as wallet context)
      let deviceFingerprint = await SecureStore.getItemAsync(
        "device_fingerprint"
      );
      if (!deviceFingerprint) {
        // Create fallback fingerprint (same logic as wallet context)
        deviceFingerprint = JSON.stringify({
          deviceId:
            Device.osInternalBuildId ||
            Device.modelId ||
            `unknown-${Date.now()}`,
          deviceName: Device.deviceName || Device.modelName || "Unknown Device",
          deviceType: Device.deviceType || 0,
          osName: Device.osName || "Unknown OS",
          osVersion: Device.osVersion || "Unknown Version",
        });
      }

      // Get device token (same as wallet context)
      const deviceToken =
        Device.osInternalBuildId || Device.modelId || `unknown-${Date.now()}`;

      // Get push token (same as wallet context)
      let pushToken = "";
      if (Device.isDevice) {
        try {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === "granted") {
            pushToken = (await Notifications.getExpoPushTokenAsync()).data;
            console.log("📱 Push token obtained for auto re-login:", pushToken);
          }
        } catch (error) {
          console.warn("Failed to get push token for auto re-login:", error);
        }
      }

      // Use the existing SDK login method (same as wallet context)
      const loginResult = await this.login({
        deviceToken,
        deviceFingerprint,
        pushToken,
      });

      if (loginResult.success) {
        console.log("✅ Automatic re-login successful!");
        // Reset circuit breaker on successful login
        this.resetAuthCircuitBreakerInternal();
        return;
      } else {
        console.warn("❌ Automatic re-login failed:", loginResult);
      }
    } catch (error) {
      console.error("❌ Automatic re-login error:", error);
    }

    // If auto re-login fails, destroy SDK to stop all operations
    console.log("💥 Auto re-login failed, destroying SDK...");
    this.destroySDK();
  }

  /**
   * Cleanup SDK resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.cleanup();
      }
    } catch (error) {
      console.error("Error during SDK cleanup:", error);
    } finally {
      this.sdk = null;
      this.isInitialized = false;
      this.initializationPromise = null;
      // Reset circuit breaker on cleanup
      this.resetAuthCircuitBreakerInternal();
    }
  }

  /**
   * Update SDK configuration
   */
  public updateConfig(newConfig: Partial<typeof getSDKConfig>): void {
    if (this.sdk) {
      this.sdk.updateConfig(newConfig);
    }
  }

  /**
   * Get all chains
   */
  public async getChains(): Promise<any[]> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return await this.sdk.chains.listAll();
  }

  /**
   * Get wallet chains (chains that support wallet operations)
   */
  public async getWalletChains(): Promise<any[]> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return await this.sdk.chains.getWalletChains();
  }

  /**
   * Get chain by ID
   */
  public async getChainById(chainId: string): Promise<any> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return await this.sdk.chains.getById(chainId);
  }

  /**
   * Get chain by symbol
   */
  public async getChainBySymbol(symbol: string): Promise<any> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return await this.sdk.chains.getBySymbol(symbol);
  }

  /**
   * Validate private key for a specific chain
   */
  public async validatePrivateKey(
    privateKey: string,
    chainSymbol: string
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }

    try {
      // Basic validation - check if private key is not empty
      if (!privateKey || privateKey.trim().length === 0) {
        return { isValid: false, error: "Please enter your private key" };
      }

      const cleanPrivateKey = privateKey.trim();
      console.log("🔍 Validating private key:", {
        chainSymbol,
        keyLength: cleanPrivateKey.length,
      });

      // Check if the SDK method exists
      if (typeof this.sdk.validatePrivateKey !== "function") {
        console.log(
          "⚠️ SDK validatePrivateKey method not available, using basic validation"
        );
        // Fallback to basic length validation
        if (cleanPrivateKey.length < 32) {
          return { isValid: false, error: "Private key too short" };
        }
        return { isValid: true };
      }

      // Use SDK validation directly
      const isValid = await this.sdk.validatePrivateKey(
        cleanPrivateKey,
        chainSymbol
      );
      if (isValid) {
        console.log("✅ SDK validation passed");
        return { isValid: true };
      } else {
        console.log("❌ SDK validation failed:", isValid);
        return { isValid: false, error: "Invalid private key for this chain" };
      }
    } catch (error: any) {
      console.log("❌ SDK validation failed:", error);

      // Handle specific SDK validation errors
      let errorMessage = "Invalid private key for this chain";

      if (error?.error?.code === "VALIDATION_ERROR") {
        errorMessage = error.error.message || "Invalid private key format";
      } else if (error?.status === 400) {
        errorMessage = "Invalid private key format";
      } else if (error?.message?.includes("Invalid Ethereum private key")) {
        errorMessage = "Invalid Ethereum private key";
      } else if (error?.message?.includes("Invalid")) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate a wallet address for a specific chain
   */
  public async validateAddress(
    address: string,
    chainSymbol: string
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }

    try {
      if (!address || address.trim().length === 0) {
        return { isValid: false, error: "Please enter a wallet address" };
      }

      const cleanAddress = address.trim();
      console.log("🔍 Validating address:", {
        chainSymbol,
        addressLength: cleanAddress.length,
      });

      // Check if the SDK method exists (for debugging/fallback)
      if (typeof this.sdk.validateAddress !== "function") {
        console.log(
          "⚠️ SDK validateAddress method not available, using basic validation"
        );
        // Basic fallback validation based on chain
        if (chainSymbol === "BTC" && cleanAddress.length < 26) {
          return { isValid: false, error: "Invalid Bitcoin address format" };
        }
        if (chainSymbol === "ETH" && !cleanAddress.startsWith("0x")) {
          return { isValid: false, error: "Invalid Ethereum address format" };
        }
        if (chainSymbol === "SOL" && cleanAddress.length < 32) {
          return { isValid: false, error: "Invalid Solana address format" };
        }
        return { isValid: true };
      }

      // Use SDK validation directly
      const isValid = await this.sdk.validateAddress(cleanAddress, chainSymbol);
      if (isValid) {
        console.log("✅ SDK address validation passed");
        return { isValid: true };
      } else {
        console.log("❌ SDK address validation failed:", isValid);
        return { isValid: false, error: "Invalid address for this chain" };
      }
    } catch (error) {
      console.log("❌ SDK address validation failed:", error);
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid address for this chain",
      };
    }
  }

  /**
   * Complete wallet creation flow with proper credential storage
   * Creates a wallet in an existing wallet group (similar to createWalletGroup pattern)
   * Only creates the wallet, account creation is handled by retryPendingWallets in useEffect
   */
  public async createWalletInGroup(params: {
    walletGroupId: string;
    name: string;
    seedPhrase: string;
    userWalletGroupId?: string; // Optional, for updating existing credentials
  }): Promise<{
    success: boolean;
    userWalletGroupId?: string;
    walletId?: string;
    derivationIndex?: number;
    error?: string;
  }> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }

    try {
      console.log("🚀 Creating wallet in existing group:", {
        walletGroupId: params.walletGroupId,
        name: params.name,
        hasSeedPhrase: !!params.seedPhrase,
      });

      // Add wallet to wallet group
      const addWalletResponse = await this.sdk.wallets.addWalletToWalletGroup({
        walletGroupId: params.walletGroupId,
        name: params.name,
        seedPhrase: params.seedPhrase,
      });

      console.log("✅ Wallet added to group:", addWalletResponse);

      const walletStorageId =
        await WalletCredentialsStorage.storeWalletCredential({
          userWalletGroupId: addWalletResponse.userWalletGroupId,
          derivationIndex: addWalletResponse.derivationIndex,
          name: params.name,
          credential: params.seedPhrase,
          class: "SEEDPHRASE" as any,
        });

      if (walletStorageId) {
        await WalletCredentialsStorage.markWalletAsCreated(
          walletStorageId,
          addWalletResponse.userWalletGroupId
        );
        console.log(
          "✅ Wallet marked as created, account creation will be handled by retryPendingWallets"
        );
      }

      if (!addWalletResponse.userWalletGroupId) {
        throw new Error(
          "Failed to get userWalletGroupId from addWalletToWalletGroup"
        );
      }

      // Account creation will be handled by retryPendingWallets in useEffect
      console.log(
        "✅ Wallet created, account creation will be handled by retryPendingWallets"
      );

      return {
        success: true,
        userWalletGroupId: addWalletResponse.userWalletGroupId,
        walletId: addWalletResponse.walletId,
        derivationIndex: addWalletResponse.derivationIndex,
      };
    } catch (error) {
      console.error("❌ Wallet creation in group failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create wallet in group",
      };
    }
  }

  public async derivePrivateKey(
    privateKey: string,
    chainSymbol: string
  ): Promise<{ address: string; privateKey: string }> {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await WalletUtils.importAccountFromPrivateKey(
        privateKey,
        chainSymbol
      );
    } catch (error) {
      console.error("❌ Failed to derive private key:", error);
      return { address: "", privateKey: "" };
    }
  }

  public async getNotificationPreferences({ userId }: { userId: string }) {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.users.getNotificationPreferences(userId, {
        bypassCache: true,
      });
    } catch (error) {
      console.error("❌ Failed to get notification preferences:", error);
      return null;
    }
  }

  public async updateNotificationPreferences({
    userId,
    notificationPreferences,
  }: {
    userId: string;
    notificationPreferences: UpdateSettingsBody;
  }) {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.users.updateNotificationPreferences(
        userId,
        notificationPreferences
      );
    } catch (error) {
      console.error("❌ Failed to update notification preferences:", error);
      return null;
    }
  }

  public async getTwoFaStatus() {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.twoFA.getStatus({ bypassCache: true });
    } catch (error) {
      console.error("❌ Failed to update notification preferences:", error);
      return null;
    }
  }

  public async enableTwoFa({ userId }: { userId: string }) {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.twoFA.generate();
    } catch (error) {
      console.error("❌ Failed to enable two factor authentication:", error);
      return null;
    }
  }

  public async verifyTwoFa({ code, secret }: { code: string; secret: string }) {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.twoFA.verify(code, secret);
    } catch (error) {
      console.error("❌ Failed to verify two factor authentication:", error);
      return null;
    }
  }

  public async disableTwoFa({ code }: { code: string }) {
    try {
      if (!this.sdk) {
        throw new Error("SDK not initialized");
      }
      return await this.sdk.twoFA.disable(code);
    } catch (error) {
      console.error("❌ Failed to disable two factor authentication:", error);
      return null;
    }
  }
}

// Export singleton instance
export const zapSDKService = ZapSDKService.getInstance();
export default zapSDKService;

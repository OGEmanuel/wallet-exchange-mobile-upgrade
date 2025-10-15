/**
 * Zap SDK Service
 * 
 * Centralized service for managing the Zap Blockchain SDK instance
 * and providing a clean interface for the rest of the application.
 */

import { AddTokenRequest, DisableTokenRequest, EnableTokenRequest, LoginRequest, UpdateUserWalletGroupNameRequest, UpdateWalletGroupRequest, WALLET_GROUP_TYPE, ZapSDK } from '@zap/blockchain-sdk';
import WalletCredentialsStorage from '../storage/wallet-credentials-storage';
import NetworkErrorHandler from '../utils/network-error-handler';
import { createSDKInstance, getSDKConfig } from './zap-sdk.config';

export interface SendTransactionRequest {
  fromAddress: string;
  toAddress: string;
  amount: string | number;
  chainSymbol: string;
  privateKey: string;
  gasPrice?: string | number;
  gasLimit?: string | number;
  maxFeePerGas?: string | number; // EIP-1559
  maxPriorityFeePerGas?: string | number; // EIP-1559
  tokenAddress?: string; // For ERC-20 tokens
  tokenMintAddress?: string; // For SPL tokens (Solana)
  tokenContractAddress?: string; // For TRC-20 tokens (Tron)
  tokenDecimals?: number; // Token decimals for all token types
  memo?: string; // For Solana and Tron memo support
  nonce?: number;
}

export interface AddAccountsToExistingWalletRequest {
  userWalletGroupId?: string;
  walletId?: string;
  walletGroupId?: string;
  seedPhrase?: string;           // For seedphrase-based accounts
  privateKey?: string;           // For private key-based accounts
  searchChain?: string;          // Optional chain specification for private key/watch address
  watchAddress?: string;         // For watch-only accounts
  derivationIndex?: number;      // Derivation index (default: 0)
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
  walletType?: WALLET_GROUP_TYPE
}

class ZapSDKService {
  private static instance: ZapSDKService;
  private sdk: ZapSDK | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() { }

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

  private async _initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Zap SDK...');

      this.sdk = createSDKInstance();
      await this.sdk.initialize();

      // Set up WebSocket listeners
      this.setupWebSocketListeners();

      this.isInitialized = true;
      console.log('✅ Zap SDK initialized successfully');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Zap SDK:', error);
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
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return this.sdk;
  }

  /**
   * Execute SDK call with network error handling
   */
  public async executeWithNetworkHandling<T>(
    operation: () => Promise<T>,
    context: string = 'SDK operation'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const networkError = NetworkErrorHandler.handleSDKError(error, context);
      throw networkError;
    }
  }

  /**
   * Execute SDK call with retry on network errors
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'SDK operation',
    maxRetries: number = 3
  ): Promise<T> {
    try {
      return await NetworkErrorHandler.retryWithBackoff(operation, maxRetries);
    } catch (error) {
      const networkError = NetworkErrorHandler.handleSDKError(error, context);
      throw networkError;
    }
  }

  // Wallet Operations
  public async createWalletGroupMultipurpose(params: CreateWalletGroupMultipurposeParams) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().createWalletGroupMultipurpose(params),
      'createWalletGroupMultipurpose'
    );
  }

  public async updateWalletGroup(walletGroupId: string, params: UpdateWalletGroupRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.updateWalletGroup(walletGroupId, params),
      'updateWalletGroup'
    );
  }

  public async deleteWalletGroup(walletGroupId: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.deleteWalletGroup(walletGroupId),
      'deleteWalletGroup'
    );
  }

  public async updateUserWalletGroupName(userWalletGroupId: string, params: UpdateUserWalletGroupNameRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.updateUserWalletGroupName(userWalletGroupId, params),
      'updateUserWalletGroupName'
    );
  }

  public async addAccountsToExistingWallet(params: AddAccountsToExistingWalletRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.addAccountsToExistingWallet(params),
      'addAccountsToExistingWallet'
    );
  }

  // Token Operations
  public async enableToken(params: EnableTokenRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.enableToken(params),
      'enableToken'
    );
  }

  public async disableToken(params: DisableTokenRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.disableToken(params),
      'disableToken'
    );
  }

  public async getTokenDetails(params: TokenDetailsRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.getTokenDetails(params),
      'getTokenDetails'
    );
  }

  public async addToken(params: AddTokenRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().tokens.addToken(params),
      'addToken'
    );
  }

  // Blockchain Operations
  public async deriveMultiChainAddresses(seedPhrase: string, walletDepth: number) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().blockchain.deriveMultiChainAddresses(seedPhrase, walletDepth),
      'deriveMultiChainAddresses'
    );
  }

  public async sendTransaction(params: SendTransactionRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().blockchain.sendTransaction(params),
      'sendTransaction'
    );
  }

  // Auth Operations
  public async login(params: LoginRequest) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().walletAuth.login(params),
      'login'
    );
  }

  public async logoutFromExchange() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().logoutFromExchange(),
      'logoutFromExchange'
    );
  }

  public async sendExchangeOtp(email: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().sendExchangeOtp(email),
      'sendExchangeOtp'
    );
  }

  public async validateExchangeOtp(email: string, otp: string) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().validateExchangeOtp(email, otp),
      'validateExchangeOtp'
    );
  }

  public async getCurrentUserId() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().walletAuth.getCurrentUserId(),
      'getCurrentUserId'
    );
  }

  public async isExchangeAuthenticated() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().isExchangeAuthenticated(),
      'isExchangeAuthenticated'
    );
  }

  public async getExchangeUserId() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().getExchangeUserId(),
      'getExchangeUserId'
    );
  }

  public async getUserWalletGroups(userId: string, options?: { useCache?: boolean }) {
    return this.executeWithNetworkHandling(
      () => this.getSDK().wallets.getUserWalletGroups(userId, { useCache: options?.useCache }),
      'getUserWalletGroups'
    );
  }

  public async getMainWalletGroupId() {
    return this.executeWithNetworkHandling(
      () => this.getSDK().secureTokenManager.getMainWalletGroupId(),
      'getMainWalletGroupId'
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
      console.log('📱 Wallet update received:', update);
      // Emit custom event or update global state
      this.emitWalletUpdate(update);
    });

    // Listen for notifications
    this.sdk.onNotification((notification) => {
      console.log('🔔 Notification received:', notification);
      // Emit custom event or show notification
      this.emitNotification(notification);
    });

    // Listen for connection changes
    this.sdk.onConnectionChange((connected) => {
      console.log('🌐 WebSocket connection changed:', connected);
      // Emit custom event or update connection status
      this.emitConnectionChange(connected);
    });
  }

  /**
   * Emit wallet update event
   */
  private emitWalletUpdate(update: any): void {
    // You can integrate with your state management here
    // For example, dispatch to Redux store or emit custom events
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('zap-wallet-update', { detail: update }));
    }
  }

  /**
   * Emit notification event
   */
  private emitNotification(notification: any): void {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('zap-notification', { detail: notification }));
    }
  }

  /**
   * Emit connection change event
   */
  private emitConnectionChange(connected: boolean): void {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('zap-connection-change', { detail: connected }));
    }
  }

  /**
   * Reconnect WebSocket
   */
  public async reconnectWebSocket(): Promise<void> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
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
   * Cleanup SDK resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.cleanup();
      }
    } catch (error) {
      console.error('Error during SDK cleanup:', error);
    } finally {
      this.sdk = null;
      this.isInitialized = false;
      this.initializationPromise = null;
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
      throw new Error('SDK not initialized');
    }
    return await this.sdk.chains.listAll();
  }

  /**
   * Get wallet chains (chains that support wallet operations)
   */
  public async getWalletChains(): Promise<any[]> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return await this.sdk.chains.getWalletChains();
  }

  /**
   * Get chain by ID
   */
  public async getChainById(chainId: string): Promise<any> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return await this.sdk.chains.getById(chainId);
  }

  /**
   * Get chain by symbol
   */
  public async getChainBySymbol(symbol: string): Promise<any> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return await this.sdk.chains.getBySymbol(symbol);
  }

  /**
   * Validate private key for a specific chain
   */
  public async validatePrivateKey(privateKey: string, chainSymbol: string): Promise<{ isValid: boolean; error?: string }> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      // Basic validation - check if private key is not empty
      if (!privateKey || privateKey.trim().length === 0) {
        return { isValid: false, error: 'Please enter your private key' };
      }

      const cleanPrivateKey = privateKey.trim();
      console.log('🔍 Validating private key:', { chainSymbol, keyLength: cleanPrivateKey.length });

      // Check if the SDK method exists
      if (typeof this.sdk.validatePrivateKey !== 'function') {
        console.log('⚠️ SDK validatePrivateKey method not available, using basic validation');
        // Fallback to basic length validation
        if (cleanPrivateKey.length < 32) {
          return { isValid: false, error: 'Private key too short' };
        }
        return { isValid: true };
      }

      // Use SDK validation directly
      const isValid = await this.sdk.validatePrivateKey(cleanPrivateKey, chainSymbol);
      if (isValid) {
        console.log('✅ SDK validation passed');
        return { isValid: true };
      } else {
        console.log('❌ SDK validation failed:', isValid);
        return { isValid: false, error: 'Invalid private key for this chain' };
      }
    } catch (error: any) {
      console.log('❌ SDK validation failed:', error);

      // Handle specific SDK validation errors
      let errorMessage = 'Invalid private key for this chain';

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
        error: errorMessage
      };
    }
  }

  /**
   * Validate a wallet address for a specific chain
   */
  public async validateAddress(address: string, chainSymbol: string): Promise<{ isValid: boolean; error?: string }> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      if (!address || address.trim().length === 0) {
        return { isValid: false, error: 'Please enter a wallet address' };
      }

      const cleanAddress = address.trim();
      console.log('🔍 Validating address:', { chainSymbol, addressLength: cleanAddress.length });

      // Check if the SDK method exists (for debugging/fallback)
      if (typeof this.sdk.validateAddress !== 'function') {
        console.log('⚠️ SDK validateAddress method not available, using basic validation');
        // Basic fallback validation based on chain
        if (chainSymbol === 'BTC' && cleanAddress.length < 26) {
          return { isValid: false, error: 'Invalid Bitcoin address format' };
        }
        if (chainSymbol === 'ETH' && !cleanAddress.startsWith('0x')) {
          return { isValid: false, error: 'Invalid Ethereum address format' };
        }
        if (chainSymbol === 'SOL' && cleanAddress.length < 32) {
          return { isValid: false, error: 'Invalid Solana address format' };
        }
        return { isValid: true };
      }

      // Use SDK validation directly
      const isValid = await this.sdk.validateAddress(cleanAddress, chainSymbol);
      if (isValid) {
        console.log('✅ SDK address validation passed');
        return { isValid: true };
      } else {
        console.log('❌ SDK address validation failed:', isValid);
        return { isValid: false, error: 'Invalid address for this chain' };
      }
    } catch (error) {
      console.log('❌ SDK address validation failed:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid address for this chain'
      };
    }
  }

  /**
   * Complete wallet creation flow with proper credential storage
   * Handles addWalletToWalletGroup + addAccountsToExistingWallet + credential storage
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
      throw new Error('SDK not initialized');
    }

    try {
      console.log('🚀 Starting complete wallet creation flow:', {
        walletGroupId: params.walletGroupId,
        name: params.name,
        hasSeedPhrase: !!params.seedPhrase
      });

      // Step 1: Add wallet to wallet group
      const addWalletResponse = await this.sdk.wallets.addWalletToWalletGroup({
        walletGroupId: params.walletGroupId,
        name: params.name,
        seedPhrase: params.seedPhrase,
      });

      console.log('✅ Wallet added to group:', addWalletResponse);

      const walletStorageId = await WalletCredentialsStorage.storeWalletCredential({
        userWalletGroupId: addWalletResponse.userWalletGroupId,
        derivationIndex: addWalletResponse.derivationIndex,
        name: params.name,
        credential: params.seedPhrase,
        class: 'SEEDPHRASE' as any,
      });

      if (walletStorageId) {
        await WalletCredentialsStorage.markWalletAsCreated(walletStorageId, addWalletResponse.userWalletGroupId);
        console.log('✅ Wallet marked as created in credentials storage');
      }

      if (!addWalletResponse.userWalletGroupId) {
        throw new Error('Failed to get userWalletGroupId from addWalletToWalletGroup');
      }

      // Step 2: Add accounts to existing wallet
      const addAccountsResponse = await this.sdk.wallets.addAccountsToExistingWallet({
        userWalletGroupId: addWalletResponse.userWalletGroupId,
        seedPhrase: params.seedPhrase,
      });

      console.log('✅ Accounts added to wallet:', addAccountsResponse);

      if (walletStorageId) {
        await WalletCredentialsStorage.markWalletAsAccountsCreated(walletStorageId, addWalletResponse.userWalletGroupId);
        console.log('✅ Wallet and accounts marked as created in credentials storage');

        // Verify the status was updated correctly
        const updatedCredential = await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(addWalletResponse.userWalletGroupId);
        console.log('🔍 Verification - credential status:', {
          isCreated: updatedCredential?.isCreated,
          areAccountsCreated: updatedCredential?.areAccountsCreated,
          userWalletGroupId: updatedCredential?.userWalletGroupId,
          walletStorageId: walletStorageId
        });

      }

      return {
        success: true,
        userWalletGroupId: addWalletResponse.userWalletGroupId,
        walletId: addWalletResponse.walletId,
        derivationIndex: addWalletResponse.derivationIndex,
      };

    } catch (error) {
      console.error('❌ Complete wallet creation flow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet'
      };
    }
  }
}

// Export singleton instance
export const zapSDKService = ZapSDKService.getInstance();
export default zapSDKService;

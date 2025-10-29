// services/token-manager.ts
import axios, { AxiosInstance } from "axios";
import { storageService } from "../storage/app-storage";
import { StorageKeys } from "../storage/storage-types";
import { refreshTokenEndpoint } from "./api_endpoints";
import { GeneralResponseModel, RefreshTokenResponse } from "./http-types";
import { TokenData } from "./models";

/**
 * Pending request interface for queuing requests during token refresh
 */
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}

/**
 * TokenManager - Handles authentication token management and refresh
 *
 * Features:
 * - Automatic token refresh with retry logic
 * - Request queuing during token refresh
 * - Secure token storage and retrieval
 * - Configurable refresh endpoints
 *
 * @example
 * ```typescript
 * const tokenManager = new TokenManager('https://api.example.com', 30000);
 * const token = await tokenManager.getToken();
 * ```
 */
export class TokenManager {
  private refreshTokenAxiosInstance: AxiosInstance;
  private isRefreshingToken = false;
  private pendingRequests: PendingRequest[] = [];
  private refreshEndpoint: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(
    baseURL: string,
    timeout: number = 20000,
    refreshEndpoint: string = refreshTokenEndpoint
  ) {
    this.refreshEndpoint = refreshEndpoint;
    this.refreshTokenAxiosInstance = axios.create({
      baseURL,
      timeout,
    });
  }

  /**
   * Refreshes the authentication token with retry logic
   * @param retryCount - Current retry attempt (internal use)
   * @returns Promise<string | null> - New token or null if refresh failed
   */
  async refreshToken(retryCount: number = 0): Promise<string | null> {
    try {
      const tokenData = await this.getToken();
      console.log(tokenData);

      if (!tokenData?.refreshToken) {
        throw new Error("No refresh token available");
      }

      // Check if token is expired and needs refresh
      // there currently is not expires at on the token
      if (tokenData.refreshToken && tokenData?.jwt) {
        return tokenData["jwt"] as string;
      }

      const response = await this.refreshTokenAxiosInstance.post<
        GeneralResponseModel<RefreshTokenResponse>
      >(
        this.refreshEndpoint,
        { refreshToken: tokenData.refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.data) {
        throw new Error("Invalid refresh token response");
      }

      const newTokenData: TokenData = {
        token: response.data.data.token || null,
        refreshToken: response.data.data.refreshToken || tokenData.refreshToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      await storageService.save(StorageKeys.TOKEN_DATA, newTokenData);
      return newTokenData.token;
    } catch (error) {
      console.error(`Token refresh failed (attempt ${retryCount + 1}):`, error);

      // Retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.refreshToken(retryCount + 1);
      }

      // Clear invalid tokens on final failure
      await this.clearTokens();
      throw error;
    }
  }

  /**
   * Gets the current token from storage
   * @returns Promise<TokenData | null> - Token data or null
   */
  async getToken(): Promise<TokenData | null> {
    try {
      return await storageService.get<TokenData>(StorageKeys.TOKEN_DATA);
    } catch (error) {
      console.warn("Failed to get token from storage:", error);
      return null;
    }
  }

  /**
   * Handles authentication failure by clearing stored data
   */
  async handleAuthFailure(): Promise<void> {
    try {
      await this.clearTokens();
      await storageService.remove(StorageKeys.USER_PROFILE);
      // Navigate to login screen - you'll need to implement this based on your navigation
      // NavigationService.navigate('Login');
    } catch (error) {
      console.error("Failed to handle auth failure:", error);
    }
  }

  /**
   * Clears all stored tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await storageService.remove(StorageKeys.TOKEN_DATA);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  /**
   * Checks if token refresh is in progress
   * @returns boolean - True if refresh is in progress
   */
  isRefreshing(): boolean {
    return this.isRefreshingToken;
  }

  /**
   * Sets the refreshing token state
   * @param refreshing - Whether refresh is in progress
   */
  setRefreshing(refreshing: boolean): void {
    this.isRefreshingToken = refreshing;
  }

  /**
   * Adds a pending request to the queue
   * @param request - The pending request
   */
  addPendingRequest(request: PendingRequest): void {
    this.pendingRequests.push(request);
  }

  /**
   * Processes all pending requests with a new token
   * @param newToken - The new token to use
   * @param axiosInstance - The axios instance to use for requests
   */
  processPendingRequests(
    newToken: string | null,
    axiosInstance: AxiosInstance
  ): void {
    this.pendingRequests.forEach(({ resolve, reject, config }) => {
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        axiosInstance.request(config).then(resolve).catch(reject);
      } else {
        reject(new Error("Token refresh failed"));
      }
    });
    this.pendingRequests = [];
  }

  /**
   * Rejects all pending requests with an error
   * @param error - The error to reject with
   */
  rejectPendingRequests(error: any): void {
    this.pendingRequests.forEach(({ reject }) => reject(error));
    this.pendingRequests = [];
  }

  /**
   * Clears all pending requests
   */
  clearPendingRequests(): void {
    this.pendingRequests = [];
  }
}

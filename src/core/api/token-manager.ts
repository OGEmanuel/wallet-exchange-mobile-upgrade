// services/token-manager.ts
import axios, { AxiosInstance } from 'axios';
import { storageService } from '../storage/app-storage';
import { StorageKeys } from '../storage/storage-types';
import { GeneralResponseModel, RefreshTokenResponse } from './http-types';
import { TokenData } from './models';

export class TokenManager {
  private refreshTokenAxiosInstance: AxiosInstance;
  private isRefreshingToken = false;
  private pendingRequests: {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
    config: any;
  }[] = [];

  constructor(baseURL: string, timeout: number = 20000) {
    this.refreshTokenAxiosInstance = axios.create({
      baseURL,
      timeout,
    });
  }

  /**
   * Refreshes the authentication token
   * @returns Promise<string | null> - New token or null if refresh failed
   */
  async refreshToken(): Promise<string | null> {
    try {
      const tokenData = await storageService.get<TokenData>(StorageKeys.TOKEN_DATA);
      
      if (!tokenData?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.refreshTokenAxiosInstance.post<GeneralResponseModel<RefreshTokenResponse>>(
        '/auth/refresh-token',
        { refreshToken: tokenData.refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`,
          },
        }
      );

      const newTokenData: TokenData = {
        token: response.data?.data?.token || null,
        refreshToken: response.data?.data?.refreshToken || null,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      await storageService.save(StorageKeys.TOKEN_DATA, newTokenData);
      return newTokenData?.token || null;
    } catch (error) {
      console.error('Token refresh failed:', error);
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
      console.warn('Failed to get token from storage:', error);
      return null;
    }
  }

  /**
   * Handles authentication failure by clearing stored data
   */
  async handleAuthFailure(): Promise<void> {
    try {
      await storageService.remove(StorageKeys.TOKEN_DATA);
      await storageService.remove(StorageKeys.USER_PROFILE);
      // Navigate to login screen - you'll need to implement this based on your navigation
      // NavigationService.navigate('Login');
    } catch (error) {
      console.error('Failed to handle auth failure:', error);
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
  addPendingRequest(request: {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
    config: any;
  }): void {
    this.pendingRequests.push(request);
  }

  /**
   * Processes all pending requests with a new token
   * @param newToken - The new token to use
   * @param axiosInstance - The axios instance to use for requests
   */
  processPendingRequests(newToken: string | null, axiosInstance: AxiosInstance): void {
    this.pendingRequests.forEach(({ resolve, reject, config }) => {
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        axiosInstance
          .request(config)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Token refresh failed'));
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



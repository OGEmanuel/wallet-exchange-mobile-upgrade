/**
 * SDK-based Address Book Service
 * 
 * Handles all address book operations using the Zap SDK with proper token management
 * and authentication for both exchange and wallet users.
 */

import { ENVIRONMENTS } from '@/configs/environments';
import axios from 'axios';
import { httpClient } from '../api/http-client';
import { zapSDKService } from './zap-sdk.service';

export interface AddressBookItem {
  _id: string;
  name: string;
  address: string;
  chainId: string;
  chainSymbol?: string;
  chainName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressBookRequest {
  name: string;
  address: string;
  chainId: string;
}

export interface UpdateAddressBookRequest {
  _id: string;
  name?: string;
  address?: string;
  chainId?: string;
}

class AddressBookSDKService {
  private static instance: AddressBookSDKService;
  private baseURL: string;

  private constructor() {
    this.baseURL = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL || 
                   process.env.EXPO_PUBLIC_API_BASE_URL || 
                   "https://test-backend-2.zap.africa";
  }

  /**
   * Get exchange token from SDK for authenticated requests
   */
  private async getExchangeToken(): Promise<string | null> {
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) return null;
      
      // Check if exchange user is authenticated
      const isAuthenticated = await sdk.isExchangeAuthenticated();
      if (!isAuthenticated) return null;
      
      // Get the actual exchange token from the SDK
      const tokens = await sdk.exchangeAuth.getTokens();
      const token = tokens?.token || null;
      console.log("🔑 Exchange token retrieved:", token ? "Token available" : "No token");
      return token;
    } catch (error) {
      console.error('Failed to get exchange token:', error);
      return null;
    }
  }

  /**
   * Make authenticated request using exchange token
   */
  private async makeExchangeRequest(method: string, url: string, data?: any, params?: any) {
    const token = await this.getExchangeToken();
    console.log("token ", token)
    if (!token) {
      throw new Error('Exchange authentication required');
    }

    const response = await axios({
      method,
      url: `${this.baseURL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data,
      params,
    });

    return response;
  }

  public static getInstance(): AddressBookSDKService {
    if (!AddressBookSDKService.instance) {
      AddressBookSDKService.instance = new AddressBookSDKService();
    }
    return AddressBookSDKService.instance;
  }

  /**
   * Get user addresses using HTTP client with proper authentication
   */
  public async getUserAddresses(userId: string, isExchangeUser: boolean = false): Promise<AddressBookItem[]> {
    try {
      console.log('🔍 SDK: Fetching user addresses for:', userId, 'isExchangeUser:', isExchangeUser);
      
      if (isExchangeUser) {
        // For exchange users, use exchange authentication
        console.log('🔍 Exchange user detected - using exchange authentication');
        
        const response = await this.makeExchangeRequest('GET', `/address-book/user/${userId}`);
        
        console.log('✅ SDK: Exchange user addresses fetched successfully:', (response?.data as AddressBookItem[])?.length || 0);
        return (response?.data as AddressBookItem[]) || [];
      }
      
      // Use HTTP client which handles authentication through TokenManager for wallet users
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.get(`/address-book/user/${userId}`);
        },
        'Get User Addresses'
      );

      console.log('✅ SDK: User addresses fetched successfully:', (response?.data as AddressBookItem[])?.length || 0);
      return (response?.data as AddressBookItem[]) || [];
    } catch (error) {
      console.error('❌ SDK: Failed to fetch user addresses:', error);
      throw error;
    }
  }

  /**
   * Create new address book entry using HTTP client with proper authentication
   */
  public async createAddressBook(
    userId: string, 
    addressData: CreateAddressBookRequest,
    isExchangeUser: boolean = false
  ): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Creating address book entry:', { userId, addressData, isExchangeUser });
      
      if (isExchangeUser) {
        // For exchange users, use exchange authentication
        console.log('🔍 Exchange user detected - using exchange authentication');
        
        const response = await this.makeExchangeRequest('POST', '/address-book', {
          ...addressData,
          userId,
        });

        console.log('✅ SDK: Exchange address book entry created successfully:', response?.data);
        return response?.data as AddressBookItem;
      }
      
      // For wallet users, use the standard SDK authentication
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.post('/address-book', {
            ...addressData,
            userId,
          });
        },
        'Create Address Book Entry'
      );

      console.log('✅ SDK: Address book entry created successfully:', response?.data);
      return response?.data as AddressBookItem;
    } catch (error) {
      console.error('❌ SDK: Failed to create address book entry:', error);
      throw error;
    }
  }

  /**
   * Update address book entry using HTTP client with SDK authentication
   */
  public async updateAddressBook(
    addressId: string, 
    addressData: UpdateAddressBookRequest
  ): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Updating address book entry:', { addressId, addressData });
      
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.put(`/address-book/${addressId}`, addressData);
        },
        'Update Address Book Entry'
      );

      console.log('✅ SDK: Address book entry updated successfully:', response?.data);
      return response?.data as AddressBookItem;
    } catch (error) {
      console.error('❌ SDK: Failed to update address book entry:', error);
      throw error;
    }
  }

  /**
   * Delete address book entry using HTTP client with SDK authentication
   */
  public async deleteAddressBook(addressId: string): Promise<boolean> {
    try {
      console.log('🔍 SDK: Deleting address book entry:', addressId);
      
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.delete(`/address-book/${addressId}`);
        },
        'Delete Address Book Entry'
      );

      console.log('✅ SDK: Address book entry deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ SDK: Failed to delete address book entry:', error);
      throw error;
    }
  }

  /**
   * Get address book entry by ID using HTTP client with SDK authentication
   */
  public async getAddressBookById(addressId: string): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Fetching address book entry:', addressId);
      
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.get(`/address-book/${addressId}`);
        },
        'Get Address Book Entry'
      );

      console.log('✅ SDK: Address book entry fetched successfully:', response?.data);
      return response?.data as AddressBookItem;
    } catch (error) {
      console.error('❌ SDK: Failed to fetch address book entry:', error);
      throw error;
    }
  }

  /**
   * Search addresses by name or address using HTTP client with SDK authentication
   */
  public async searchAddresses(
    userId: string, 
    query: string
  ): Promise<AddressBookItem[]> {
    try {
      console.log('🔍 SDK: Searching addresses:', { userId, query });
      
      const response = await zapSDKService.executeWithNetworkHandling(
        async () => {
          return await httpClient.get(`/address-book/user/${userId}/search`, {
            params: { q: query }
          });
        },
        'Search Addresses'
      );

      console.log('✅ SDK: Address search completed:', (response?.data as AddressBookItem[])?.length || 0);
      return (response?.data as AddressBookItem[]) || [];
    } catch (error) {
      console.error('❌ SDK: Failed to search addresses:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const addressBookSDKService = AddressBookSDKService.getInstance();

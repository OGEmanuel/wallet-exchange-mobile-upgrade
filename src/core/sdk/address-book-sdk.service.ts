/**
 * SDK-based Address Book Service
 * 
 * Handles all address book operations using the Zap SDK's addressBook client.
 * According to the SDK guide, address book operations require wallet authentication.
 */

import { zapSDKService } from './zap-sdk.service';

export interface AddressBookItem {
  _id: string;
  name: string;
  address: string;
  chainId: string;
  userId?: string;
  icon?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  chainSymbol?: string;
  chainName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressBookRequest {
  name: string;
  address: string;
  chainId: string;
  icon?: string;
}

export interface UpdateAddressBookRequest {
  name?: string;
  address?: string;
  chainId?: string;
  icon?: string;
}

class AddressBookSDKService {
  private static instance: AddressBookSDKService;

  private constructor() {}

  public static getInstance(): AddressBookSDKService {
    if (!AddressBookSDKService.instance) {
      AddressBookSDKService.instance = new AddressBookSDKService();
    }
    return AddressBookSDKService.instance;
  }

  /**
   * Get the SDK instance and ensure wallet authentication
   */
  private async getSDK() {
    const sdk = zapSDKService.getSDK();
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    
    // Check if wallet is authenticated (required for address book operations)
    const isWalletAuthenticated = await sdk.isWalletAuthenticated();
    if (!isWalletAuthenticated) {
      throw new Error('Wallet authentication required. Please login with wallet authentication first.');
    }
    
    return sdk;
  }

  /**
   * Get all address book entries for the current authenticated user
   * Uses SDK's addressBook.getAll() method
   */
  public async getUserAddresses(userId: string, isExchangeUser: boolean = false): Promise<AddressBookItem[]> {
    try {
      console.log('🔍 SDK: Fetching user addresses for:', userId, 'isExchangeUser:', isExchangeUser);
      
      // Note: According to SDK guide, address book requires wallet authentication
      // Exchange users may need to use wallet auth for address book operations
      const sdk = await this.getSDK();
      
      // Use SDK's addressBook.getAll() method
      // This gets all entries for the currently authenticated wallet user
      const entries = await sdk.addressBook.getAll({ bypassCache: false });
      
      console.log('✅ SDK: User addresses fetched successfully:', entries?.length || 0);
      return (entries as AddressBookItem[]) || [];
    } catch (error: any) {
      console.error('❌ SDK: Failed to fetch user addresses:', error);
      // If wallet auth fails, try to get by userId as fallback
      if (error?.message?.includes('authentication')) {
        try {
          const sdk = await this.getSDK();
          const entries = await sdk.addressBook.getAllByUserId(userId, { bypassCache: false });
          return (entries as AddressBookItem[]) || [];
        } catch {
          throw error; // Throw original error
        }
      }
      throw error;
    }
  }

  /**
   * Create new address book entry using SDK's addressBook.create() method
   */
  public async createAddressBook(
    userId: string, 
    addressData: CreateAddressBookRequest,
    isExchangeUser: boolean = false
  ): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Creating address book entry:', { userId, addressData, isExchangeUser });
      
      const sdk = await this.getSDK();
      
      // Use SDK's addressBook.create() method
      // According to guide, this requires wallet authentication
      const entry = await sdk.addressBook.create({
        name: addressData.name,
        address: addressData.address,
        chainId: addressData.chainId,
        icon: addressData.icon,
      });

      console.log('✅ SDK: Address book entry created successfully:', entry);
      return entry as AddressBookItem;
    } catch (error: any) {
      console.error('❌ SDK: Failed to create address book entry:', error);
      
      // Provide more helpful error messages
      if (error?.code === 'VALIDATION_ERROR') {
        throw new Error(error.message || 'Invalid address or chain. Please check your input.');
      } else if (error?.code === 'AUTH_ERROR') {
        throw new Error('Wallet authentication required. Please login with wallet authentication first.');
      }
      
      throw error;
    }
  }

  /**
   * Update address book entry using SDK's addressBook.update() method
   */
  public async updateAddressBook(
    addressId: string, 
    addressData: UpdateAddressBookRequest
  ): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Updating address book entry:', { addressId, addressData });
      
      const sdk = await this.getSDK();
      
      // Use SDK's addressBook.update() method
      const updatedEntry = await sdk.addressBook.update(addressId, {
        name: addressData.name,
        address: addressData.address,
        chainId: addressData.chainId,
        icon: addressData.icon,
      });

      console.log('✅ SDK: Address book entry updated successfully:', updatedEntry);
      return updatedEntry as AddressBookItem;
    } catch (error: any) {
      console.error('❌ SDK: Failed to update address book entry:', error);
      
      if (error?.code === 'NOT_FOUND') {
        throw new Error('Address book entry not found');
      } else if (error?.code === 'AUTH_ERROR') {
        throw new Error('Wallet authentication required');
      }
      
      throw error;
    }
  }

  /**
   * Delete address book entry using SDK's addressBook.delete() method
   */
  public async deleteAddressBook(addressId: string): Promise<boolean> {
    try {
      console.log('🔍 SDK: Deleting address book entry:', addressId);
      
      const sdk = await this.getSDK();
      
      // Use SDK's addressBook.delete() method
      const deleted = await sdk.addressBook.delete(addressId);

      console.log('✅ SDK: Address book entry deleted successfully:', deleted);
      return deleted;
    } catch (error: any) {
      console.error('❌ SDK: Failed to delete address book entry:', error);
      
      if (error?.code === 'NOT_FOUND') {
        throw new Error('Address book entry not found');
      } else if (error?.code === 'AUTH_ERROR') {
        throw new Error('Wallet authentication required');
      }
      
      throw error;
    }
  }

  /**
   * Get address book entry by ID using SDK's addressBook.getById() method
   */
  public async getAddressBookById(addressId: string): Promise<AddressBookItem> {
    try {
      console.log('🔍 SDK: Fetching address book entry:', addressId);
      
      const sdk = await this.getSDK();
      
      // Use SDK's addressBook.getById() method
      const entry = await sdk.addressBook.getById(addressId, { bypassCache: false });

      console.log('✅ SDK: Address book entry fetched successfully:', entry);
      return entry as AddressBookItem;
    } catch (error: any) {
      console.error('❌ SDK: Failed to fetch address book entry:', error);
      
      if (error?.code === 'NOT_FOUND') {
        throw new Error('Address book entry not found');
      } else if (error?.code === 'AUTH_ERROR') {
        throw new Error('Wallet authentication required');
      }
      
      throw error;
    }
  }

  /**
   * Search addresses by name or address
   * Since SDK doesn't have a search method, we fetch all and filter client-side
   */
  public async searchAddresses(
    userId: string, 
    query: string
  ): Promise<AddressBookItem[]> {
    try {
      console.log('🔍 SDK: Searching addresses:', { userId, query });
      
      const sdk = await this.getSDK();
      
      // Get all entries and filter client-side
      const allEntries = await sdk.addressBook.getAll({ bypassCache: false });
      
      if (!query || query.trim().length === 0) {
        return (allEntries as AddressBookItem[]) || [];
      }
      
      const lowerQuery = query.toLowerCase();
      const filtered = allEntries.filter((entry: any) => 
        entry.name?.toLowerCase().includes(lowerQuery) ||
        entry.address?.toLowerCase().includes(lowerQuery)
      );

      console.log('✅ SDK: Address search completed:', filtered?.length || 0);
      return (filtered as AddressBookItem[]) || [];
    } catch (error: any) {
      console.error('❌ SDK: Failed to search addresses:', error);
      throw error;
    }
  }

  /**
   * Clear address book cache for a user
   */
  public clearUserCache(userId: string): void {
    try {
      const sdk = zapSDKService.getSDK();
      if (sdk) {
        sdk.addressBook.clearUserCache(userId);
        console.log('✅ SDK: Address book cache cleared for user:', userId);
      }
    } catch (error) {
      console.warn('⚠️ SDK: Failed to clear address book cache:', error);
    }
  }

  /**
   * Clear all address book cache
   */
  public clearCache(): void {
    try {
      const sdk = zapSDKService.getSDK();
      if (sdk) {
        sdk.addressBook.clearCache();
        console.log('✅ SDK: All address book cache cleared');
      }
    } catch (error) {
      console.warn('⚠️ SDK: Failed to clear address book cache:', error);
    }
  }
}

// Export singleton instance
export const addressBookSDKService = AddressBookSDKService.getInstance();

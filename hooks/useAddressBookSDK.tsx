/**
 * SDK-based Address Book Hook
 * 
 * Provides address book operations using the Zap SDK with proper authentication
 * and token management for both exchange and wallet users.
 */

import { AddressBookItem, addressBookSDKService, CreateAddressBookRequest, UpdateAddressBookRequest } from '@/src/core/sdk/address-book-sdk.service';
import { AppRootState } from '@/state';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useExchangeAuth } from './useExchangeAuth';

export const useAddressBookSDK = () => {
  const [addresses, setAddresses] = useState<AddressBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  /**
   * Get user addresses based on current tab
   */
  const getUserAddresses = useCallback(async (tab: 'exchange' | 'wallet'): Promise<AddressBookItem[]> => {
    try {
      setIsLoading(true);
      setError(null);

      let userId: string | null = null;

      if (tab === 'exchange') {
        if (!isExchangeAuthenticated || !exchangeUserData?._id) {
          throw new Error('Exchange user not authenticated');
        }
        userId = exchangeUserData._id;
      } else {
        if (!user?._id) {
          throw new Error('Wallet user not authenticated');
        }
        userId = user._id;
      }

      if (!userId) {
        throw new Error('No user ID available');
      }

      console.log(`🔍 SDK: Fetching addresses for ${tab} tab, userId:`, userId);
      const fetchedAddresses = await addressBookSDKService.getUserAddresses(userId, tab === 'exchange');
      
      setAddresses(fetchedAddresses);
      return fetchedAddresses;
    } catch (error) {
      console.error('❌ SDK: Failed to fetch addresses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch addresses';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isExchangeAuthenticated, exchangeUserData?._id, user?._id]);

  /**
   * Create new address book entry
   */
  const createAddressBook = useCallback(async (
    tab: 'exchange' | 'wallet',
    addressData: CreateAddressBookRequest
  ): Promise<AddressBookItem> => {
    try {
      setIsLoading(true);
      setError(null);

      let userId: string | null = null;

      if (tab === 'exchange') {
        if (!isExchangeAuthenticated || !exchangeUserData?._id) {
          throw new Error('Exchange user not authenticated');
        }
        userId = exchangeUserData._id;
      } else {
        if (!user?._id) {
          throw new Error('Wallet user not authenticated');
        }
        userId = user._id;
      }

      if (!userId) {
        throw new Error('No user ID available');
      }

      console.log(`🔍 SDK: Creating address for ${tab} tab, userId:`, userId, addressData);
      const newAddress = await addressBookSDKService.createAddressBook(userId, addressData, tab === 'exchange');
      
      // Add to local state
      setAddresses(prev => [...prev, newAddress]);
      return newAddress;
    } catch (error) {
      console.error('❌ SDK: Failed to create address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create address';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isExchangeAuthenticated, exchangeUserData?._id, user?._id]);

  /**
   * Update address book entry
   */
  const updateAddressBook = useCallback(async (
    addressId: string,
    addressData: UpdateAddressBookRequest
  ): Promise<AddressBookItem> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 SDK: Updating address:', addressId, addressData);
      const updatedAddress = await addressBookSDKService.updateAddressBook(addressId, addressData);
      
      // Update local state
      setAddresses(prev => prev.map(addr => 
        addr._id === addressId ? updatedAddress : addr
      ));
      return updatedAddress;
    } catch (error) {
      console.error('❌ SDK: Failed to update address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete address book entry
   */
  const deleteAddressBook = useCallback(async (addressId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 SDK: Deleting address:', addressId);
      const success = await addressBookSDKService.deleteAddressBook(addressId);
      
      if (success) {
        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      }
      return success;
    } catch (error) {
      console.error('❌ SDK: Failed to delete address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search addresses
   */
  const searchAddresses = useCallback(async (
    tab: 'exchange' | 'wallet',
    query: string
  ): Promise<AddressBookItem[]> => {
    try {
      setIsLoading(true);
      setError(null);

      let userId: string | null = null;

      if (tab === 'exchange') {
        if (!isExchangeAuthenticated || !exchangeUserData?._id) {
          throw new Error('Exchange user not authenticated');
        }
        userId = exchangeUserData._id;
      } else {
        if (!user?._id) {
          throw new Error('Wallet user not authenticated');
        }
        userId = user._id;
      }

      if (!userId) {
        throw new Error('No user ID available');
      }

      console.log(`🔍 SDK: Searching addresses for ${tab} tab:`, query);
      const searchResults = await addressBookSDKService.searchAddresses(userId, query);
      return searchResults;
    } catch (error) {
      console.error('❌ SDK: Failed to search addresses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search addresses';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isExchangeAuthenticated, exchangeUserData?._id, user?._id]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear addresses
   */
  const clearAddresses = useCallback(() => {
    setAddresses([]);
  }, []);

  return {
    // State
    addresses,
    isLoading,
    error,
    
    // Actions
    getUserAddresses,
    createAddressBook,
    updateAddressBook,
    deleteAddressBook,
    searchAddresses,
    clearError,
    clearAddresses,
  };
};

/**
 * Utility to sync SDK tokens to httpClient storage
 * 
 * The SDK manages its own authentication internally, but httpClient needs
 * tokens to be available in StorageKeys.TOKEN_DATA for non-SDK API calls.
 * 
 * This utility extracts tokens from the SDK and saves them to httpClient's storage.
 */

import zapSDKService from '../sdk/zap-sdk.service';
import storageService from '../storage/app-storage';
import { StorageKeys } from '../storage/storage-types';

/**
 * Syncs SDK tokens to httpClient storage
 * 
 * Gets tokens from the SDK's exchangeAuth and saves them to TOKEN_DATA
 * for httpClient to use
 */
export async function syncSDKTokensToHttpClient(): Promise<boolean> {
    try {
        console.log('🔄 Attempting to sync SDK tokens to httpClient storage...');

        // Get tokens from SDK's exchangeAuth
        const { token, refreshToken } = await zapSDKService.getExchangeTokens();

        if (token) {
            const tokenData = {
                token,
                refreshToken: refreshToken || null,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            };

            await storageService.save(StorageKeys.TOKEN_DATA, tokenData);
            console.log('✅ SDK tokens successfully synced to httpClient storage');
            return true;
        } else {
            console.warn('⚠️ No SDK tokens found to sync');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to sync SDK tokens:', error);
        return false;
    }
}

/**
 * Call this function after app initialization to ensure tokens are synced
 */
export async function ensureTokensAreSynced(): Promise<void> {
    // Check if httpClient already has tokens
    const existingTokenData = await storageService.get(StorageKeys.TOKEN_DATA);

    if (!existingTokenData || !existingTokenData.token) {
        console.log('ℹ️ httpClient has no tokens, attempting to sync from SDK...');
        await syncSDKTokensToHttpClient();
    } else {
        console.log('✅ httpClient already has tokens');
    }
}

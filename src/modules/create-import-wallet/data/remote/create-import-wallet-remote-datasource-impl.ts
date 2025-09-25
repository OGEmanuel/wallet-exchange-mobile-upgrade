import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams, CreateWalletResponse } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./create-import-wallet-remote-datasource";

/**
 * Create Import Wallet Remote Data Source Implementation
 * 
 * Handles remote API calls for wallet operations
 * 
 * Features:
 * - HTTP client integration
 * - Error handling and retry logic
 * - Request/response transformation
 * - Type-safe API calls
 */
export class CreateImportWalletRemoteDatasourceImpl implements CreateImportWalletRemoteDatasource {
  /**
   * Creates a new wallet via API
   * @param payload - Wallet creation parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Creation result
   */
  async createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
        "/wallet/create", 
        payload,
        {
          metadata: {
            showErrorToast: true,
            context: { action: 'create_wallet' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Create Wallet:', error);
      throw error;
    }
  }

  /**
   * Imports wallet from seed phrase via API
   * @param payload - Seed phrase import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  async importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
        "/wallet/import-seed-phrase", 
        payload,
        {
          metadata: {
            showErrorToast: true,
            context: { action: 'import_seed_phrase' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Import Seed Phrase:', error);
      throw error;
    }
  }
  
  /**
   * Imports wallet from private key via API
   * @param payload - Private key import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  async importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
        "/wallet/import-private-key", 
        payload,
        {
          metadata: {
            showErrorToast: true,
            context: { action: 'import_private_key' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Import Private Key:', error);
      throw error;
    }
  }
  
  /**
   * Restores wallet from cloud backup via API
   * @param payload - Cloud restore parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Restore result
   */
  async restorFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
        "/wallet/restore-from-cloud", 
        payload,
        {
          metadata: {
            showErrorToast: true,
            context: { action: 'restore_from_cloud' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Restore From Cloud:', error);
      throw error;
    }
  }
  
  /**
   * Adds an address to watch list via API
   * @param payload - Watch address parameters
   * @returns Promise<GeneralResponseModel<unknown>> - Watch result
   */
  async watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    try {
      const response = await httpClient.post<GeneralResponseModel<unknown>>(
        "/wallet/watch-address", 
        payload,
        {
          metadata: {
            showErrorToast: true,
            context: { action: 'watch_address' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Watch Address:', error);
      throw error;
    }
  }
}
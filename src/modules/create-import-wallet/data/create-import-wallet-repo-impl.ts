import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateImportWalletRepo } from "../domain/create-import-wallet-repo";
import { CreateWalletParams, CreateWalletResponse } from "../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./remote/create-import-wallet-remote-datasource";

/**
 * Create Import Wallet Repository Implementation
 * 
 * Implements the repository interface for wallet operations
 * 
 * Features:
 * - Data source abstraction
 * - Error handling and transformation
 * - Type-safe operations
 * - Business logic coordination
 */
export class CreateImportWalletRepoImpl implements CreateImportWalletRepo {
  constructor(private readonly remoteDatasource: CreateImportWalletRemoteDatasource) {}

  /**
   * Creates a new wallet
   * @param payload - Wallet creation parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Creation result
   */
  async createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.createWallet(payload);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Imports wallet from seed phrase
   * @param payload - Seed phrase import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  async importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.importSeedPhrase(payload);
    } catch (error) {
      console.error('Failed to import seed phrase:', error);
      throw error;
    }
  }

  /**
   * Imports wallet from private key
   * @param payload - Private key import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  async importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.importPrivateKey(payload);
    } catch (error) {
      console.error('Failed to import private key:', error);
      throw error;
    }
  }

  /**
   * Restores wallet from cloud backup
   * @param payload - Cloud restore parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Restore result
   */
  async restoreFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.restorFromCloud(payload);
    } catch (error) {
      console.error('Failed to restore from cloud:', error);
      throw error;
    }
  }

  /**
   * Adds an address to watch list
   * @param payload - Watch address parameters
   * @returns Promise<GeneralResponseModel<unknown>> - Watch result
   */
  async watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    try {
      return await this.remoteDatasource.watchAddress(payload);
    } catch (error) {
      console.error('Failed to watch address:', error);
      throw error;
    }
  }
}
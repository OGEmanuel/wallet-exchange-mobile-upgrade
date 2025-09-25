import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams, CreateWalletResponse } from "./entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "./entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "./entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "./entities/params/restore-from-cloud";
import { WatchAddressParams } from "./entities/params/watch-address-params";

/**
 * Create Import Wallet Repository Interface
 * 
 * Defines the contract for wallet creation and import operations
 * 
 * Features:
 * - Wallet creation and import
 * - Cloud backup and restore
 * - Address watching
 * - Type-safe operations
 */
export abstract class CreateImportWalletRepo {
  /**
   * Creates a new wallet
   * @param payload - Wallet creation parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Creation result
   */
  abstract createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Imports wallet from seed phrase
   * @param payload - Seed phrase import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  abstract importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Imports wallet from private key
   * @param payload - Private key import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  abstract importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Restores wallet from cloud backup
   * @param payload - Cloud restore parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Restore result
   */
  abstract restoreFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Adds an address to watch list
   * @param payload - Watch address parameters
   * @returns Promise<GeneralResponseModel<unknown>> - Watch result
   */
  abstract watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
}
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams, CreateWalletResponse } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";

/**
 * Create Import Wallet Remote Data Source Interface
 * 
 * Defines the contract for remote API operations
 * 
 * Features:
 * - API endpoint abstraction
 * - Type-safe remote operations
 * - Error handling contracts
 */
export abstract class CreateImportWalletRemoteDatasource {
  /**
   * Creates a new wallet via API
   * @param payload - Wallet creation parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Creation result
   */
  abstract createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Imports wallet from seed phrase via API
   * @param payload - Seed phrase import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  abstract importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Imports wallet from private key via API
   * @param payload - Private key import parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Import result
   */
  abstract importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Restores wallet from cloud backup via API
   * @param payload - Cloud restore parameters
   * @returns Promise<GeneralResponseModel<CreateWalletResponse>> - Restore result
   */
  abstract restorFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>>;
  
  /**
   * Adds an address to watch list via API
   * @param payload - Watch address parameters
   * @returns Promise<GeneralResponseModel<unknown>> - Watch result
   */
  abstract watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
}
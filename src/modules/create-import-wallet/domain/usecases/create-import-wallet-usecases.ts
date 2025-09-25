import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateImportWalletRepoImpl } from "../../data/create-import-wallet-repo-impl";
import { CreateWalletParams, CreateWalletResponse } from "../entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../entities/params/restore-from-cloud";
import { WatchAddressParams } from "../entities/params/watch-address-params";
export class CreateImportWalletUsecases {
  private readonly repo = new CreateImportWalletRepoImpl();

  async executeCreateWallet(
    payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>
  ): Promise<GeneralResponseModel<CreateWalletResponse>> {
    // Validate input parameters
    this.validateCreateWalletParams(payload.body);
    
    return this.repo.createWallet(payload);
  }

  async executeImportSeedPhrase(
    payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>
  ): Promise<GeneralResponseModel<CreateWalletResponse>> {
    // Validate seed phrase
    this.validateSeedPhrase(payload.body?.seedPhrase);
    
    return this.repo.importSeedPhrase(payload);
  }

  async executeImportPrivateKey(
    payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>
  ): Promise<GeneralResponseModel<CreateWalletResponse>> {
    // Validate private key
    this.validatePrivateKey(payload.body?.privateKey);
    
    return this.repo.importPrivateKey(payload);
  }
  
  async executeRestoreFromCloud(
    payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>
  ): Promise<GeneralResponseModel<CreateWalletResponse>> {
    // Validate cloud restore parameters
    this.validateCloudRestoreParams(payload.body);
    
    return this.repo.restoreFromCloud(payload);
  }

  async executeWatchAddress(
    payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    // Validate address
    this.validateWalletAddress(payload.body?.address);
    
    return this.repo.watchAddress(payload);
  }

  private validateCreateWalletParams(params: CreateWalletParams | null): void {
    if (!params) {
      throw new Error('Wallet parameters are required');
    }

    if (!params.walletName || params.walletName.trim().length === 0) {
      throw new Error('Wallet name is required');
    }

    if (!params.walletType) {
      throw new Error('Wallet type is required');
    }

    if (!params.walletAddress || params.walletAddress.trim().length === 0) {
      throw new Error('Wallet address is required');
    }

    if (!params.walletPrivateKey || params.walletPrivateKey.trim().length === 0) {
      throw new Error('Private key is required');
    }

    if (!params.walletPublicKey || params.walletPublicKey.trim().length === 0) {
      throw new Error('Public key is required');
    }

    if (!params.walletSeedPhrase || params.walletSeedPhrase.trim().length === 0) {
      throw new Error('Seed phrase is required');
    }
  }

  private validateSeedPhrase(seedPhrase: string | null | undefined): void {
    if (!seedPhrase || seedPhrase.trim().length === 0) {
      throw new Error('Seed phrase is required');
    }

    const words = seedPhrase.trim().split(/\s+/);
    if (words.length < 12 || words.length > 24) {
      throw new Error('Seed phrase must contain 12-24 words');
    }

    if (words.some(word => word.length === 0)) {
      throw new Error('Seed phrase contains empty words');
    }
  }

  private validatePrivateKey(privateKey: string | null | undefined): void {
    if (!privateKey || privateKey.trim().length === 0) {
      throw new Error('Private key is required');
    }

    // Basic format validation
    if (privateKey.length < 32) {
      throw new Error('Private key appears to be invalid');
    }
  }

  private validateCloudRestoreParams(params: RestoreFromCloudParams | null): void {
    if (!params) {
      throw new Error('Cloud restore parameters are required');
    }

    if (!params.backupId || params.backupId.trim().length === 0) {
      throw new Error('Backup ID is required');
    }

    if (!params.encryptionKey || params.encryptionKey.trim().length === 0) {
      throw new Error('Encryption key is required');
    }
  }

  private validateWalletAddress(address: string | null | undefined): void {
    if (!address || address.trim().length === 0) {
      throw new Error('Wallet address is required');
    }

    // Basic address validation
    if (address.length < 20) {
      throw new Error('Wallet address appears to be invalid');
    }
  }
}
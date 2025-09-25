import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateImportWalletRepo } from "../domain/create-import-wallet-repo";
import { CreateWalletParams, CreateWalletResponse } from "../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasourceImpl } from "./remote/create-import-wallet-remote-datasource-impl";
export class CreateImportWalletRepoImpl implements CreateImportWalletRepo {
  private readonly remoteDatasource = new CreateImportWalletRemoteDatasourceImpl();

  async createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.createWallet(payload);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  async importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.importSeedPhrase(payload);
    } catch (error) {
      console.error('Failed to import seed phrase:', error);
      throw error;
    }
  }

  async importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.importPrivateKey(payload);
    } catch (error) {
      console.error('Failed to import private key:', error);
      throw error;
    }
  }

  async restoreFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    try {
      return await this.remoteDatasource.restorFromCloud(payload);
    } catch (error) {
      console.error('Failed to restore from cloud:', error);
      throw error;
    }
  }

  async watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    try {
      return await this.remoteDatasource.watchAddress(payload);
    } catch (error) {
      console.error('Failed to watch address:', error);
      throw error;
    }
  }
}
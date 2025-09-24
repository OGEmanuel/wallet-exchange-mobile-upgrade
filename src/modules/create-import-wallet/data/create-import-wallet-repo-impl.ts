import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { CreateImportWalletRepo } from "../domain/create-import-wallet-repo";
import { CreateWalletParams } from "../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./remote/create-import-wallet-remote-datasource";

export class CreateImportWalletRepoImpl implements CreateImportWalletRepo {
  constructor(private readonly remoteDatasource: CreateImportWalletRemoteDatasource) {}

  async createWallet(payload: ApiRequest<CreateWalletParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.createWallet(payload);
  }

  async importSeedPhrase(payload: ApiRequest<ImportSeedPhraseParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.importSeedPhrase(payload);
  }

  async importPrivateKey(payload: ApiRequest<ImportPrivateKeyParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.importPrivateKey(payload);
  }

  async restoreFromCloud(payload: ApiRequest<RestoreFromCloudParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.restorFromCloud(payload);
  }

  async watchAddress(payload: ApiRequest<WatchAddressParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.watchAddress(payload);
  }
}
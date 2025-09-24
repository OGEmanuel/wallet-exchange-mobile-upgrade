import { ApiRequest } from "@/src/core/api/api-models";
import { CreateImportWalletRepo } from "../create-import-wallet-repo";
import { CreateWalletParams } from "../entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../entities/params/restore-from-cloud";
import { WatchAddressParams } from "../entities/params/watch-address-params";

export class CreateImportWalletUsecases {
  constructor(private readonly repo: CreateImportWalletRepo) {}

  async executeCreateWallet(payload: ApiRequest<CreateWalletParams>): Promise<unknown> {
    return this.repo.createWallet(payload);
  }

  async executeImportSeedPhrase(payload: ApiRequest<ImportSeedPhraseParams>): Promise<unknown> {
    return this.repo.importSeedPhrase(payload);
  }

  async executeImportPrivateKey(payload: ApiRequest<ImportPrivateKeyParams>): Promise<unknown> {
    return this.repo.importPrivateKey(payload);
  }
  
  async executeRestoreFromCloud(payload: ApiRequest<RestoreFromCloudParams>): Promise<unknown> {
    return this.repo.restoreFromCloud(payload);
  }

  async executeWatchAddress(payload: ApiRequest<WatchAddressParams>): Promise<unknown> {
    return this.repo.watchAddress(payload);
  }
}
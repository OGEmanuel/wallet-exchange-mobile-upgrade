import { GeneralRequestModel } from "@/src/core/api/http-types";
import { CreateImportWalletRepo } from "../create-import-wallet-repo";
import { CreateWalletParams } from "../entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../entities/params/restore-from-cloud";
import { WatchAddressParams } from "../entities/params/watch-address-params";

export class CreateImportWalletUsecases {
  constructor(private readonly repo: CreateImportWalletRepo) {}

  async executeCreateWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<unknown> {
    return this.repo.createWallet(payload);
  }

  async executeImportSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<unknown> {
    return this.repo.importSeedPhrase(payload);
  }

  async executeImportPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<unknown> {
    return this.repo.importPrivateKey(payload);
  }
  
  async executeRestoreFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<unknown> {
    return this.repo.restoreFromCloud(payload);
  }

  async executeWatchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<unknown> {
    return this.repo.watchAddress(payload);
  }
}
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams } from "./entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "./entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "./entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "./entities/params/restore-from-cloud";
import { WatchAddressParams } from "./entities/params/watch-address-params";

export abstract class CreateImportWalletRepo {
  abstract createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract restoreFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
}
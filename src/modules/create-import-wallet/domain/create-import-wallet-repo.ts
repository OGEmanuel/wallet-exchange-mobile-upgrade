import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { CreateWalletParams } from "./entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "./entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "./entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "./entities/params/restore-from-cloud";
import { WatchAddressParams } from "./entities/params/watch-address-params";

export abstract class CreateImportWalletRepo {
  abstract createWallet(payload: ApiRequest<CreateWalletParams>): Promise<ApiResponse<unknown>>;
  abstract importSeedPhrase(payload: ApiRequest<ImportSeedPhraseParams>): Promise<ApiResponse<unknown>>;
  abstract importPrivateKey(payload: ApiRequest<ImportPrivateKeyParams>): Promise<ApiResponse<unknown>>;
  abstract restoreFromCloud(payload: ApiRequest<RestoreFromCloudParams>): Promise<ApiResponse<unknown>>;
  abstract watchAddress(payload: ApiRequest<WatchAddressParams>): Promise<ApiResponse<unknown>>;
}
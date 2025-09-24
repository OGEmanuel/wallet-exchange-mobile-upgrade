import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { CreateWalletParams } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";

export abstract class CreateImportWalletRemoteDatasource {
  abstract createWallet(payload: ApiRequest<CreateWalletParams>): Promise<ApiResponse<unknown>>;
  abstract importSeedPhrase(payload: ApiRequest<ImportSeedPhraseParams>): Promise<ApiResponse<unknown>>;
  abstract importPrivateKey(payload: ApiRequest<ImportPrivateKeyParams>): Promise<ApiResponse<unknown>>;
  abstract restorFromCloud(payload: ApiRequest<RestoreFromCloudParams>): Promise<ApiResponse<unknown>>;
  abstract watchAddress(payload: ApiRequest<WatchAddressParams>): Promise<ApiResponse<unknown>>;
}
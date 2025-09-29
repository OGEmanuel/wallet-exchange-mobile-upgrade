import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams, CreateWalletResponse } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./create-import-wallet-remote-datasource";
export class CreateImportWalletRemoteDatasourceImpl implements CreateImportWalletRemoteDatasource {
  async createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
      "/wallet/create",
      payload,
      {
        metadata: {
          showErrorToast: true,
          context: { action: 'create_wallet' }
        }
      }
    );
    return response.data;
  }

  async importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
      "/wallet/import-seed-phrase",
      payload,
      {
        metadata: {
          showErrorToast: true,
          context: { action: 'import_seed_phrase' }
        }
      }
    );
    return response.data;
  }

  async importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
      "/wallet/import-private-key",
      payload,
      {
        metadata: {
          showErrorToast: true,
          context: { action: 'import_private_key' }
        }
      }
    );
    return response.data;
  }

  async restorFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<CreateWalletResponse>> {
    const response = await httpClient.post<GeneralResponseModel<CreateWalletResponse>>(
      "/wallet/restore-from-cloud",
      payload,
      {
        metadata: {
          showErrorToast: true,
          context: { action: 'restore_from_cloud' }
        }
      }
    );
    return response.data;
  }

  async watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      "/wallet/watch-address",
      payload,
      {
        metadata: {
          showErrorToast: true,
          context: { action: 'watch_address' }
        }
      }
    );
    return response.data;
  }
}
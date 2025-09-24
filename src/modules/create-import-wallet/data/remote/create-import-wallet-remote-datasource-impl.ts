import api from "@/services/base.service";
import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { CreateWalletParams } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./create-import-wallet-remote-datasource";


export class CreateImportWalletRemoteDatasourceImpl implements CreateImportWalletRemoteDatasource {
  async createWallet(payload: ApiRequest<CreateWalletParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/wallet/create", payload);
    return response.data;
  }

  async importSeedPhrase(payload: ApiRequest<ImportSeedPhraseParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/wallet/import-seed-phrase", payload);
    return response.data;
  }
  
  async importPrivateKey(payload: ApiRequest<ImportPrivateKeyParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/wallet/import-private-key", payload);
    return response.data;
  }
  
  async restorFromCloud(payload: ApiRequest<RestoreFromCloudParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/wallet/restore-from-cloud", payload);
    return response.data;
  }
  
  
  async watchAddress(payload: ApiRequest<WatchAddressParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/wallet/watch-address", payload);
    return response.data;
  }
}
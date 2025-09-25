import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";
import { CreateImportWalletRemoteDatasource } from "./create-import-wallet-remote-datasource";


export class CreateImportWalletRemoteDatasourceImpl implements CreateImportWalletRemoteDatasource {
  async createWallet(payload: GeneralRequestModel<CreateWalletParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/wallet/create", payload);
    return response.data;
  }

  async importSeedPhrase(payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/wallet/import-seed-phrase", payload);
    return response.data;
  }
  
  async importPrivateKey(payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/wallet/import-private-key", payload);
    return response.data;
  }
  
  async restorFromCloud(payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/wallet/restore-from-cloud", payload);
    return response.data;
  }
  
  
  async watchAddress(payload: GeneralRequestModel<WatchAddressParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/wallet/watch-address", payload);
    return response.data;
  }
}
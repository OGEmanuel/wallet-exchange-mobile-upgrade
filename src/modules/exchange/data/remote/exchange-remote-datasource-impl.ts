import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
<<<<<<< HEAD
<<<<<<< HEAD
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
=======
import { ExchangeActivity } from '@zap/blockchain-sdk';
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
import { ExchangeRemoteDataSource } from "./exchange-remote-datasource";


export class ExchangeRemoteDataSourceImpl implements ExchangeRemoteDataSource {
<<<<<<< HEAD
<<<<<<< HEAD
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
=======
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivity[]>> {
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeActivities.getDefaultUserActivities(payload.body?._id);

    return result.data;
  }
}

import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { ExchangeRemoteDataSource } from "./exchange-remote-datasource";

export class ExchangeRemoteDataSourceImpl implements ExchangeRemoteDataSource {
  async fetchExchangeActivities(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeActivities.getDefaultUserActivities(
      payload.body?._id
    );

    return result.data;
  }
}

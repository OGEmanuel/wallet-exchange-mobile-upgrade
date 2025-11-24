import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ExchangeActivityModel, PaginationOptions } from "@zap/blockchain-sdk";
import { ExchangeRemoteDataSource } from "./exchange-remote-datasource";

export class ExchangeRemoteDataSourceImpl implements ExchangeRemoteDataSource {
  async fetchExchangeActivities(
    payload: GeneralRequestModel<UserModel, unknown, PaginationOptions>
  ): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
    const sdk = zapSDKService.getSDK();
    console.log("payload 1111", payload.extra);
    
    // Extract pagination options from payload.extra
    const paginationOptions = payload.extra ? {
      page: payload.extra.page,
      limit: payload.extra.limit,
      skip: payload.extra.skip,
      sort: payload.extra.sort,
      order: payload.extra.order
    } : {};

    const result = await sdk.exchangeActivities.getDefaultUserActivities(
      payload.body?._id,
      { ...paginationOptions, bypassCache: true }
    );

    console.log("SDK Response Structure:", {
      result,
      hasActivities: !!result?.activities,
      activitiesLength: result?.activities?.length,
      hasPagination: !!result?.pagination,
      pagination: result?.pagination,
      hasMore: result?.pagination?.hasMore
    });

    return result;
  }
}

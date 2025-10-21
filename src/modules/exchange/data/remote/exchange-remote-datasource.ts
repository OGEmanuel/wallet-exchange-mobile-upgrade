import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ExchangeActivityModel, PaginationOptions } from "@zap/blockchain-sdk";

export abstract class ExchangeRemoteDataSource {
  // Add your remote data source methods here
  // Example:
  // abstract getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract fetchExchangeActivities(
    payload: GeneralRequestModel<UserModel, unknown, PaginationOptions>
  ): Promise<GeneralResponseModel<ExchangeActivityModel[]>>;
}

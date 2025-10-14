import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";

export abstract class ExchangeRemoteDataSource {
  // Add your remote data source methods here
  // Example:
  // abstract getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract fetchExchangeActivities(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
}

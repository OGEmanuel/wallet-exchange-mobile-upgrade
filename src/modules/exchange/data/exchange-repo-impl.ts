import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { ExchangeActivity } from '@zap/blockchain-sdk';
import { UserModel } from "../../kyc/domain/entities/models/user-model";
import { ExchangeRepo } from "../domain/exchange-repo";
import { ExchangeRemoteDataSourceImpl } from "./remote/exchange-remote-datasource-impl";

export class ExchangeRepoImpl implements ExchangeRepo {
  private readonly remoteDatasource = new ExchangeRemoteDataSourceImpl();

  // Implement your repository methods here
  // Example:
  // async getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   try {
  //     return await this.remoteDatasource.getData(payload);
  //   } catch (error) {
  //     console.error('Failed to get data:', error);
  //     throw error;
  //   }
  // }

  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivity[]>> {
    try {
      return await this.remoteDatasource.fetchExchangeActivities(payload);
    } catch (error) {
      console.error('Failed to fetch exchange activities:', error);
      throw error;
    }
  }
}

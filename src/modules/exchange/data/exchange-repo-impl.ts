<<<<<<< HEAD
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
<<<<<<< HEAD
<<<<<<< HEAD
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
=======
import { ExchangeActivity } from '@zap/blockchain-sdk';
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
>>>>>>> 3cff675 (feat(exchange): implement exchange activities feature with data fetching and state management)
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
=======
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivity[]>> {
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
  async fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
  async fetchExchangeActivities(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
>>>>>>> 3cff675 (feat(exchange): implement exchange activities feature with data fetching and state management)
    try {
      return await this.remoteDatasource.fetchExchangeActivities(payload);
    } catch (error) {
      console.error("Failed to fetch exchange activities:", error);
      throw error;
    }
  }
}

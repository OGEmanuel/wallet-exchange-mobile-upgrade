import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { ExchangeRepoImpl } from "../../data/exchange-repo-impl";

export class ExchangeUsecases {
  private readonly repo = new ExchangeRepoImpl();

  async fetchExchangeActivities(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<ExchangeActivityModel[]>> {
    return this.repo.fetchExchangeActivities(payload);
  }
}

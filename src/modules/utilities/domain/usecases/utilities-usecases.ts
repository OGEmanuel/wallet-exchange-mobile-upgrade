import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UtilitiesRepoImpl } from "../../data/utilities-repo-impl";
import { CurrencyModel } from "../entities/models/currency-model";
import { SupportedCurrencyModel } from "../entities/models/supported-currency-model";

export class UtilitiesUsecases {
  private readonly repo = new UtilitiesRepoImpl();

  async fetchCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {
    return this.repo.fetchCurrencies(payload);
  }

  async fetchSupportedCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    return this.repo.fetchSupportedCurrencies(payload);
  }
}

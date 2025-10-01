import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CurrencyModel } from "../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../domain/entities/models/supported-currency-model";
import { VerifiedCountryModel } from "../domain/entities/models/verified-country-model";
import { UtilitiesRepo } from "../domain/utilities-repo";
import { UtilitiesRemoteDataSourceImpl } from "./remote/utilities-remote-datasource-impl";

export class UtilitiesRepoImpl implements UtilitiesRepo {
  private readonly remoteDatasource = new UtilitiesRemoteDataSourceImpl();

  async fetchCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {
    return this.remoteDatasource.fetchCurrencies(payload);
  }

  async fetchSupportedCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    return this.remoteDatasource.fetchSupportedCurrencies(payload);
  }

  async fetchVerifiedCountries(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>> {
    return this.remoteDatasource.fetchVerifiedCountries(payload);
  }
}

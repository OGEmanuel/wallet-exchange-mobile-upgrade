import { fetchCurrenciesEndpoint, fetchSupportedCurrenciesEndpoint, getVerifiedCountriesEndpoint } from "@/src/core/api/api_endpoints";
import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";
import { UtilitiesRemoteDataSource } from "./utilities-remote-datasource";

export class UtilitiesRemoteDataSourceImpl implements UtilitiesRemoteDataSource {
  async fetchCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<{currencies: CurrencyModel[]} | null | undefined>>(fetchCurrenciesEndpoint);
    return {
      data: response.data?.data?.currencies || null,
      token: response.data?.token || null,
      refreshToken: response.data?.refreshToken || null,
      message: response.data?.message || null,
      error: response.data?.error || null,
      success: response.data?.success || null,
    };
  }

  async fetchSupportedCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>(fetchSupportedCurrenciesEndpoint);
    return response.data;
  }

  async fetchVerifiedCountries(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>>(getVerifiedCountriesEndpoint);
    return response.data;
  }
}

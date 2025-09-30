import { fetchCurrenciesEndpoint, fetchSupportedCurrenciesEndpoint } from "@/src/core/api/api_endpoints";
import { HttpClient } from "@/src/core/api/http";
import { GeneralResponseModel } from "@/src/core/api/http-types";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";
import { UtilitiesLocalDataSource } from "./utilities-local-datasource";

export class UtilitiesLocalDataSourceImpl implements UtilitiesLocalDataSource {
  async fetchCurrencies(): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {
    const response = await HttpClient.get<GeneralResponseModel<CurrencyModel[] | null | undefined>>(fetchCurrenciesEndpoint);
    return response.data; 
  }
  
  async fetchSupportedCurrencies(): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    const response = await HttpClient.get<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>(fetchSupportedCurrenciesEndpoint);
    return response.data;
  }
}

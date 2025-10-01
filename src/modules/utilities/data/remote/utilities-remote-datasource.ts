import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";
import { VerifiedCountryModel } from "../../domain/entities/models/verified-country-model";

export abstract class UtilitiesRemoteDataSource {
  abstract fetchCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>>;
  abstract fetchSupportedCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>;
  abstract fetchVerifiedCountries(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>>;
}

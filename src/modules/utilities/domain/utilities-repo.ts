import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CurrencyModel } from "./entities/models/currency-model";
import { SupportedCurrencyModel } from "./entities/models/supported-currency-model";

export abstract class UtilitiesRepo {
  abstract fetchCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>>;
  abstract fetchSupportedCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>;
} 

import { GeneralResponseModel } from "@/src/core/api/http-types";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";

export abstract class UtilitiesLocalDataSource {
  abstract fetchCurrencies(): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>>;
  abstract fetchSupportedCurrencies(): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>;
}

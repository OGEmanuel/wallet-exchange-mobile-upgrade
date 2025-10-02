import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";

export abstract class UtilitiesRemoteDataSource {
  abstract fetchCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>>;
  abstract fetchSupportedCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>;
  abstract fetchVerifiedCountries(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>>;
  abstract fetchDocumentTypes(payload: GeneralRequestModel<VerifiedCountryModel | null , unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>>;
}

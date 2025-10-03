import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CountryVerificationDocumentModel } from "../../kyc/domain/entities/models/document-type-model";
import { CurrencyModel } from "./entities/models/currency-model";
import { FileUploadResponseModel } from "./entities/models/file-upload-model";
import { SupportedCurrencyModel } from "./entities/models/supported-currency-model";
import { VerifiedCountryModel } from "./entities/models/verified-country-model";

export abstract class UtilitiesRepo {
  abstract fetchCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>>;
  abstract fetchSupportedCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>>;
  abstract fetchVerifiedCountries(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>>;
  abstract fetchDocumentTypes(payload: GeneralRequestModel<VerifiedCountryModel | null, unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>>;
  abstract uploadFile(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<FileUploadResponseModel>>;
} 

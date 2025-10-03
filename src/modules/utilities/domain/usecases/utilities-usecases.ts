import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { UtilitiesRepoImpl } from "../../data/utilities-repo-impl";
import { CurrencyModel } from "../entities/models/currency-model";
import { FileUploadResponseModel } from "../entities/models/file-upload-model";
import { SupportedCurrencyModel } from "../entities/models/supported-currency-model";
import { VerifiedCountryModel } from "../entities/models/verified-country-model";

export class UtilitiesUsecases {
  private readonly repo = new UtilitiesRepoImpl();

  async fetchCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {
    return this.repo.fetchCurrencies(payload);
  }

  async fetchSupportedCurrencies(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    return this.repo.fetchSupportedCurrencies(payload);
  }

  async fetchVerifiedCountries(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>> {
    return this.repo.fetchVerifiedCountries(payload);
  }

  async fetchDocumentTypes(payload: GeneralRequestModel<VerifiedCountryModel | null, unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>> {
    return this.repo.fetchDocumentTypes(payload);
  }

  async uploadFile(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<FileUploadResponseModel>> {
    return this.repo.uploadFile(payload);
  }
}

import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { FileUploadResponseModel } from "../../domain/entities/models/file-upload-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";
import { UtilitiesRemoteDataSource } from "./utilities-remote-datasource";

export class UtilitiesZapSdkDatasourceImpl implements UtilitiesRemoteDataSource {
  async fetchCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {

    const response = await zapSDKService.getSDK().currencies.listAll();
    return {
      data: response || null,
      message: "Success",
      success: true,
      error: null,
      token: null,
      refreshToken: null,
    };
  }
  
  async fetchSupportedCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<SupportedCurrencyModel[] | null | undefined>> {
    const response = await zapSDKService.getSDK().supportedCurrencies.listAll({ 
      includeFiat: true 
    });
    
    return {
      data: response || null,
      message: "Success",
      success: true,
      error: null,
      token: null,
      refreshToken: null,
    };
  }
  
  async fetchVerifiedCountries(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<VerifiedCountryModel[] | null | undefined>> {
    return {
      data: null,
      message: "Not implemented in SDK - use HTTP client",
      success: false,
      error: null,
      token: null,
      refreshToken: null,
    };
  }
  
  async uploadFile(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<FileUploadResponseModel>> {
    return {
      data: null,
      message: "Not implemented in SDK - use HTTP client",
      success: false,
      error: "File upload not supported",
      token: null,
      refreshToken: null,
    };
  }
  
  async fetchDocumentTypes(payload: GeneralRequestModel<VerifiedCountryModel | null, unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>> {
    
    const response = await zapSDKService.getSDK().verifications.getDocumentTypes(payload.body?._id || '');
    return {
      data: response || null,
      message: "Success",
      success: true,
      error: null,
      token: null,
      refreshToken: null,
    };
  }
  
}
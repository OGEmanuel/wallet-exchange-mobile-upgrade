import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { FileUploadUtilityResponse, SupportedCurrenciesUtilityResponse } from "@zap/blockchain-sdk";
import { CurrencyModel } from "../../domain/entities/models/currency-model";
import { FileUploadResponseModel } from "../../domain/entities/models/file-upload-model";
import { SupportedCurrencyModel } from "../../domain/entities/models/supported-currency-model";
import { UtilitiesRemoteDataSource } from "./utilities-remote-datasource";

export class UtilitiesZapSdkDatasourceImpl implements UtilitiesRemoteDataSource {
  sdk = zapSDKService.getSDK();

  async fetchCurrencies(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<CurrencyModel[] | null | undefined>> {

    const response = await this.sdk.utilities.fetchCurrencies();
    
    if (response.success) {
      return Promise.resolve({
        success: response.success,
        message: response.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    } else {
      return Promise.reject({
        message: response.message,
        errors: response.errors,
        success: response.success,
        data: null,
      });
    }
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
    const response: SupportedCurrenciesUtilityResponse = await this.sdk.utilities.fetchSupportedCurrencies();

    if (response.success) {
      return Promise.resolve({
        success: response.success,
        message: response.message,
        data: response.data || null,
        token: null,
        refreshToken: null,
        error: null,
      });
    } else {
      return Promise.reject({
        message: response.message,
        errors: response.errors,
        success: response.success,
        data: null,
      });
    }
  }
  
  async uploadFile(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<FileUploadResponseModel>> {
    const response: FileUploadUtilityResponse = await this.sdk.utilities.uploadFile(payload.body);
  
    if (response.success) {
      return Promise.resolve({
        success: response.success,
        message: response.message,
        data: response.data || null,
        token: null,
        refreshToken: null,
        error: null,
      });
    } else {
      return Promise.reject({
        message: response.message,
        errors: response.errors,
        success: response.success,
        data: null,
      });
    }
  }
  
  async fetchDocumentTypes(payload: GeneralRequestModel<VerifiedCountryModel | null, unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>> { 
    const response = await this.sdk.utilities.fetchDocumentTypes(payload.body);
      
      if (response.success) {

        return Promise.resolve({
          success: response.success,
          message: response.message,
          data: response.data || null,
          token: null,
          refreshToken: null,
          error: null,
        });
      } else {
        return Promise.reject({
          message: response.message,
          errors: response.errors,
          success: response.success,
          data: null,
        });
      }
  }
}
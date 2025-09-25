import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { getOnboardingOtpEndpoint } from "../../../../core/api/api_endpoints";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycRemoteDatasourceImpl implements KycRemoteDatasource {
  async authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      getOnboardingOtpEndpoint,
      payload.body,
      {},
      {
        // showErrorToast: false
      }
    );
    return response.data;
  }

  async verifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/auth/verify-email", payload);
    return response.data;
  }

  async addUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/auth/add-username", payload);
    return response.data;
  }

  async authPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/auth/phone-number", payload);
    return response.data;
  }

  async verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/auth/verify-phone-number-otp", payload);
    return response.data;
  }

  async uploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/kyc/upload-credit-document", payload);
    return response.data;
  }

  async uploadIdentityDocument(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>("/kyc/upload-identity-document", payload);
    return response.data;
  }
} 
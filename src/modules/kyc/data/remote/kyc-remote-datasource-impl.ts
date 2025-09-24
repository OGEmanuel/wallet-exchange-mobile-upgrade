import api from "@/services/base.service";
import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycRemoteDatasourceImpl implements KycRemoteDatasource {
  async authEmail(payload: ApiRequest<AuthEmailParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/auth/email", payload);
    return response.data;
  }

  async verifyEmail(payload: ApiRequest<VerifyEmailParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/auth/verify-email", payload);
    return response.data;
  }

  async addUsername(payload: ApiRequest<AddUsernameParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/auth/add-username", payload);
    return response.data;
  }

  async authPhoneNumber(payload: ApiRequest<AuthPhoneNumberParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/auth/phone-number", payload);
    return response.data;
  }

  async verifyPhoneNumberOtp(payload: ApiRequest<VerifyPhoneNumberOtpParams>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/auth/verify-phone-number-otp", payload);
    return response.data;
  }

  async uploadCreditDocument(payload: ApiRequest<CreditDocumentDataParam>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/kyc/upload-credit-document", payload);
    return response.data;
  }

  async uploadIdentityDocument(payload: ApiRequest<FormData>): Promise<ApiResponse<unknown>> {
    // TODO: Add the correct endpoint and implement
    const response = await api.post("/kyc/upload-identity-document", payload);
    return response.data;
  }
} 
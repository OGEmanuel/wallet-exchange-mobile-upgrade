import { httpClient } from "@/src/core/api/http-client";
import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import {
  authenticateEmailOtpEndpoint,
  authenticatePhoneNumberOtpEndpoint,
  getOnboardingOtpEndpoint,
  requestNewOtpEndpoint,
  submitVerificationEndpoint,
  updatePhoneNumberEndpoint,
  usernameOnboardingEndpoint,
} from "../../../../core/api/api_endpoints";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { ResendAuthPhoneNumberOtpParams } from "../../domain/entities/params/resend-auth-phone-number-otp-params";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycRemoteDatasourceImpl implements KycRemoteDatasource {
  async authEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
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

  async verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      authenticateEmailOtpEndpoint,
      payload.body,
      {},
      {
        showErrorToast: true,
      }
    );
    return response.data;
  }

  async addUsername(
    payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      usernameOnboardingEndpoint(payload.extra),
      payload
    );
    return response.data;
  }

  async authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      updatePhoneNumberEndpoint,
      payload
    );
    return response.data;
  }

  async verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      authenticatePhoneNumberOtpEndpoint,
      payload
    );
    return response.data;
  }

  async resendPhoneNumberOtp(
    payload: GeneralRequestModel<
      ResendAuthPhoneNumberOtpParams,
      unknown,
      unknown
    >
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      requestNewOtpEndpoint,
      payload
    );
    return response.data;
  }

  async uploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      submitVerificationEndpoint,
      payload
    );
    return response.data;
  }

  async uploadIdentityDocument(
    payload: GeneralRequestModel<FormData, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      submitVerificationEndpoint,
      payload
    );
    return response.data;
  }
}

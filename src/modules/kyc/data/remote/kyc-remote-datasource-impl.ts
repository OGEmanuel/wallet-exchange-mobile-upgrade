import { httpClient } from "@/src/core/api/http-client";
import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import {
  authenticateEmailOtpEndpoint,
  authenticatePhoneNumberOtpEndpoint,
  fetchUserByIdEndpoint,
  getOnboardingOtpEndpoint,
  requestNewOtpEndpoint,
  submitVerificationEndpoint,
  updatePhoneNumberEndpoint,
  updateUserDetailsEndpoint,
  usernameOnboardingEndpoint,
} from "../../../../core/api/api_endpoints";
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { SubmitVerificationParams } from "../../domain/entities/models/submit-verification-params";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { ResendAuthPhoneNumberOtpParams } from "../../domain/entities/params/resend-auth-phone-number-otp-params";
import { UpdateUsernameParams } from "../../domain/entities/params/update-username-params";
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

  async fetchUserById(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    const response = await httpClient.get<GeneralResponseModel<UserModel>>(
      fetchUserByIdEndpoint(payload.body),
      {},
      {
        showErrorToast: true,
      }
    );
    return response.data;
  }

  async verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<AuthVerificationModel>> {
    const response = await httpClient.post<GeneralResponseModel<AuthVerificationModel>>(
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
      payload.body
    );
    return response.data;
  }

  async authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      updatePhoneNumberEndpoint,
      payload.body
    );
    return response.data;
  }

  async verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      authenticatePhoneNumberOtpEndpoint,
      payload.body
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
      payload.body
    );
    return response.data;
  }

  async uploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      submitVerificationEndpoint,
      payload.body
    );
    return response.data;
  }

  async uploadIdentityDocument(
    payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      submitVerificationEndpoint,
      payload.body
    );
    return response.data;
  }

  async updateUserDetails(
    payload: GeneralRequestModel<UpdateUsernameParams, unknown, unknown>,
    user: UserModel
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.post<GeneralResponseModel<unknown>>(
      updateUserDetailsEndpoint(user),
      payload
    );
    return response.data;
  }
}

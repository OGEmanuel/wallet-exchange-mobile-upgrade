import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { AddUsernameParams } from "../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../domain/entities/params/verify-phone-number-otp-params";
import { KycRepo } from "../domain/kyc-repo";
import { KycRemoteDatasource } from "./remote/kyc-remote-datasource";

export class KycRepoImpl implements KycRepo {
  constructor(private readonly remoteDatasource: KycRemoteDatasource) {}

  async authEmail(payload: ApiRequest<AuthEmailParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.authEmail(payload);
  }

  async verifyEmail(payload: ApiRequest<VerifyEmailParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.verifyEmail(payload);
  }

  async addUsername(payload: ApiRequest<AddUsernameParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.addUsername(payload);
  }

  async authPhoneNumber(payload: ApiRequest<AuthPhoneNumberParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.authPhoneNumber(payload);
  }

  async verifyPhoneNumberOtp(payload: ApiRequest<VerifyPhoneNumberOtpParams>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.verifyPhoneNumberOtp(payload);
  }

  async uploadCreditDocument(payload: ApiRequest<CreditDocumentDataParam>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.uploadCreditDocument(payload);
  }

  async uploadIdentityDocument(payload: ApiRequest<FormData>): Promise<ApiResponse<unknown>> {
    return this.remoteDatasource.uploadIdentityDocument(payload);
  }
}
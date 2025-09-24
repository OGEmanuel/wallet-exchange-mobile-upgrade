import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { AddUsernameParams } from "../entities/params/add-username-params";
import { AuthEmailParams } from "../entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../entities/params/auth-phone-number-params";
import { VerifyEmailParams } from "../entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../entities/params/verify-phone-number-otp-params";
import { KycRepo } from "../repo/kyc-repo";

export class KycUsecases {
  constructor(private readonly repo: KycRepo) {}

  async executeAuthEmail(payload: ApiRequest<AuthEmailParams>): Promise<ApiResponse<unknown>> {
    return this.repo.authEmail(payload);
  }

  async executeVerifyEmail(payload: ApiRequest<VerifyEmailParams>): Promise<ApiResponse<unknown>> {
    return this.repo.verifyEmail(payload);
  }

  async executeAddUsername(payload: ApiRequest<AddUsernameParams>): Promise<ApiResponse<unknown>> {
    return this.repo.addUsername(payload);
  }

  async executeAuthPhoneNumber(payload: ApiRequest<AuthPhoneNumberParams>): Promise<ApiResponse<unknown>> {
    return this.repo.authPhoneNumber(payload);
  }

  async executeVerifyPhoneNumberOtp(payload: ApiRequest<VerifyPhoneNumberOtpParams>): Promise<ApiResponse<unknown>> {
    return this.repo.verifyPhoneNumberOtp(payload);
  }
}
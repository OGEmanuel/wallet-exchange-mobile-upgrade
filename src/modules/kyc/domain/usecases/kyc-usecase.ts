import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { KycRepoImpl } from "../../data/kyc-repo-impl";
import { AddUsernameParams } from "../entities/params/add-username-params";
import { AuthEmailParams } from "../entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../entities/params/auth-phone-number-params";
import { VerifyEmailParams } from "../entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../entities/params/verify-phone-number-otp-params";

export class KycUsecases {
  // constructor(private readonly repo: KycRepo) {}
  private readonly repo = new KycRepoImpl();

  async executeAuthEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authEmail(payload);
  }

  async executeVerifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.verifyEmail(payload);
  }

  async executeAddUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.addUsername(payload);
  }

  async executeAuthPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authPhoneNumber(payload);
  }

  async executeVerifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.verifyPhoneNumberOtp(payload);
  }
}
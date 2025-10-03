import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { KycRepoImpl } from "../../data/kyc-repo-impl";
import { AuthVerificationModel } from "../entities/models/auth-verifications-model";
import { SubmitVerificationParams } from "../entities/models/submit-verification-params";
import { UserModel } from "../entities/models/user-model";
import { AddUsernameParams } from "../entities/params/add-username-params";
import { AuthEmailParams } from "../entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../entities/params/verify-phone-number-otp-params";

export class KycUsecases {
  private readonly repo = new KycRepoImpl();

  async executeAuthEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authEmail(payload);
  }

  async executeFetchUserById(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<UserModel>> {
    return this.repo.fetchUserById(payload);
  }

  async executeVerifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<AuthVerificationModel>> {
    return this.repo.verifyEmail(payload);
  }

  async executeAddUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.addUsername(payload);
  }

  async executeAuthPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authPhoneNumber(payload);
  }

  async executeVerifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.verifyPhoneNumberOtp(payload);
  }

  async executeUploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.uploadCreditDocument(payload);
  }

  async executeUploadIdentityDocument(payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.repo.uploadIdentityDocument(payload);
  }
}
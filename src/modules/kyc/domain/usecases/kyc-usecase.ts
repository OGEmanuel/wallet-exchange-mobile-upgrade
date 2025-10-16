import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { AuthPhoneNumberParams, CreditDocumentDataParam, SubmitVerificationParams, VerifyPhoneNumberOtpParams } from "@zap/blockchain-sdk";
import { KycRepoImpl } from "../../data/kyc-repo-impl";
import { UserModel } from "../entities/models/user-model";
import { AddUsernameParams } from "../entities/params/add-username-params";
import { AuthEmailParams } from "../entities/params/auth-email-params";
import { UpdateUsernameParams } from "../entities/params/update-username-params";
import { VerifyEmailParams } from "../entities/params/verify-email-params";

export class KycUsecases {
  private readonly repo = new KycRepoImpl();

  async executeAuthEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authEmail(payload);
  }

  async executeVerifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.verifyEmail(payload);
  }

  async executeAddUsername(
    payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.addUsername(payload);
  }

  async executeAuthPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.authPhoneNumber(payload);
  }

  async executeVerifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.verifyPhoneNumberOtp(payload);
  }

  async executeUploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.uploadCreditDocument(payload);
  }

  async executeUploadIdentityDocument(
    payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.uploadIdentityDocument(payload);
  }

  async executeUpdateUserDetails(
    payload: GeneralRequestModel<UpdateUsernameParams, unknown, unknown>,
    user: UserModel
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.updateUserDetails(payload, user);
  }

  async executeFetchUserById(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    return this.repo.fetchUserById(payload);
  }
}

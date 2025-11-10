import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { AuthPhoneNumberParams, CreditDocumentDataParam, SubmitVerificationParams, VerifyPhoneNumberOtpParams } from "@zap/blockchain-sdk";
import { UserModel } from "../domain/entities/models/user-model";
import { AddUsernameParams } from "../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../domain/entities/params/auth-email-params";
import { AuthGuestUserParams } from "../domain/entities/params/auth-guest-user-params";
import { VerifyEmailParams } from "../domain/entities/params/verify-email-params";
import { KycRepo } from "../domain/kyc-repo";
import { KycZapSdkDataSourceImpl } from "./remote/kyc-zap-sdk-datasource-impl";

export class KycRepoImpl implements KycRepo {
  private readonly remoteDatasource = new KycZapSdkDataSourceImpl();
  // private readonly remoteDatasource = new KycRemoteDatasourceImpl();

  async authEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.authEmail(payload);
  }

  async verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.verifyEmail(payload);
  }

  async addUsername(
    payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.addUsername(payload);
  }

  async authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.authPhoneNumber(payload);
  }

  async verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.verifyPhoneNumberOtp(payload);
  }

  async uploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.uploadCreditDocument(payload);
  }

  async uploadIdentityDocument(
    payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.uploadIdentityDocument(payload);
  }

  async updateUserDetails(
    payload: GeneralRequestModel<AddUsernameParams, unknown, unknown>,
    user: UserModel
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.updateUserDetails(payload, user);
  }

  async fetchUserById(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    return this.remoteDatasource.fetchUserById(payload);
  }

  async loginAsGuest(
    payload: GeneralRequestModel<AuthGuestUserParams, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    return this.remoteDatasource.loginAsGuest(payload);
  }
}

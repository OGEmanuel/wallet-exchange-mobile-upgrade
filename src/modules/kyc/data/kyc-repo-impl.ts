import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { AuthVerificationModel } from "../domain/entities/models/auth-verifications-model";
import { UserModel } from "../domain/entities/models/user-model";
import { AddUsernameParams } from "../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../domain/entities/params/verify-phone-number-otp-params";
import { KycRepo } from "../domain/kyc-repo";
import { KycRemoteDatasourceImpl } from "./remote/kyc-remote-datasource-impl";

export class KycRepoImpl implements KycRepo {
  private readonly remoteDatasource = new KycRemoteDatasourceImpl();

  async authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.authEmail(payload);
  }

  async verifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<AuthVerificationModel>> {
    return this.remoteDatasource.verifyEmail(payload);
  }

  async addUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.addUsername(payload);
  }

  async authPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.authPhoneNumber(payload);
  }

  async verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.verifyPhoneNumberOtp(payload);
  }

  async uploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.uploadCreditDocument(payload);
  }

  async uploadIdentityDocument(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.uploadIdentityDocument(payload);
  }
}
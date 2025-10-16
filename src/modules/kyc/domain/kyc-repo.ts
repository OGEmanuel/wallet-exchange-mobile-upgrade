import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { AuthPhoneNumberParams, CreditDocumentDataParam, SubmitVerificationParams, VerifyPhoneNumberOtpParams } from "@zap/blockchain-sdk";
import { UserModel } from "./entities/models/user-model";
import { AddUsernameParams } from "./entities/params/add-username-params";
import { AuthEmailParams } from "./entities/params/auth-email-params";
import { UpdateUsernameParams } from "./entities/params/update-username-params";
import { VerifyEmailParams } from "./entities/params/verify-email-params";


export abstract class KycRepo {
  abstract authEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract addUsername(
    payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract uploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract uploadIdentityDocument(
    payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
  abstract updateUserDetails(
    payload: GeneralRequestModel<UpdateUsernameParams, unknown, unknown>,
    user: UserModel
  ): Promise<GeneralResponseModel<unknown>>;
}

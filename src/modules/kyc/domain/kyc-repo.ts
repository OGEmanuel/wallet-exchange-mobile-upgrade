import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { AddUsernameParams } from "./entities/params/add-username-params";
import { AuthEmailParams } from "./entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "./entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "./entities/params/credit-document-data-param";
import { VerifyEmailParams } from "./entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "./entities/params/verify-phone-number-otp-params";

export abstract class KycRepo {
  abstract authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract verifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract addUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract authPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract uploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract uploadIdentityDocument(payload: GeneralRequestModel<FormData, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
}
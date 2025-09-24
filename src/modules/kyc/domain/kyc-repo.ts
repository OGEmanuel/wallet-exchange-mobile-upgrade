import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { AddUsernameParams } from "./entities/params/add-username-params";
import { AuthEmailParams } from "./entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "./entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "./entities/params/credit-document-data-param";
import { VerifyEmailParams } from "./entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "./entities/params/verify-phone-number-otp-params";

export abstract class KycRepo {
  abstract authEmail(payload: ApiRequest<AuthEmailParams>): Promise<ApiResponse<unknown>>;
  abstract verifyEmail(payload: ApiRequest<VerifyEmailParams>): Promise<ApiResponse<unknown>>;
  abstract addUsername(payload: ApiRequest<AddUsernameParams>): Promise<ApiResponse<unknown>>;
  abstract authPhoneNumber(payload: ApiRequest<AuthPhoneNumberParams>): Promise<ApiResponse<unknown>>;
  abstract verifyPhoneNumberOtp(payload: ApiRequest<VerifyPhoneNumberOtpParams>): Promise<ApiResponse<unknown>>;
  abstract uploadCreditDocument(payload: ApiRequest<CreditDocumentDataParam>): Promise<ApiResponse<unknown>>;
  abstract uploadIdentityDocument(payload: ApiRequest<FormData>): Promise<ApiResponse<unknown>>;
}
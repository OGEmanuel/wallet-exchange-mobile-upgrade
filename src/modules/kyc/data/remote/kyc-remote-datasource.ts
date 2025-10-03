import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { SubmitVerificationParams } from "../../domain/entities/models/submit-verification-params";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { ResendAuthPhoneNumberOtpParams } from "../../domain/entities/params/resend-auth-phone-number-otp-params";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";

export abstract class KycRemoteDatasource {
  abstract authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract fetchUserById(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<UserModel>>;
  abstract resendPhoneNumberOtp(payload: GeneralRequestModel<ResendAuthPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract verifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<AuthVerificationModel>>;
  abstract addUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>): Promise<GeneralResponseModel<unknown>>;
  abstract authPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract uploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
  abstract uploadIdentityDocument(payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;
} 
import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";

export abstract class KycRemoteDatasource {
  abstract authEmail(payload: ApiRequest<AuthEmailParams>): Promise<ApiResponse<unknown>>;
  abstract verifyEmail(payload: ApiRequest<VerifyEmailParams>): Promise<ApiResponse<unknown>>;
  abstract addUsername(payload: ApiRequest<AddUsernameParams>): Promise<ApiResponse<unknown>>;
  abstract authPhoneNumber(payload: ApiRequest<AuthPhoneNumberParams>): Promise<ApiResponse<unknown>>;
  abstract verifyPhoneNumberOtp(payload: ApiRequest<VerifyPhoneNumberOtpParams>): Promise<ApiResponse<unknown>>;
} 
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

  export class KycZapSdkDataSourceImpl implements KycRemoteDatasource {
  async authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.sendOtp(payload.body?.email || "");

    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async fetchUserById(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<UserModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.users.getProfile(payload.body?._id || "");
    return result.data;
  }

  async verifyEmail(payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>): Promise<GeneralResponseModel<AuthVerificationModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.validateOtp({
      email: payload.body?.email || "",
      otp: payload.body?.otp || "",
    });

    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async addUsername(payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.users.completeOnboarding({
      username: payload.body?.username || "",
    });
    return result;
  }

  async authPhoneNumber(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.sendAuthPhoneNumberOtp(payload.body?.phoneNumber || "");
    return result;
  }

  async verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.validateExchangeOtp(payload.body?.phoneNumber || "", payload.body?.otp || "");
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }
}
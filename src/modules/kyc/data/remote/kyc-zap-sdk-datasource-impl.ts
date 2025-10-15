import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { AuthPhoneNumberParams, CreditDocumentDataParam, SubmitVerificationParams, VerifyPhoneNumberOtpParams } from "@zap/blockchain-sdk";
=======
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
import { AuthPhoneNumberParams, CreditDocumentDataParam, SubmitVerificationParams, VerifyPhoneNumberOtpParams } from "@zap/blockchain-sdk";
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
=======
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { UpdateUsernameParams } from "../../domain/entities/params/update-username-params";
=======
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycZapSdkDataSourceImpl implements KycRemoteDatasource {
  async authEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.sendOtp(payload.body?.email || "");

    const data = {
=======
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
=======
import { UpdateUsernameParams } from "../../domain/entities/params/update-username-params";
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycZapSdkDataSourceImpl implements KycRemoteDatasource {
  async authEmail(payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.sendOtp(payload.body?.email || "");

    return {
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
<<<<<<< HEAD

    console.log("Response Data", data);

    return data;
=======
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
  }

  async fetchUserById(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.users.getProfile(payload.body?._id || "");
    return result.data;
  }

  async verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<AuthVerificationModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.validateOtp({
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      email: payload.body?.email || null,
      otp: payload.body?.otp || null,
=======
      email: payload.body?.email || "",
      otp: payload.body?.otp || "",
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
      email: payload.body?.email || null,
      otp: payload.body?.otp || null,
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
=======
      email: payload.body?.email || "",
      otp: payload.body?.otp || "",
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)
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

  async addUsername(
    payload: GeneralRequestModel<AddUsernameParams, unknown, UserModel>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
    const result = await sdk.users.completeOnboarding(
      payload.extra?._id || null,
      {
        username: payload.body?.username || null,
        userSource: payload.body?.userSource || null,
        referralCode: payload.body?.referralCode || null,
      }
=======
    const result = await sdk.users.completeOnboarding({
      username: payload.body?.username || "",
    });
    return result;
  }

  async authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.sendAuthPhoneNumberOtp(
      payload.body?.phoneNumber || ""
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)
    );
<<<<<<< HEAD
=======
    const result = await sdk.users.completeOnboarding({
      username: payload.body?.username || "",
    });
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
    return result;
  }

  async verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
    const result = await sdk.exchangeAuth.updatePhoneNumber({
      phone: payload?.body?.phone || null,
      countryCode: payload?.body?.countryCode || null,
      isWhatsApp: payload?.body?.isWhatsApp || false,
    });
<<<<<<< HEAD

=======
    const result = await sdk.validateExchangeOtp(
      payload.body?.phoneNumber || "",
      payload.body?.otp || ""
    );
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
=======
    const result = await sdk.sendAuthPhoneNumberOtp(payload.body?.phoneNumber || "");
    return result;
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
  }
<<<<<<< HEAD

  async verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
<<<<<<< HEAD
    const result = await sdk.exchangeAuth.verifyPhoneNumberOtp({
      phone: payload.body?.identifier || null,
      otp: payload.body?.otp || null,
      isOnboarding: payload.body?.isOnboarding || false,
    });
    return {
      success: result.success,
      message: result.message,
      data: null,
=======
    const result = await sdk.validateExchangeOtp(payload.body?.phoneNumber || "", payload.body?.otp || "");
    return {
      success: result.success,
      message: result.message,
      data: result.data,
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======

    return {
      success: result.success,
      message: result.message,
      data: null,
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
      token: null,
      refreshToken: null,
      error: null,
    };
  }
<<<<<<< HEAD
<<<<<<< HEAD
=======

  async verifyPhoneNumberOtp(payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.verifyPhoneNumberOtp({
      phone: payload.body?.identifier || null,
      otp: payload.body?.otp || null,
      isOnboarding: payload.body?.isOnboarding || false,
    });
    return {
      success: result.success,
      message: result.message,
      data: null,
      token: null,
      refreshToken: null,
      error: null,
    };
  }
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)

  async resendPhoneNumberOtp(payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.updatePhoneNumber({
      phone: payload?.body?.phone || null,
      countryCode: payload?.body?.countryCode || null,
      isWhatsApp: payload?.body?.isWhatsApp || false,
    });

    return {
      success: result.success,
      message: result.message,
      data: null,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async uploadCreditDocument(payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.verifications.submitCreditDocument(payload.body);
    return result;
  }

  async uploadIdentityDocument(payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.verifications.submitIdentityDocument(payload.body);
    return result;
  }

  async updateUserDetails(payload: GeneralRequestModel<UpdateUsernameParams, unknown, unknown>, user: UserModel): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.users.updateProfile(user._id || null, payload.body);
    return result;
  }
<<<<<<< HEAD
=======
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
>>>>>>> f1060a2 (refactor: update KYC data handling and integrate new SDK methods)
}
=======
}
>>>>>>> 5886560 (chore: update package-lock and yarn.lock for dependency version changes)

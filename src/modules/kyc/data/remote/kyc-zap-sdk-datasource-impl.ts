import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { showErrorToast } from "@/src/core/utils/toast-utils";
import {
  AuthPhoneNumberParams,
  CreditDocumentDataParam,
  SubmitVerificationParams,
  VerifyPhoneNumberOtpParams,
} from "@zap/blockchain-sdk";
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { UpdateUsernameParams } from "../../domain/entities/params/update-username-params";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { KycRemoteDatasource } from "./kyc-remote-datasource";

export class KycZapSdkDataSourceImpl implements KycRemoteDatasource {
  async authEmail(
    payload: GeneralRequestModel<AuthEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
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

  async fetchUserById(
    payload: GeneralRequestModel<UserModel, unknown, unknown>
  ): Promise<GeneralResponseModel<UserModel>> {
    try {
      const sdk = zapSDKService.getSDK();
      // const result = await sdk.exchangeAuth.getUser();

      const result = await sdk.users.getProfile(payload.body?._id || "");
      console.log("Resultssss:", result);

      return {
        success: true,
        message: "User fetched successfully",
        data: result,
        token: null,
        refreshToken: null,
        error: null,
      };
    } catch (error: any) {
      console.error("Failed to fetch user profile from SDK:", error);
      // Return error response instead of throwing to prevent breaking the flow
      return {
        success: false,
        message: error?.message || "Failed to fetch user profile",
        data: null as any,
        token: null,
        refreshToken: null,
        error: error,
      };
    }
  }

  async verifyEmail(
    payload: GeneralRequestModel<VerifyEmailParams, unknown, unknown>
  ): Promise<GeneralResponseModel<AuthVerificationModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.validateOtp({
      email: payload.body?.email || null,
      otp: payload.body?.otp || null,
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
    const result = await sdk.users.completeOnboarding(
      payload.extra?._id || null,
      {
        username: payload.body?.username || null,
        userSource: payload.body?.userSource || null,
        referralCode: payload.body?.referralCode || null,
      }
    );
    return result;
  }

  async authPhoneNumber(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const data = {
      phone: payload?.body?.phone || null,
      countryCode: payload?.body?.countryCode || null,
      isWhatsApp: payload?.body?.isWhatsApp || false,
    }

    const result = await sdk.exchangeAuth.updatePhoneNumber(data);

    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    } else {
      showErrorToast(result.message || "Phone number verification failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }

  async verifyPhoneNumberOtp(
    payload: GeneralRequestModel<VerifyPhoneNumberOtpParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.verifyPhoneNumberOtp({
      phone: payload.body?.identifier || null,
      otp: payload.body?.otp || null,
      isOnboarding: payload.body?.isOnboarding || false,
    });
    
    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    } else {
      showErrorToast(result.message || "OTP verification failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }

  async resendPhoneNumberOtp(
    payload: GeneralRequestModel<AuthPhoneNumberParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.exchangeAuth.updatePhoneNumber({
      phone: payload?.body?.phone || null,
      countryCode: payload?.body?.countryCode || null,
      isWhatsApp: payload?.body?.isWhatsApp || false,
    });

    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    }
    else {
      showErrorToast(result.message || "OTP resend failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }

  async uploadCreditDocument(
    payload: GeneralRequestModel<CreditDocumentDataParam, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.verifications.submitCreditDocument(payload.body);
    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    }
    else {
      showErrorToast(result.message || "Credit document submission failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }

  async uploadIdentityDocument(
    payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.verifications.submitIdentityDocument(payload.body);
    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    }
    else {
      showErrorToast(result.message || "Identity document submission failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }

  async updateUserDetails(
    payload: GeneralRequestModel<UpdateUsernameParams, unknown, unknown>,
    user: UserModel
  ): Promise<GeneralResponseModel<unknown>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.users.updateProfile(
      user._id || null,
      payload.body
    );
    if (result.success) {
      return Promise.resolve({
        success: result.success,
        message: result.message,
        data: null,
        token: null,
        refreshToken: null,
        error: null,
      });
    }
    else {
      showErrorToast(result.message || "Username update failed");

      return Promise.reject({
        message: result.message,
        errors: result.errors,
        success: result.success,
        data: null,
      });
    }
  }
}

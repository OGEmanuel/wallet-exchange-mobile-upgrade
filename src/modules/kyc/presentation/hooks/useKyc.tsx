import { GeneralResponseModel } from "@/src/core/api/http-types";
import { StorageKeys, TokenData } from "@/src/core/api/models";
import { storageService } from "@/src/core/storage/app-storage";
import { AppDispatch, AppRootState } from "@/state";
import { kycActions } from "@/state/reducers/kyc-reducer";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycUsecases } from "../../domain/usecases/kyc-usecase";

const useKyc = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [fetchingUserDetails, setFetchingUserDetails] =
    useState<boolean>(false);

  return {
    updateUser: async (payload: UserModel) => {
      dispatch(kycActions.setUser(payload));

      // const userData = appGetFromLocalStorage<UserModel>(StorageKeys.USER_PROFILE);

      if (user?._id || !user?.isGuest || !fetchingUserDetails) {
        // fetchUserProfile();
      }
    },

    authEmail: async (
      payload: AuthEmailParams
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeAuthEmail({
        body: payload,
        params: null,
        extra: null,
      });

      return response;
    },

    verifyEmail: async (
      payload: VerifyEmailParams
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeVerifyEmail({
        body: payload,
        params: null,
        extra: null,
      });

      // Update user state if verification was successful and user data is returned
      if (response.success && response.data && (response.data as any)?.user) {
        dispatch(kycActions.setUser((response.data as any).user as UserModel));
      }

      // Store token and refreshToken if they are present in the response data
      if (
        response.success &&
        response.data &&
        ((response.data as any)?.token || (response.data as any)?.refreshToken)
      ) {
        try {
          const tokenData: TokenData = {
            token: (response.data as any).token,
            refreshToken: (response.data as any).refreshToken,
            expiresAt: null,
          };
          await storageService.save(StorageKeys.TOKEN_DATA, tokenData);
          console.log("Tokens stored successfully after email verification");
        } catch (error) {
          console.error(
            "Failed to store tokens after email verification:",
            error
          );
        }
      }

      return response;
    },

    addUsername: async (
      payload: AddUsernameParams
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeAddUsername({
        body: payload,
        params: null,
        extra: user,
      });

      // Update user state if username was successfully added and user data is returned
      if (response.success && response.data) {
        dispatch(kycActions.setUser(response.data as UserModel));
      }

      return response;
    },

    authPhoneNumber: async (
      payload: AuthPhoneNumberParams
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeAuthPhoneNumber({
        body: payload,
        params: null,
        extra: null,
      });
      return response;
    },

    verifyPhoneNumberOtp: async (
      payload: VerifyPhoneNumberOtpParams
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeVerifyPhoneNumberOtp({
        body: payload,
        params: null,
        extra: null,
      });
      return response;
    },

    uploadCreditDocument: async (
      payload: CreditDocumentDataParam
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeUploadCreditDocument({
        body: payload,
        params: null,
        extra: null,
      });
      return response;
    },

    uploadIdentityDocument: async (
      payload: FormData
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeUploadIdentityDocument({
        body: payload,
        params: null,
        extra: null,
      });
      return response;
    },
  };
};

export default useKyc;

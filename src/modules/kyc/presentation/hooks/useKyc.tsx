import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { StorageKeys, TokenData } from "@/src/core/api/models";
import { storageService } from "@/src/core/storage/app-storage";
import { AppDispatch, AppRootState } from "@/state";
import { kycActions } from "@/state/reducers/kyc-reducer";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthVerificationModel } from "../../domain/entities/models/auth-verifications-model";
import { SubmitVerificationParams } from "../../domain/entities/models/submit-verification-params";
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

  const fetchUserById = async (
    payload: UserModel | null
  ): Promise<GeneralResponseModel<UserModel>> => {
    setFetchingUserDetails(true);
    const usecase = new KycUsecases();
    const response = await usecase.executeFetchUserById({
      body: payload,
      params: null,
      extra: null,
    });

    setFetchingUserDetails(false);

    return response;
  };

  return {
    fetchUserById,
    updateUser: async (payload: UserModel | null) => {
      const updatedUser = {
        ...user,
        ...payload || {},
        metaData: {
          ...user?.metaData,
          ...payload?.metaData || {},
        },
      };

      const {metaData,  ...userDataWithoutTheMetaData} = {
        ...updatedUser,
        ...payload || {},
      };

      dispatch(kycActions.setUser(updatedUser));
      
      if (user?._id || !user?.isGuest || !fetchingUserDetails) {
        fetchUserById(updatedUser).then((response) => {
          
          if (response.data) {
            const fetchedUserData = {
              ...userDataWithoutTheMetaData,
              ...response.data,
              metaData: {
                ...metaData,
                ...response.data?.metaData,
              },
            };

            dispatch(kycActions.setUser({...fetchedUserData}));

            if (!userDataWithoutTheMetaData?.phoneNumberVerified) {
              if (userDataWithoutTheMetaData?.phone) delete userDataWithoutTheMetaData.phone;
            }

            storageService.save(StorageKeys.USER_PROFILE, userDataWithoutTheMetaData);
          }
        });
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
    ): Promise<GeneralResponseModel<AuthVerificationModel>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeVerifyEmail({
        body: payload,
        params: null,
        extra: null,
      });

      const authVerificationData = response.data;

      if (
        authVerificationData
      ) {
        try {
          const tokenData: TokenData = {
            token: authVerificationData?.token || null,
            refreshToken: authVerificationData?.refreshToken || null,
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
      payload: GeneralRequestModel<SubmitVerificationParams, unknown, unknown>
    ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeUploadIdentityDocument(payload);
      return response;
    },
  };
};

export default useKyc;

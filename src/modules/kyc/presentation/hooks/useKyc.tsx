import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { StorageKeys } from "@/src/core/api/models";
import { storageService } from "@/src/core/storage/app-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppDispatch, AppRootState } from "@/state";
import { kycActions } from "@/state/reducers/kyc-reducer";
import { SubmitVerificationParams, TokenData } from "@zap/blockchain-sdk";
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

  const { 
    currentExchangeUser, 
    exchangeUserData,
    isExchangeAuthenticated,
    setCurrentExchangeUser,
    setExchangeUserData,
    setIsExchangeAuthenticated 
  } = useWallet();

  const fetchUserById = async (
    payload: UserModel | null
  ): Promise<GeneralResponseModel<UserModel> | null> => {
    console.log("UseKyc fetchUserById payload ", payload);
    if (!user?._id) {
      return null
    }

    setFetchingUserDetails(true);
    const usecase = new KycUsecases();
    const response = await usecase.executeFetchUserById({
      body: {
        _id: payload?._id || currentExchangeUser || user?._id || undefined,
      },
      params: null,
      extra: null,
    });

    if (response.data) {
      const updatedUser = {
        ...user,
        ...response.data,
        metaData: { 
          ...user?.metaData,
        },
      };
      
      dispatch(kycActions.setUser(updatedUser));
      
      // Update wallet context to keep exchange user data in sync
      if (response.data._id) {
        setCurrentExchangeUser(response.data._id);
        setIsExchangeAuthenticated(true);
      }
      setExchangeUserData(updatedUser);
    }

    setFetchingUserDetails(false);

    return response;
  };

  const loadUserFromStorage = async (): Promise<UserModel | null> => {
    try {
      const persistedUser = await storageService.get<UserModel>(
        StorageKeys.USER_PROFILE
      );
      if (persistedUser) {
        dispatch(kycActions.setUser(persistedUser));
        return persistedUser;
      }
      return null;
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      return null;
    }
  };

  const clearUserData = async (): Promise<void> => {
    try {
      // Clear from Redux store
      dispatch(kycActions.setUser(null as any));

      // Clear from storage
      await storageService.remove(StorageKeys.USER_PROFILE);

      console.log("User data cleared successfully");
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  };

  const hasPersistedUserData = async (): Promise<boolean> => {
    try {
      const persistedUser = await storageService.get<UserModel>(
        StorageKeys.USER_PROFILE
      );
      return persistedUser !== null;
    } catch (error) {
      console.error("Failed to check persisted user data:", error);
      return false;
    }
  };

  return {
    fetchUserById,
    loadUserFromStorage,
    clearUserData,
    hasPersistedUserData,
    updateUser: async (payload: UserModel | null) => {
      const updatedUser = {
        ...user,
        ...(payload || {}),
        metaData: {
          ...user?.metaData,
          ...(payload?.metaData || {}),
        },
      };

      const { metaData, ...userDataWithoutTheMetaData } = {
        ...updatedUser,
        ...(payload || {}),
      };

      dispatch(kycActions.setUser(updatedUser));

      // Persist user data immediately to storage
      try {
        await storageService.save(StorageKeys.USER_PROFILE, updatedUser);
      } catch (error) {
        console.error("Failed to persist user data:", error);
      }

      if (user?._id || !user?.isGuest || !fetchingUserDetails) {
        fetchUserById(updatedUser).then((response) => {
          if (response?.data) {
            const fetchedUserData = {
              ...userDataWithoutTheMetaData,
              ...response.data,
              metaData: {
                ...metaData,
                ...response.data?.metaData,
              },
            };

            dispatch(kycActions.setUser({ ...fetchedUserData }));

            if (!userDataWithoutTheMetaData?.phoneNumberVerified) {
              if (userDataWithoutTheMetaData?.phone)
                delete userDataWithoutTheMetaData.phone;
            }

            storageService.save(
              StorageKeys.USER_PROFILE,
              userDataWithoutTheMetaData
            );
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
    ) => {
    // ): Promise<GeneralResponseModel<AuthVerificationModel>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeVerifyEmail({
        body: payload,
        params: null,
        extra: null,
      });

      const authVerificationData = response.data;

      if (authVerificationData) {
        try {
          // const responseData = response.data as any;
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
        const updatedUser = response.data as UserModel;
        dispatch(kycActions.setUser(updatedUser));

        // Persist the updated user data
        try {
          await storageService.save(StorageKeys.USER_PROFILE, updatedUser);
        } catch (error) {
          console.error(
            "Failed to persist user data after adding username:",
            error
          );
        }
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

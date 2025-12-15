import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { StorageKeys } from "@/src/core/api/models";
import { storageService } from "@/src/core/storage/app-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppDispatch } from "@/state";
import { kycActions } from "@/state/reducers/kyc-reducer";
import { AuthVerificationModel, SubmitVerificationParams } from "@zap/blockchain-sdk";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { UserModel } from "../../domain/entities/models/user-model";
import { AddUsernameParams } from "../../domain/entities/params/add-username-params";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { AuthGuestUserParams } from "../../domain/entities/params/auth-guest-user-params";
import { AuthPhoneNumberParams } from "../../domain/entities/params/auth-phone-number-params";
import { CreditDocumentDataParam } from "../../domain/entities/params/credit-document-data-param";
import { VerifyEmailParams } from "../../domain/entities/params/verify-email-params";
import { VerifyPhoneNumberOtpParams } from "../../domain/entities/params/verify-phone-number-otp-params";
import { KycUsecases } from "../../domain/usecases/kyc-usecase";

const useKyc = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const { user } = useSelector((state: AppRootState) => state.kyc);
  const [fetchingUserDetails, setFetchingUserDetails] =
    useState<boolean>(false);

  const { 
    currentExchangeUser, 
    isExchangeAuthenticated,
    setCurrentExchangeUser,
    setExchangeUserData,
    setIsExchangeAuthenticated 
  } = useWallet();

  const { exchangeUserData } =
  useExchangeAuth();

  const user = exchangeUserData;

  const fetchUserById = async (
    payload: UserModel | null
  ): Promise<GeneralResponseModel<UserModel> | null> => {
    console.log("UseKyc fetchUserById payload ", payload);
    if (!user?._id) {
      return null
    }

    // Only fetch if exchange is authenticated (required for SDK call)
    if (!isExchangeAuthenticated) {
      console.log("⚠️ Exchange not authenticated, skipping fetchUserById");
      return null;
    }

    // Prevent multiple simultaneous fetches
    if (fetchingUserDetails) {
      console.log("⚠️ Already fetching user details, skipping duplicate call");
      return null;
    }

    setFetchingUserDetails(true);
    try {
      const usecase = new KycUsecases();
      const response = await usecase.executeFetchUserById({
        body: {
          _id: payload?._id || currentExchangeUser || user?._id || undefined,
        },
        params: null,
        extra: null,
      });

      if (response.data) {
        // Only update if the data actually changed to prevent infinite loops
        const updatedUser = {
          ...user,
          ...response.data,
          metaData: { 
            ...user?.metaData,
            ...response.data?.metaData,
          },
        };
        
        // Check if user data actually changed before dispatching
        const userChanged = JSON.stringify(user) !== JSON.stringify(updatedUser);
        if (userChanged) {
          // Update Redux store - this will trigger re-renders in all components using useSelector
        dispatch(kycActions.setUser(updatedUser));
        
          // Update wallet context - this will update exchangeUserData used by useExchangeAuth and other components
        if (response.data._id) {
          setCurrentExchangeUser(response.data._id);
          setIsExchangeAuthenticated(true);
        }
        setExchangeUserData(updatedUser);
        }
      }

      setFetchingUserDetails(false);
      return response;
    } catch (error) {
      console.error("Failed to fetch user by ID:", error);
      setFetchingUserDetails(false);
      // Return null on error to prevent breaking the flow
      return null;
    }
  };

  // const loadUserFromStorage = async (): Promise<UserModel | null> => {
  //   try {
  //     const persistedUser = await storageService.get<UserModel>(
  //       StorageKeys.USER_PROFILE
  //     );
  //     if (persistedUser) {
  //       dispatch(kycActions.setUser(persistedUser));
  //       return persistedUser;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error("Failed to load user from storage:", error);
  //     return null;
  //   }
  // };

  const clearUserData = async (): Promise<void> => {
    try {
      // Clear from Redux store
      dispatch(kycActions.setUser(null as any));

      // Clear from wallet context
      setCurrentExchangeUser(null);
      setIsExchangeAuthenticated(false);
      setExchangeUserData(null);

      // Clear from storage
      await storageService.remove(StorageKeys.USER_PROFILE);

      console.log("✅ User data cleared successfully from Redux, wallet context, and storage");
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
    // loadUserFromStorage,
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

      // Update Redux store
      dispatch(kycActions.setUser(updatedUser));

      // Update wallet context to keep exchangeUserData in sync
      if (updatedUser?._id) {
        setCurrentExchangeUser(updatedUser._id);
        setIsExchangeAuthenticated(true);
      }
      setExchangeUserData(updatedUser);

      // Persist user data immediately to storage
      try {
        await storageService.save(StorageKeys.USER_PROFILE, updatedUser);
      } catch (error) {
        console.error("Failed to persist user data:", error);
      }

      // Only fetch from backend if user has ID and we're not already fetching
      // Skip if user is guest and we just updated locally
      // Add debouncing to prevent rapid successive calls
      if (user?._id && !user?.isGuest && !fetchingUserDetails) {
        // Use a small delay to debounce rapid updates
        setTimeout(() => {
          // Check again if we're still not fetching (in case another call happened)
          if (!fetchingUserDetails) {
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

                // Only update if data actually changed to prevent loops
                const dataChanged = JSON.stringify(updatedUser) !== JSON.stringify(fetchedUserData);
                if (dataChanged) {
                  // Update Redux
            dispatch(kycActions.setUser({ ...fetchedUserData }));

                  // Update wallet context
                  if (fetchedUserData?._id) {
                    setCurrentExchangeUser(fetchedUserData._id);
                    setIsExchangeAuthenticated(true);
                  }
                  setExchangeUserData(fetchedUserData);

            if (!userDataWithoutTheMetaData?.phoneNumberVerified) {
              if (userDataWithoutTheMetaData?.phone)
                delete userDataWithoutTheMetaData.phone;
            }

            storageService.save(
              StorageKeys.USER_PROFILE,
              userDataWithoutTheMetaData
            );
                }
          }
        });
          }
        }, 300); // 300ms debounce
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

      // const authVerificationData = response.data;

      // if (authVerificationData) {
      //   try {
      //     // const responseData = response.data as any;
      //     const tokenData: TokenData = {
      //       token: authVerificationData?.token || null,
      //       refreshToken: authVerificationData?.refreshToken || null,
      //       expiresAt: null,
      //     };
      //     await storageService.save(StorageKeys.TOKEN_DATA, tokenData);
      //     console.log("Tokens stored successfully after email verification");
      //   } catch (error) {
      //     console.error(
      //       "Failed to store tokens after email verification:",
      //       error
      //     );
      //   }
      // }

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
        
        // Update Redux store
        dispatch(kycActions.setUser(updatedUser));

        // Update wallet context to keep exchangeUserData in sync
        if (updatedUser?._id) {
          setCurrentExchangeUser(updatedUser._id);
          setIsExchangeAuthenticated(true);
        }
        setExchangeUserData(updatedUser);

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

    loginAsGuest: async (
      payload: AuthGuestUserParams
    ): Promise<GeneralResponseModel<UserModel>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeLoginAsGuest({
        body: payload,
        params: null,
        extra: null,
      });

      // const authVerificationData = response.data;

      // if (authVerificationData) {
      //   try {
      //     const tokenData: TokenData = {
      //       token: authVerificationData?.token || null,
      //       refreshToken: authVerificationData?.refreshToken || null,
      //       expiresAt: null,
      //     };
      //     await storageService.save(StorageKeys.TOKEN_DATA, tokenData);
      //     console.log("Tokens stored successfully after guest login");

      //     // Update user state if user data is returned
      //     if (authVerificationData?.user) {
      //       const guestUser = authVerificationData.user as UserModel;
      //       dispatch(kycActions.setUser(guestUser));
            
      //       // Update wallet context
      //       if (guestUser._id) {
      //         setCurrentExchangeUser(guestUser._id);
      //         setIsExchangeAuthenticated(true);
      //       }
      //       setExchangeUserData(guestUser);

      //       // Persist user data
      //       try {
      //         await storageService.save(StorageKeys.USER_PROFILE, guestUser);
      //       } catch (error) {
      //         console.error("Failed to persist guest user data:", error);
      //       }
      //     }
      //   } catch (error) {
      //     console.error("Failed to store tokens after guest login:", error);
      //   }
      // }

      if (response.success && response.data) {
        try {
          await storageService.save(StorageKeys.USER_PROFILE, response.data);
          dispatch(kycActions.setUser(response.data));
          setCurrentExchangeUser(response.data._id || null);
          setIsExchangeAuthenticated(true);
          setExchangeUserData(response.data);
        } catch (error) {
          console.error("Failed to persist guest user data:", error);
        }
      }

      return response;
    },
  };
};

export default useKyc;

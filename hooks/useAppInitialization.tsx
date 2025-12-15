import { useWallet } from "@/src/core/wallet/wallet-context";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppDispatch, AppRootState } from "@/state";
import { kycActions } from "@/state/reducers/kyc-reducer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useExchangeAuth } from "./useExchangeAuth";

interface AppInitializationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAppInitialization = () => {
  const {
    currentExchangeUser,
    getExchangeUser,
    setExchangeUserData,
  } = useWallet();

  const { exchangeUserData, isExchangeAuthenticated } =
  useExchangeAuth();
  const { fetchUserById } = useKyc();

  const dispatch = useDispatch<AppDispatch>();
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  const { user: kycUser } = useSelector((state: AppRootState) => state.kyc);

    // Load user data from storage or fetch if we have a user ID but no user data
  // IMPORTANT: Only load if we don't have user data - don't overwrite existing data
  useEffect(() => {
    const loadUserData = async () => {
      // If we have a user ID but no user data, try to fetch
      if (currentExchangeUser && !exchangeUserData) {
        try {
          const user = await getExchangeUser();
          if (user) {
            setExchangeUserData(user);
          }
        } catch (error) {
          console.error("Failed to fetch exchange user:", error);
        }
      }

      // If we have KYC user ID but no username, try to fetch user by ID
      if (kycUser?._id && !kycUser?.username && isExchangeAuthenticated) {
        try {
          await fetchUserById(kycUser);
        } catch (error) {
          console.error("Failed to fetch user by ID:", error);
        }
      }
    };

    loadUserData();
  }, [
    // currentExchangeUser,
    // exchangeUserData,
    // kycUser,
    // isExchangeAuthenticated,
    // loadUserFromStorage,
    // getExchangeUser,
    // setExchangeUserData,
    // fetchUserById,
    // userData,
  ]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Starting app initialization...");
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Load persisted user data
        console.log("Loading user data...");
        // const persistedUser = await storageService.get<UserModel>(
        //   StorageKeys.USER_PROFILE
        // );

        console.log("Exchange user data:", exchangeUserData);
        const persistedUser = exchangeUserData;
        if (persistedUser) {
          dispatch(kycActions.setUser(persistedUser));
          console.log("User data loaded from storage:", persistedUser);
        } else {
          console.log("No user data found in storage");
        }

        // // Load persisted token data
        // console.log("Loading token data...");
        // const persistedTokens = await storageService.get<TokenData>(
        //   StorageKeys.TOKEN_DATA
        // );
        // if (persistedTokens) {
        //   console.log("Token data loaded from storage");
        //   // You can dispatch token actions here if you have a token reducer
        // } else {
        //   console.log("No token data found in storage");
        // }

        // Load persisted exchange user data
        // console.log("Loading exchange user data...");
        // const persistedExchangeUser = await storageService.get<UserModel>(
        //   StorageKeys.EXCHANGE_USER_DATA
        // );
        // if (persistedExchangeUser) {
        //   console.log("Exchange user data loaded from storage:", persistedExchangeUser._id);
        // } else {
        //   console.log("No exchange user data found in storage");
        // }

        console.log("Setting initialization complete...");
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        console.log("App initialization completed successfully");
      } catch (error) {
        console.error("App initialization failed:", error);
        setState({
          isInitialized: false,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    };

    initializeApp();
  }, [dispatch]);

  return state;
};

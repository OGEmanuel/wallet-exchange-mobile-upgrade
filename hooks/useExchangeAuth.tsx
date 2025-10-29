import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { ExchangeValidateOtpResponse } from "@zap/blockchain-sdk";
import { useCallback, useRef, useState } from "react";

export const useExchangeAuth = () => {
  const { 
    isExchangeAuthenticated, 
    exchangeUserData,
    exchangeLogin, 
    exchangeValidateOtp, 
    getExchangeUser,
    logoutFromExchange,
    isAuthenticating,
    error 
  } = useWallet();
  
  const [isExchangeLoginVisible, setIsExchangeLoginVisible] = useState(false);
  const exchangeLoginBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  const showExchangeLogin = useCallback(() => {
    setIsExchangeLoginVisible(true);
    setTimeout(() => {
      exchangeLoginBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, []);

  const hideExchangeLogin = useCallback(() => {
    setIsExchangeLoginVisible(false);
  }, []);

  const checkExchangeAuth = useCallback((callback: () => void) => {
    if (isExchangeAuthenticated) {
      callback();
    } else {
      showExchangeLogin();
    }
  }, [isExchangeAuthenticated, showExchangeLogin]);

  const handleExchangeLogin = useCallback(async (email: string) => {
    return await exchangeLogin(email);
  }, [exchangeLogin]);

  const handleExchangeValidateOtp = useCallback(async (email: string, otp: string) => {
    const success: ExchangeValidateOtpResponse | boolean = await exchangeValidateOtp(email, otp);
    if (success) {
      hideExchangeLogin();
    }
    return success;
  }, [exchangeValidateOtp, hideExchangeLogin]);

  const handleExchangeLogout = useCallback(async () => {
    await logoutFromExchange();
  }, [logoutFromExchange]);

  const ExchangeLoginBottomSheet = useCallback(() => {
    if (!isExchangeLoginVisible) return null;

    return (
      <ZapperSiginBottomSheet
        ref={exchangeLoginBottomSheetRef}
        onContinue={() => {
          exchangeLoginBottomSheetRef.current?.close();
          hideExchangeLogin();
        }}
        onClose={hideExchangeLogin}
      />
    );
  }, [isExchangeLoginVisible, hideExchangeLogin]);

  return {
    isExchangeAuthenticated,
    exchangeUserData,
    isAuthenticating,
    error,
    showExchangeLogin,
    hideExchangeLogin,
    checkExchangeAuth,
    handleExchangeLogin,
    handleExchangeValidateOtp,
    handleExchangeLogout,
    getExchangeUser,
    ExchangeLoginBottomSheet,
  };
};

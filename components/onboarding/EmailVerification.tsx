import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import storageService from "@/src/core/storage/app-storage";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { StorageKeys } from "@/src/core/storage/storage-types";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ExchangeValidateOtpResponse, UserModel } from "@zap/blockchain-sdk";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Keyboard, Pressable } from "react-native";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  onCloseBottomSheet?: () => void;
}

export default function EmailVerification({
  email = "",
  onVerify,
  onResend,
  isLoading = false,
  onCloseBottomSheet,
}: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme<Theme>();
  const { hideAllBottomSheets } = useAppBottomSheet();
  const { handleExchangeValidateOtp, exchangeUserData, getExchangeUser } =
    useExchangeAuth();
  const { fetchUserById } = useKyc();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError(null);
    setIsCodeComplete(newCode.length === 6);
  };

  const handleCodeComplete = (completeCode: string) => {
    setIsCodeComplete(true);
  };

  useEffect(() => {
    if (isCodeComplete) {
      handleVerify();
    }
  }, [isCodeComplete]);

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(90);
      onResend?.();
    }
  };

  const handleVerify = async () => {
    if (isCodeComplete && !isLoading && !isVerifying) {
      setIsVerifying(true);
      try {
        const response = await handleExchangeValidateOtp(email, code);
        console.log("Email verification response:", response);

        // Check if verification was successful
        if (response) {
          await storageService.setItem(
            StorageKeys.TOKEN_DATA,
            JSON.stringify(
              (response as ExchangeValidateOtpResponse).data?.session || ""
            )
          );

          // Check if user data has username
          let exchangeUser = exchangeUserData;

          const userData = (response as ExchangeValidateOtpResponse)?.data
            ?.user;

          await storageService.setItem(
            StorageKeys.USER_PROFILE,
            JSON.stringify(userData)
          );

          if (!userData?.username) {
            // exchangeUser = await getExchangeUser();
          }

          const userResponse = await fetchUserById(userData as UserModel);
          exchangeUser = userResponse.data;

          if (exchangeUser?.username) {
            // User has username, close bottom sheet and navigate to app
            console.log(
              "User has username, closing bottom sheet and navigating to app"
            );
            hideAllBottomSheets();
            if (onCloseBottomSheet) {
              onCloseBottomSheet();
            }
            // check if the user has faceId enabled
            const faceIdEnabled = pinStorageService.getFaceIdValue();
            if (!faceIdEnabled) {
              router.push("/dashboard/home/wallet-home/swap");
            } else {
              // trigger the faceid scanning
              const val = await pinStorageService.triggerFaceId();
              if (val) {
                router.push("/dashboard/home/wallet-home/swap");
              } else {
                Alert.alert("Error", "Face ID verification failed", [
                  {
                    isPreferred: true,
                    onPress: async () => {
                      const val = await pinStorageService.triggerFaceId();
                      if (val) {
                        router.push("/dashboard/home/wallet-home/swap");
                      }
                    },
                    style: "default",
                    text: "try again",
                  },
                  {
                    isPreferred: true,
                    onPress: () => router.push("/"),
                    style: "default",
                    text: "Cancel",
                  },
                ]);
              }
            }
          } else {
            // User doesn't have username, continue with normal flow
            onVerify?.(code);
          }
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setError(error as string);
        // Error handling is already done by the API service with toast notifications
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <>
      <Pressable onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
        <Box alignItems="center" marginBottom="s" marginTop="xl">
          <CustomText
            variant="header"
            fontSize={24}
            color="headerTextColor"
            textAlign="center"
            marginBottom="m"
          >
            Email Verification
          </CustomText>
        </Box>

        <Box marginTop="l">
          <OTPInput
            length={6}
            onCodeChange={handleCodeChange}
            onCodeComplete={handleCodeComplete}
            onResend={handleResend}
            autoFocus={true}
            disabled={isLoading}
            resendTimer={resendTimer}
            instructionText="Please enter the 6-digit OTP sent to"
            phoneNumber={email}
            error={error !== null}
            errorText={error || ""}
          />
        </Box>

        <Box
          style={{
            position: "absolute",
            bottom: 150,
            width: SCREEN_WIDTH * 0.9,
            alignSelf: "center",
          }}
        >
          <CustomButton
            text={isVerifying ? "Verifying..." : "Verify"}
            onPress={handleVerify}
            disabled={!isCodeComplete || isLoading || isVerifying}
            isLoading={isLoading || isVerifying}
            width="100%"
            height={56}
            borderRadius={56}
            bgColor={
              isCodeComplete && !isVerifying
                ? theme.colors.primaryColor
                : theme.colors.inActiveBtnColor
            }
            color="white"
            fontSize={16}
            variant="bodySubheader"
          />
        </Box>
      </Pressable>
    </>
  );
}

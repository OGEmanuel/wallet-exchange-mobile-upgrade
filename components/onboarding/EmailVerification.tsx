import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import storageService from "@/src/core/storage/app-storage";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ExchangeValidateOtpResponse } from "@zap/blockchain-sdk";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable } from "react-native";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (code: string, userData?: any) => void;
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
  const { handleExchangeValidateOtp } = useExchangeAuth();

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
        // If response is false, it means 2FA is required (handled separately)
        // Only proceed if we have a valid response object with user data
        if (response && typeof response === 'object' && 'data' in response) {
          const responseData = response as ExchangeValidateOtpResponse;
          
          // Check if 2FA is required (response has twoFA flag but no user)
          const requires2FA = 
            responseData.message?.toLowerCase().includes('2fa required') ||
            responseData.message?.toLowerCase().includes('2fa') ||
            (responseData.data as any)?.twoFA === true;
          
          if (requires2FA && !responseData.data?.user) {
            // 2FA is required - the 2FA input sheet should already be showing
            // Don't show error here, just wait for 2FA input
            setIsVerifying(false);
            return;
          }

          await storageService.setItem(
            StorageKeys.TOKEN_DATA,
            JSON.stringify(responseData.data?.session || "")
          );

          const userData = responseData.data?.user;

          if (userData) {
            await storageService.setItem(
              StorageKeys.USER_PROFILE,
              JSON.stringify(userData)
            );
          }

          // Only call onVerify if we have user data (full login successful)
          if (userData) {
            onVerify?.(code, userData);
          }
        } else if (response === false) {
          // 2FA is required - don't show error, the 2FA input sheet will handle it
          // Just reset the verifying state
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        // Only show error if it's not a 2FA-related error
        // 2FA errors should be handled by the 2FA input sheet
        const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
        const is2FAError = errorMessage.toLowerCase().includes('2fa') || errorMessage.toLowerCase().includes('totp');
        
        if (!is2FAError) {
          setError(errorMessage);
        }
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

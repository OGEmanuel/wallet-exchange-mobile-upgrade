import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
}

export default function EmailVerification({
  email = "kazeemshak@gmail.com",
  onVerify,
  onResend,
  isLoading = false,
}: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const theme = useTheme<Theme>();
  const { verifyEmail } = useKyc();

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
    setIsCodeComplete(newCode.length === 6);
  };

  const handleCodeComplete = (completeCode: string) => {
    setIsCodeComplete(true);
    console.log("Code complete:", completeCode);
    // Don't call onVerify here - wait for manual verification
  };

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
        const response = await verifyEmail({
          email,
          otp: code,
        });
        console.log("Email verification response:", response);

        // Only call onVerify after successful API response
        if (response.success) {
          onVerify?.(code);
        }
      } catch (error) {
        console.error("Email verification error:", error);
        // Error handling is already done by the API service with toast notifications
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <>
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
    </>
  );
}

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
  const theme = useTheme<Theme>();

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
    onVerify?.(completeCode);
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(90);
      onResend?.();
    }
  };

  const handleVerify = () => {
    if (isCodeComplete && !isLoading) {
      onVerify?.(code);
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
          text="Verify"
          onPress={handleVerify}
          disabled={!isCodeComplete || isLoading}
          isLoading={isLoading}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={
            isCodeComplete
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

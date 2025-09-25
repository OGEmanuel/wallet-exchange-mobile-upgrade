import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import CodeInput from "../form/CodeInput";
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

        <CustomText
          variant="body"
          fontSize={16}
          color="placeholderTextColor"
          textAlign="center"
          lineHeight={22}
        >
          Please enter the 6-digit OTP sent to
        </CustomText>

        <CustomText
          variant="body"
          fontSize={16}
          color="bodyTextColor"
          textAlign="center"
          lineHeight={22}
        >
          {email}
        </CustomText>
      </Box>

      <Box marginTop="l">
        <CodeInput
          length={6}
          onCodeChange={handleCodeChange}
          onCodeComplete={handleCodeComplete}
          autoFocus={true}
          disabled={isLoading}
        />
      </Box>

      <Box alignItems="flex-start" flexDirection="row">
        <CustomText variant="body" fontSize={14} color="bodyTextColor">
          Didn't receive a code?{" "}
        </CustomText>
        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <CustomText
            variant="body"
            fontSize={14}
            color={resendTimer > 0 ? "disabledTextColor" : "primaryColor"}
            style={{ fontWeight: "600" }}
          >
            {resendTimer > 0 ? `Resend ${resendTimer}s` : "Resend"}
          </CustomText>
        </Pressable>
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

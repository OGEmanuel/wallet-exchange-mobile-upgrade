import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";

interface PhoneVerificationProps {
  phoneNumber: string;
  countryCode: string;
  onOTPVerified: () => void;
  onBack?: () => void;
}

export default function PhoneVerification({
  phoneNumber,
  countryCode,
  onOTPVerified,
}: PhoneVerificationProps) {
  const { colors } = useTheme<Theme>();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(90);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const { authPhoneNumber, verifyPhoneNumberOtp } = useKyc();

  const handleOtpChange = (code: string) => {
    setOtp(code);
  };

  const handleOtpComplete = (code: string) => {
    setOtp(code);
    // Handle verification logic here
    console.log("Verifying OTP:", code);
  };

  const triggerTimer = () => {

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    setCountdown(90);
    triggerTimer();
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      setIsVerifying(true);
      verifyPhoneNumberOtp({
        identifier: `+${countryCode}${phoneNumber}`,
        isOnboarding: true,
        otp: otp,
      }).then(() => {
        onOTPVerified();
      }).catch((error) => {
        // console.log(error);
      }).finally(() => {
        setIsVerifying(false);
      });
      // For now, just call the callback - in real app, verify with backend
      // onOTPVerified();
    }
  };

  const handleResend = () => {
    setIsResendDisabled(true);

    authPhoneNumber({
      phone: phoneNumber,
      countryCode: countryCode.replaceAll("+", "") || null,
      isWhatsApp: false,
    }).then(() => {
      resetTimer();
    }).catch((error) => {
      // console.log(error);
    }).finally(() => {
      setIsResendDisabled(false);
    });
  };

  // Trigger countdown timer when component mounts
  useEffect(() => {
    triggerTimer();
  }, []);

  return (
    <View style={styles.container}>
      {/* Title */}
      <CustomText variant="header" style={styles.title}>
        Phone Verification
      </CustomText>

      {/* OTP Input */}
      <OTPInput
        length={6}
        onCodeChange={handleOtpChange}
        onCodeComplete={handleOtpComplete}
        onResend={handleResend}
        autoFocus={true}
        resendTimer={countdown}
        instructionText="Please enter the 6-digit OTP sent to"
        phoneNumber={`${countryCode}${phoneNumber}`}
        textAlign="left"
      />

      {/* Verify button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          text="Verify"
          onPress={handleVerify}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={colors.primaryColor}
          color={colors.white}
          variant="bodySubheader"
          isLoading={isVerifying}
          fontSize={16}
          disabled={otp.length !== 6 || isResendDisabled}
          disabledColor={colors.borderColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
    marginBottom: 16,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
});

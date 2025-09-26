import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";

export default function PhoneVerification() {
  const { colors } = useTheme<Theme>();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(90);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const handleOtpChange = (code: string) => {
    setOtp(code);
  };

  const handleOtpComplete = (code: string) => {
    setOtp(code);
    // Handle verification logic here
    console.log("Verifying OTP:", code);
  };

  const handleResend = () => {
    // Reset countdown and disable resend
    setCountdown(90);
    setIsResendDisabled(true);

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

  const handleVerify = () => {
    if (otp.length === 6) {
      // Handle verification logic here
      console.log("Verifying OTP:", otp);
    }
  };

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handle} />

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
        phoneNumber="+2349000000000"
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
          fontSize={16}
          disabled={otp.length !== 6}
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
    fontSize: 24,
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

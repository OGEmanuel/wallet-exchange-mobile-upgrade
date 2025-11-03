import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import theme, { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";

interface PhoneVerificationProps {
  phoneNumber?: string;
  countryCode?: string;
  onOTPVerified: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export default function PhoneVerification({
  phoneNumber: propPhoneNumber,
  countryCode: propCountryCode,
  onOTPVerified,
  onSkip,
}: PhoneVerificationProps) {
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { colors } = useTheme<Theme>();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(90);
  const [isVerifying, setIsVerifying] = useState(false);
  const { updateUser, authPhoneNumber, verifyPhoneNumberOtp } = useKyc();

  // Get phone number and country code from props or user state
  const phoneNumber = useMemo(() => {
    if (propPhoneNumber) return propPhoneNumber;
    // Try to extract from user.phone if available
    if (user?.phone) {
      // Format might be "+1234567890"
      return user.phone.replace(/^\+\d{1,4}/, "");
    }
    return "";
  }, [propPhoneNumber, user?.phone]);

  const countryCode = useMemo(() => {
    if (propCountryCode) return propCountryCode;
    // Try to extract from user.phone or metadata
    if (user?.phone) {
      const match = user.phone.match(/^\+(\d{1,4})/);
      if (match) return `+${match[1]}`;
    }
    // Try to get from metadata
    const phoneCode = user?.metaData?.userPhoneNumberData?.countryData?.phoneCode;
    if (phoneCode) return phoneCode;
    return "";
  }, [propCountryCode, user?.phone, user?.metaData?.userPhoneNumberData?.countryData?.phoneCode]);

  const handleOtpChange = (code: string) => {
    setOtp(code);
  };

  const handleOtpComplete = (code: string) => {
    setOtp(code);
    // Handle verification logic here
    console.log("Verifying OTP:", code);
  };

  const resetTimer = () => {
    setCountdown(90);
  };

  const handleVerify = async () => {
    if (otp.length === 6 && phoneNumber && countryCode) {
      setIsVerifying(true);
      try {
        const response = await verifyPhoneNumberOtp({
          identifier: `${countryCode}${phoneNumber}`,
          isOnboarding: true,
          otp: otp,
        });

        if (response.success) {
          // Update user metadata to indicate phone verification is complete
          // The onboarding context will automatically move to the next step
          await updateUser({
            ...user,
            phoneNumberVerified: true,
            phone: `${countryCode}${phoneNumber}`,
            metaData: {
              ...user?.metaData,
              userPhoneNumberData: {
                ...user?.metaData?.userPhoneNumberData,
                shownPhoneNumberInput: true,
              },
            },
          });

          onOTPVerified();
        }
      } catch (error) {
        console.error("Failed to verify phone OTP:", error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleSkip = () => {
    // Update user metadata to indicate phone verification was skipped
    updateUser({
      ...user,
      metaData: {
        ...user?.metaData,
        userPhoneNumberData: {
          ...user?.metaData?.userPhoneNumberData,
          userskippedPhoneNumberOnboarding: true,
          shownPhoneNumberOnboardingIntro: true,
        },
      },
    });

    onSkip?.();
  };

  const handleResend = async () => {
    if (!phoneNumber || !countryCode) return;

    try {
      await authPhoneNumber({
        phone: phoneNumber,
        countryCode: countryCode.replaceAll("+", "") || null,
        isWhatsApp: false,
      });
      resetTimer();
    } catch (error) {
      console.error("Failed to resend phone verification:", error);
    }
  };

  // Trigger countdown timer when component mounts
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    const startTimer = () => {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startTimer();

    return () => {
      if (interval) clearInterval(interval);
    };
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
            text="Skip"
            onPress={handleSkip}
            // width="48%"
            height={56}
            borderRadius={56}
            bgColor={theme.colors.secondaryBackgroundColor}
            color={theme.colors.bodyTextColor}
            variant="bodySubheader"
            fontSize={16}
          />
          <CustomButton
            text="Verify"
            onPress={handleVerify}
            // width="100%"
            height={56}
            borderRadius={56}
            bgColor={colors.primaryColor}
            color={colors.white}
            variant="bodySubheader"
            isLoading={isVerifying}
            fontSize={16}
            disabled={otp.length !== 6 || isVerifying}
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
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    gap: 12,
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
});

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, OTPInput } from "../../../components/ui";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";
import { Onboarding } from "../types";

interface AuthPhoneNumberOtpStepProps {
  phoneNumber?: string;
}

const AuthPhoneNumberOtpStep: React.FC<AuthPhoneNumberOtpStepProps> = ({
  phoneNumber = "+234 800 000 0000",
}) => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(90);
  const otpInputRef = useRef<any>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOTPComplete = async (code: string) => {
    setOtp(code);
    setError(false);
    setIsLoading(true);

    // TODO: Implement phone OTP verification API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    // TODO: Implement resend OTP
    setResendTimer(90);
    setError(false);
  };

  const handleBack = () => {
    setCurrentOnboardingStep(Onboarding.AuthPhoneNumberInput);
  };

  const handleSkip = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: theme.colors.bodyTextColor }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Phone Verification
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        Please enter the 6-digit OTP sent to {phoneNumber}
      </Text>

      <View style={styles.otpContainer}>
        <OTPInput
          ref={otpInputRef}
          length={6}
          onComplete={handleOTPComplete}
          onError={error}
          autoFocus={true}
        />
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Invalid OTP. Please try again.
        </Text>
      )}

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: theme.colors.bodyTextColor }]}>
          Didn't receive a code?{" "}
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text
            style={[
              styles.resendLink,
              {
                color:
                  resendTimer > 0
                    ? theme.colors.placeholderTextColor
                    : theme.colors.primaryColor,
              },
            ]}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>

      {resendTimer === 0 && (
        <View style={styles.resendMethods}>
          <TouchableOpacity style={styles.resendMethodButton}>
            <Text style={styles.resendMethodText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendMethodButton}>
            <Text style={styles.resendMethodText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendMethodButton}>
            <Text style={styles.resendMethodText}>Text</Text>
          </TouchableOpacity>
        </View>
      )}

      <Button
        title="Continue"
        onPress={() => handleOTPComplete(otp)}
        isLoading={isLoading}
        disabled={otp.length !== 6 || isLoading}
        variant="primary"
        size="lg"
        style={styles.button}
      />

      <Button
        title="Skip"
        onPress={handleSkip}
        variant="text"
        size="md"
        style={styles.skipButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    minHeight: 400,
  },
  backButton: {
    width: 28,
    height: 28,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_Regular",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "NewScience_SemiBold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    fontFamily: "PlusJakartaSans_Regular",
  },
  otpContainer: {
    width: "100%",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    fontFamily: "PlusJakartaSans_Regular",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  resendMethods: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  resendMethodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  resendMethodText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Medium",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  skipButton: {
    width: "100%",
  },
});

export default AuthPhoneNumberOtpStep;

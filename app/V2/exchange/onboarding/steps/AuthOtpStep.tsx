import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AppButton, AppOTPInput } from "../../../components/ui";

const AuthOtpStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { verifyEmail, authEmail, fetchUserById, updateUser } = useKyc();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(90);
  const otpInputRef = useRef<any>(null);

  const email = user?.email || "";

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

    try {
      const response = await verifyEmail({
        email: email,
        otp: code,
      });

      if (response?.success) {
        // Get user data from response (response.data contains AuthVerificationModel which has user)
        const responseUser = response.data?.user;
        
        if (responseUser) {
          // Update user data in Redux and wallet context
          // This will sync user data throughout the app
          const updatedUser = {
            ...user,
            ...responseUser,
            emailVerified: true, // Mark email as verified
          };

          // Update user in Redux and wallet context (updateUser handles both)
          await updateUser(updatedUser);

          // Fetch fresh user data from backend to ensure everything is in sync
          await fetchUserById(updatedUser);
        } else {
          // If no user data in response, just mark email as verified locally
          await updateUser({
            ...user,
            emailVerified: true,
          });
          
          // Fetch updated user data from backend
          if (user?._id) {
            await fetchUserById(user);
          }
        }
      } else {
        setError(true);
        otpInputRef.current?.clear();
      }
    } catch (error: any) {
      console.error("Verify email error:", error);
      setError(true);
      otpInputRef.current?.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await authEmail({
        email: email,
      });
      if (response?.success) {
        setResendTimer(90);
        setError(false);
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Email Verification
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        Please enter the 6-digit OTP sent to
      </Text>

      <Text style={[styles.email, { color: theme.colors.bodyTextColor }]}>
        {email}
      </Text>

      <View style={styles.otpContainer}>
        <AppOTPInput
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
          Didn&apos;t receive a code?{" "}
        </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
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

      <AppButton
        title={isLoading ? "Verifying..." : "Verify"}
        onPress={() => handleOTPComplete(otp)}
        isLoading={isLoading}
        disabled={otp.length !== 6 || isLoading}
        variant="primary"
        size="lg"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    minHeight: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "NewScience_SemiBold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_Regular",
  },
  email: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "PlusJakartaSans_Medium",
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
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  button: {
    width: "100%",
  },
});

export default AuthOtpStep;

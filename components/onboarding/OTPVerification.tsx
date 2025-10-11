import { useZapSDK } from "@/src/core/sdk/useZapSDK";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomText } from "../general";
import CustomButton from "../general/CustomButton";

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess?: (userId: string) => void;
  onBack?: () => void;
}

export default function OTPVerification({ 
  email, 
  onVerificationSuccess, 
  onBack 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme<Theme>();
  const { sdk, isInitialized } = useZapSDK();

  const handleVerification = async () => {
    if (!sdk || !isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await sdk.validateExchangeOtp(email, otp);
      
      if (result.success) {
        Alert.alert('Success', 'Email verified successfully!');
        onVerificationSuccess?.(result.data.userId);
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!sdk || !isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      const result = await sdk.sendExchangeOtp(email);
      
      if (result.success) {
        Alert.alert('Success', 'OTP resent to your email');
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <View>
      <CustomText
        variant="header"
        marginVertical="s"
        style={{
          fontSize: 22,
          textAlign: "center",
          fontWeight: "600",
          marginVertical: 24,
        }}
      >
        Verify Your Email
      </CustomText>
      
      <CustomText
        variant="body"
        style={{
          textAlign: "center",
          marginBottom: 24,
          color: theme.colors.bodyTextColor,
        }}
      >
        We've sent a 6-digit code to {email}
      </CustomText>

      <CustomInputWithoutForm
        value={otp}
        onChange={setOtp}
        placeholder="Enter 6-digit code"
        keyboardType="numeric"
        maxLength={6}
        noBorder={true}
        style={{
          textAlign: "center",
          fontSize: 18,
          letterSpacing: 2,
        }}
      />
      
      <View style={{ marginTop: 24 }}>
        <CustomButton
          width={"100%"}
          height={56}
          borderRadius={56}
          text={loading ? "Verifying..." : "Verify"}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          onPress={handleVerification}
          disabled={otp.length !== 6 || loading}
          disabledColor={theme.colors.borderColor}
        />
      </View>

      <View style={{ marginTop: 16 }}>
        <CustomButton
          width={"100%"}
          height={48}
          borderRadius={48}
          text="Resend Code"
          bgColor="transparent"
          color={theme.colors.primaryColor}
          onPress={handleResendOTP}
          disabled={loading}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primaryColor,
          }}
        />
      </View>

      {onBack && (
        <View style={{ marginTop: 16 }}>
          <CustomButton
            width={"100%"}
            height={48}
            borderRadius={48}
            text="Back"
            bgColor="transparent"
            color={theme.colors.bodyTextColor}
            onPress={onBack}
            disabled={loading}
          />
        </View>
      )}
    </View>
  );
}

import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { debounce } from "lodash";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomText } from "../general";
import CustomButton from "../general/CustomButton";

interface LoginToZapProps {
  onLoginSuccess?: (email: string) => void;
}

export default function LoginToZap({ onLoginSuccess }: LoginToZapProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const theme = useTheme<Theme>();
  const { handleExchangeLogin } = useExchangeAuth();
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(""); // Clear error when user types
    // Debounced validation
    debouncedValidateEmail(value, (error: string) => {
      setEmailError(error);
    });
  };

  const debouncedValidateEmail = useCallback(
    debounce((value: string, callback: (error: string) => void) => {
      callback(
        validateEmail(value) ? "" : "Please enter a valid email address"
      );
    }, 500),
    []
  );

  const handleLogin = async () => {
    // Validate email before proceeding
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setEmailError(""); // Clear any previous errors
      const response = await handleExchangeLogin(email);
      console.log("handleExchangeLogin response:", response);
      if (response) {
        onLoginSuccess?.(email);
        setLoading(false);
      } else {
        setEmailError("Failed to send OTP. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      alert(JSON.stringify(error));
      setEmailError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
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
        Login to Zap
      </CustomText>
      <CustomInputWithoutForm
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter your email address"
        noBorder={true}
        keyboardType="email-address"
        color={theme.colors.bodyTextColor}
      />
      {emailError ? (
        <CustomText
          variant="body"
          color="error"
          style={{
            fontSize: 12,
            marginTop: 8,
            marginLeft: 4,
          }}
        >
          {emailError}
        </CustomText>
      ) : null}
      <View style={{ marginTop: 24 }}>
        <CustomButton
          width={"100%"}
          height={56}
          borderRadius={56}
          text={loading ? "Loading..." : "Continue"}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          onPress={handleLogin}
          disabled={!email.trim() || !validateEmail(email) || loading}
          disabledColor={theme.colors.borderColor}
        />
      </View>
    </View>
  );
}

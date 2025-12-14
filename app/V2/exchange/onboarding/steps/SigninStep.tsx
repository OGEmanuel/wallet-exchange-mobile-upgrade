import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Input } from "../../../components/ui";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";
import { Onboarding } from "../types";

const SigninStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { handleExchangeLogin } = useExchangeAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (touched) {
      setEmailError(validateEmail(text) ? "" : "Please enter a valid email address");
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!email.trim()) {
      setEmailError("Email is required");
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleContinue = async () => {
    setTouched(true);
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setEmailError("");
    try {
      const result = await handleExchangeLogin(email);
      if (result) {
        setCurrentOnboardingStep(Onboarding.AuthOtp);
      } else {
        setEmailError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setEmailError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in
    console.log("Google sign in");
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple sign in
    console.log("Apple sign in");
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Login to Zap
      </Text>

      <Input
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleBlur}
        placeholder="Email / username"
        type="email"
        error={emailError}
        touched={touched}
        style={styles.input}
      />

      <Button
        title="Continue"
        onPress={handleContinue}
        isLoading={isLoading}
        disabled={!email.trim() || !!emailError || isLoading}
        variant="primary"
        size="lg"
        style={styles.button}
      />

      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderColor }]} />
        <Text style={[styles.dividerText, { color: theme.colors.placeholderTextColor }]}>
          OR
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderColor }]} />
      </View>

      <Button
        title="Sign in with Google"
        onPress={handleGoogleSignIn}
        variant="outline"
        size="lg"
        style={[styles.socialButton, { backgroundColor: theme.colors.secondaryBackgroundColor }]}
        icon={
          <Text style={styles.socialIcon}>G</Text>
        }
      />

      <Button
        title="Sign in with Apple"
        onPress={handleAppleSignIn}
        variant="primary"
        size="lg"
        style={[styles.socialButton, { backgroundColor: theme.colors.black }]}
        icon={
          <Text style={[styles.socialIcon, { color: theme.colors.white }]}>🍎</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    minHeight: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "NewScience_SemiBold",
  },
  input: {
    marginBottom: 24,
  },
  button: {
    width: "100%",
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  socialButton: {
    width: "100%",
    marginBottom: 16,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default SigninStep;

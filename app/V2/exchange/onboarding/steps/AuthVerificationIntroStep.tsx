import images from "@/assets/images";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthVerificationIntroStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();

  const handleGetStarted = () => {
    setCurrentOnboardingStep(Onboarding.AuthPhoneNumberInput);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Verify your identity
      </Text>

      <Image
        source={images.startVerification}
        style={styles.illustration}
        resizeMode="contain"
      />

      <Text style={[styles.description, { color: theme.colors.placeholderTextColor }]}>
        To conduct swaps on Zap, you will need to complete KYC with BVN and government ID
      </Text>

      <Button
        title="Get Started"
        onPress={handleGetStarted}
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
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "NewScience_SemiBold",
  },
  illustration: {
    width: "50%",
    height: "60%",
    aspectRatio: 1,
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
    fontFamily: "PlusJakartaSans_Regular",
  },
  button: {
    width: "100%",
  },
});

export default AuthVerificationIntroStep;

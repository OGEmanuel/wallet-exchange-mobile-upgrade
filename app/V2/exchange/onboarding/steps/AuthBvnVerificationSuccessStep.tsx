import images from "@/assets/images";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthBvnVerificationSuccessStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();

  const handleVerifyId = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdVerificationInput);
  };

  return (
    <View style={styles.container}>
      <Image source={images.success} style={styles.successIcon} resizeMode="contain" />

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        BVN Verified!
      </Text>

      <Text style={[styles.description, { color: theme.colors.placeholderTextColor }]}>
        You can now transact up to $150 over 3 transactions. Verify your ID to increase your
        transaction limit.
      </Text>

      <AppButton
        title="Verify ID"
        onPress={handleVerifyId}
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
  successIcon: {
    width: "50%",
    height: "60%",
    aspectRatio: 1,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "NewScience_SemiBold",
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

export default AuthBvnVerificationSuccessStep;

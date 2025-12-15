import images from "@/assets/images";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/ui";
import { useAppBottomSheetContext } from "../bottomsheet/AppBottomSheetContext";

const AuthVerificationSubmittedStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { closeBottomSheet } = useAppBottomSheetContext();

  const handleGotIt = () => {
    closeBottomSheet();
  };

  return (
    <View style={styles.container}>
      <Image source={images.success} style={styles.successIcon} resizeMode="contain" />

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Verification Submitted
      </Text>

      <Text style={[styles.description, { color: theme.colors.placeholderTextColor }]}>
        We've received your documents and they are under review. We'll let you know once it is
        successful.
      </Text>

      <AppButton
        title="Got it"
        onPress={handleGotIt}
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
    width: "33%",
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

export default AuthVerificationSubmittedStep;

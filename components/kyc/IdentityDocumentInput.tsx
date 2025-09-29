import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomButton, CustomText } from "../general";

interface IdentityDocumentInputProps {
  onNext?: (data?: any) => void;
  onBack?: () => void;
}

export default function IdentityDocumentInput({
  onNext,
  onBack,
}: IdentityDocumentInputProps) {
  const [documentId, setDocumentId] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme<Theme>();

  const handleContinue = async () => {
    if (!documentId.trim() || !firstname.trim() || !lastname.trim()) {
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // await verificationApiService.submitIdentityDocument({ documentId, firstname, lastname });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // On success, proceed to next step
      onNext?.({
        identityDocumentSubmitted: true,
        documentId: documentId.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      });
    } catch (error: any) {
      console.error("Identity document submission error:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <CustomText style={styles.backArrow}>←</CustomText>
        </Pressable>
      )}

      <View style={styles.header}>
        <CustomText variant="header" style={styles.title}>
          Verify your ID
        </CustomText>
        <CustomText variant="body" style={styles.subtitle}>
          We require a photo of a government issued ID to verify your identity.
        </CustomText>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <CustomInputWithoutForm
              label="First Name"
              placeholder="Enter First Name"
              value={firstname}
              onChange={setFirstname}
              keyboardType="default"
            />
          </View>
          <View style={styles.nameField}>
            <CustomInputWithoutForm
              label="Last Name"
              placeholder="Enter Last Name"
              value={lastname}
              onChange={setLastname}
              keyboardType="default"
            />
          </View>
        </View>

        <CustomInputWithoutForm
          label="Document ID"
          placeholder="Enter Document ID"
          value={documentId}
          onChange={setDocumentId}
          keyboardType="default"
        />
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          text="Continue"
          onPress={handleContinue}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={16}
          disabled={!documentId.trim() || !firstname.trim() || !lastname.trim()}
          disabledColor={theme.colors.borderColor}
          isLoading={loading}
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
    alignSelf: "center",
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
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  formContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
});

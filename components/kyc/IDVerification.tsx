import icons from "@/assets/icons";
import { ThemedChevronRightIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomButton, CustomText } from "../general";
import SimpleDropdown from "./SimpleDropdown";

interface IDVerificationProps {
  userData: any;
  onDocumentSelected: (data: any) => void;
  onBack?: () => void;
}

const documentTypes = [
  { label: "Driver's License", value: "drivers_license" },
  { label: "National ID", value: "national_id" },
  { label: "International Passport", value: "international_passport" },
];

export default function IDVerification({
  userData,
  onDocumentSelected,
  onBack,
}: IDVerificationProps) {
  const theme = useTheme<Theme>();
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [documentType, setDocumentType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const isFormValid = firstName.trim() && lastName.trim() && documentType;

  const handleContinue = () => {
    if (isFormValid) {
      onDocumentSelected({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        documentType,
        documentId: documentId.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText variant="header" style={styles.title}>
          ID Verification
        </CustomText>
        <CustomText variant="body" style={styles.subtitle}>
          We require a photo of a government issued ID to verify your identity.
        </CustomText>
      </View>

      <View style={styles.formContainer}>
        {/* Sumsub Card */}
        <View
          style={[
            styles.sumsubCard,
            { backgroundColor: theme.colors.secondaryBackgroundColor },
          ]}
        >
          <View style={styles.sumsubContent}>
            <View style={styles.sumsubLeft}>
              <Image
                source={icons.sumsub}
                style={{ width: 40, height: 40, marginRight: 12 }}
              />
              <View style={styles.sumsubText}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CustomText
                      style={[
                        styles.sumsubTitle,
                        { color: theme.colors.bodyTextColor },
                      ]}
                    >
                      Verify using Sumsub
                    </CustomText>

                    <View
                      style={[
                        styles.fasterTag,
                        { backgroundColor: theme.colors.primaryColor },
                      ]}
                    >
                      <Image
                        source={icons.sumsubLighting}
                        style={{ width: 10, height: 10, marginRight: 1 }}
                      />
                      <CustomText style={styles.fasterText}>Faster</CustomText>
                    </View>
                  </View>
                  <View style={styles.sumsubRight}>
                    <ThemedChevronRightIcon
                      lightModeColor={theme.colors.bodyTextColor}
                      darkModeColor={theme.colors.bodyTextColor}
                    />
                  </View>
                </View>
                <CustomText
                  style={[
                    styles.sumsubSubtitle,
                    { color: theme.colors.placeholderTextColor },
                  ]}
                >
                  Instant and no hassle verification using Sumsub portal
                </CustomText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <CustomInputWithoutForm
              label="First Name"
              placeholder="Enter First Name"
              value={firstName}
              onChange={setFirstName}
              keyboardType="default"
            />
          </View>
          <View style={styles.nameField}>
            <CustomInputWithoutForm
              label="Last Name"
              placeholder="Enter Last Name"
              value={lastName}
              onChange={setLastName}
              keyboardType="default"
            />
          </View>
        </View>

        <SimpleDropdown
          label="Select document type"
          placeholder="Select document type"
          options={documentTypes}
          onSelect={(value) => setDocumentType(value)}
          value={documentType}
        />

        {documentType === "international_passport" && (
          <>
            <CustomInputWithoutForm
              label="Document ID"
              placeholder="Enter Document ID"
              value={documentId}
              onChange={setDocumentId}
              keyboardType="default"
            />
            <CustomInputWithoutForm
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              keyboardType="default"
            />
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          text="Continue"
          onPress={handleContinue}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={
            isFormValid ? theme.colors.primaryColor : theme.colors.borderColor
          }
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={16}
          disabled={!isFormValid}
          disabledColor={theme.colors.borderColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 16,
  },
  nameField: {
    flex: 1,
  },
  sumsubCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sumsubContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sumsubLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  lightningIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lightningText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  sumsubText: {
    flex: 1,
  },
  sumsubTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  sumsubSubtitle: {
    fontSize: 12,
    opacity: 0.8,
    width: "80%",
  },
  sumsubRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  fasterTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  fasterText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    paddingBottom: 120,
  },
});

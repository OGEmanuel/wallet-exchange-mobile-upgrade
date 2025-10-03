import { ThemedBackIcon } from "@/assets/svg/wallet-icons-components";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { Box, CustomButton, CustomText } from "../general";
import Select from "../Select";

interface IDVerificationProps {
  userData: any;
  onDocumentSelected: (data: any) => void;
  onBack?: () => void;
}

// const documentTypes = [
//   { label: "Driver's License", value: "drivers_license" },
//   { label: "National ID", value: "national_id" },
//   { label: "International Passport", value: "international_passport" },
// ];

export default function IDVerification({
  userData,
  onDocumentSelected,
  onBack,
}: IDVerificationProps) {
  const theme = useTheme<Theme>();
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [documentType, setDocumentType] = useState<CountryVerificationDocumentModel | null>(null);
  const [documentId, setDocumentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [documentTypes, setDocumentTypes] = useState<CountryVerificationDocumentModel[] | null | undefined>(null);

  // Function to format date input as DD/MM/YYYY
  const formatDateInput = (text: string) => {
    // Remove all non-numeric characters
    const numericText = text.replace(/\D/g, '');

    // Limit to 8 digits (DDMMYYYY)
    const limitedText = numericText.slice(0, 8);

    // Format as DD/MM/YYYY
    if (limitedText.length <= 2) {
      return limitedText;
    } else if (limitedText.length <= 4) {
      return `${limitedText.slice(0, 2)}/${limitedText.slice(2)}`;
    } else {
      return `${limitedText.slice(0, 2)}/${limitedText.slice(2, 4)}/${limitedText.slice(4)}`;
    }
  };

  const handleDateOfBirthChange = (text: string) => {
    const formattedDate = formatDateInput(text);
    setDateOfBirth(formattedDate);
  };

  const isFormValid = firstName.trim() && lastName.trim() && documentType;
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { fetchDocumentTypes } = useUtilities();

  useEffect(() => {
    fetchDocumentTypes({
      body: user?.metaData?.documentVerification?.selectedVerifiedCountry || null,
      params: {},
      extra: {},
    }).then((response) => {
      if (response?.data) {
        setDocumentTypes(response.data || null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  console.log('documentType', !!documentType?.isExternal?.token);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <ThemedBackIcon />
        </Pressable>
      )}
      <View style={styles.header}>
        <CustomText variant="header" style={styles.title}>
          ID Verification
        </CustomText>
        <CustomText variant="body" style={styles.subtitle}>
          We require a photo of a government issued ID to verify your identity.
        </CustomText>
      </View>

      <Select
        label="Select document type"
        placeholder="Select document type"
        options={documentTypes?.filter((document) => document.verificationClass?.toLowerCase() === "identity").map((document) => ({
          label: document.verificationType?.toUpperCase() || "",
          value: document,
        })) || []}
        onSelect={(value) => {
          if (!Array.isArray(value)) {
            setDocumentType(value);
          }
        }}
        value={documentType}
      />
      {/* documentType.isExternal?.token ? <AuthSumSubVerification documentType={documentType} /> : */}

      {documentType?.isExternal?.token ? (
        <Box>
          <CustomText>External</CustomText>
        </Box>
      ) : (
        <Box flex={1}>
          <View style={styles.formContainer}>
            <View style={{
              flexDirection: "column",
              gap: 16,
              marginBottom: 16,
            }}>
              <CustomInputWithoutForm
                label="First Name"
                placeholder="Enter First Name"
                value={firstName}
                onChange={setFirstName}
                keyboardType="default"
              />

              <CustomInputWithoutForm
                label="Last Name"
                placeholder="Enter Last Name"
                value={lastName}
                onChange={setLastName}
                keyboardType="default"
              />

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
                onChange={handleDateOfBirthChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
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
        </Box>
      )}

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
    top: -30,
    left: 0,
    zIndex: 1,
  },
  // backButton: {
  //   position: "absolute",
  //   top: 20,
  //   left: 20,
  //   zIndex: 1,
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: "rgba(0,0,0,0.1)",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
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
    marginBottom: 26,
  },
  nameRow: {
    flexDirection: "column",
    columnGap: 16,
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
    paddingBottom: 40,
  },
});

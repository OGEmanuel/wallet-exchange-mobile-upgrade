import { CustomTextInput } from "@/components/form/CustomInput";
import { SubmitButton } from "@/components/form/SubmitButton";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import CustomDropDown from "../form/CustomDropDown";

interface IDVerificationFormData {
  firstName: string;
  lastName: string;
  documentType: string;
  documentId: string;
  dateOfBirth: string;
}

const documentTypeOptions = [
  { label: "International Passport", value: "passport" },
  { label: "Driver's License", value: "drivers_license" },
  { label: "National ID", value: "national_id" },
  { label: "Voter's Card", value: "voters_card" },
];

export default function IDVerification() {
  const theme = useTheme<Theme>();
  const [selectedDocumentType, setSelectedDocumentType] = useState("passport");

  const methods = useForm<IDVerificationFormData>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      documentType: "passport",
      documentId: "0123456789",
      dateOfBirth: "10/09/1999",
    },
  });

  const onSubmit = (data: IDVerificationFormData) => {
    console.log("ID Verification Form Data:", data);
    // Handle form submission here
  };

  return (
    <FormProvider {...methods}>
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Box paddingTop="l">
            {/* Header Section */}
            <Box marginBottom="xl">
              <CustomText
                variant="header"
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  textAlign: "left",
                  marginTop: 20,
                  marginBottom: 16,
                  color: "#FFFFFF",
                }}
              >
                ID Verification
              </CustomText>
              <CustomText
                variant="body"
                style={{
                  marginBottom: 24,
                  color: "#FFFFFF",
                  opacity: 0.8,
                  lineHeight: 20,
                }}
              >
                We require a photo of a government issued ID to verify your
                identity.
              </CustomText>
            </Box>

            {/* Form Fields */}
            <Box marginBottom="l" width={SCREEN_WIDTH * 0.9}>
              <Box flexDirection="row" gap="s" marginBottom="m">
                <Box flex={1}>
                  <CustomTextInput
                    name="firstName"
                    label="First Name"
                    placeholder="First Name"
                  />
                </Box>
                <Box flex={1}>
                  <CustomTextInput
                    name="lastName"
                    label="Last Name"
                    placeholder="Last Name"
                  />
                </Box>
              </Box>

              <Box marginBottom="m">
                <CustomDropDown
                  options={documentTypeOptions}
                  value={selectedDocumentType}
                  onSelected={setSelectedDocumentType}
                  placeHolder="Select Document Type"
                  label="Document Type"
                />
              </Box>

              <CustomTextInput
                name="documentId"
                label="Document ID"
                placeholder="Enter Document ID"
                containerStyle={styles.documentIdInputContainer}
              />
            </Box>

            {/* Continue Button */}
            <Box marginTop="xl" marginBottom="l">
              <SubmitButton onSubmit={onSubmit} label="Continue" width="100%" />
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  documentIdInputContainer: {
    marginBottom: 16,
  },
  dateOfBirthInputContainer: {
    marginBottom: 0,
  },
});

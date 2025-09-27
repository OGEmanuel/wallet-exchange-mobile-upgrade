import { CustomTextInput } from "@/components/form/CustomInput";
import { SubmitButton } from "@/components/form/SubmitButton";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";

interface BVNFormData {
  firstName: string;
  lastName: string;
  bvn: string;
}

export default function VerifiyBVN() {
  const theme = useTheme<Theme>();
  const methods = useForm<BVNFormData>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      bvn: "",
    },
  });

  const onSubmit = (data: BVNFormData) => {
    console.log("BVN Form Data:", data);
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
                Verify BVN
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
                Enter your bank verification number.
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

              <CustomTextInput
                name="bvn"
                label="Enter BVN"
                placeholder="Enter BVN"
                containerStyle={styles.bvnInputContainer}
                removeSpecialCharater
              />
            </Box>

            {/* Privacy Info Box */}
            <PrivacyInfoBox />

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

// Enhanced InfoBox component for privacy information
function PrivacyInfoBox() {
  const theme = useTheme<Theme>();

  return (
    <Box
      style={[
        styles.privacyContainer,
        {
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderColor: theme.colors.borderColor,
        },
      ]}
    >
      <CustomText variant="body" color="bodyTextColor" marginBottom="s">
        We need only access to your
      </CustomText>

      <Box marginBottom="s">
        <PrivacyItem text="Full name" />
        <PrivacyItem text="Date of Birth" />
        <PrivacyItem text="Phone number" />
      </Box>

      <Box flexDirection="row" alignItems="center" marginTop="s">
        <Feather
          name="lock"
          size={16}
          color={theme.colors.secondaryColor}
          style={{ marginRight: 8 }}
        />
        <CustomText variant="body" color="bodyTextColor" flex={1} fontSize={12}>
          Your BVN does not give us access to your bank accounts or
          transactions.
        </CustomText>
      </Box>
    </Box>
  );
}

function PrivacyItem({ text }: { text: string }) {
  const theme = useTheme<Theme>();

  return (
    <Box flexDirection="row" alignItems="center">
      <Box
        style={[
          styles.bulletPoint,
          { backgroundColor: theme.colors.bodyTextColor },
        ]}
      />
      <CustomText variant="body" color="bodyTextColor" marginLeft="s">
        {text}
      </CustomText>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  bvnInputContainer: {
    marginBottom: 0,
  },
  privacyContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

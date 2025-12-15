import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AppButton, AppImageUpload } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthIdVerificationUploadStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { uploadIdentityDocument, fetchUserById, updateUser } = useKyc();
  const { uploadFile } = useUtilities();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; type: string; name?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Get document type and form data from user metadata (stored in previous step)
  const idVerificationData = user?.metaData?.idVerificationData;
  const documentType = idVerificationData?.documentType;
  const documentTypeName = documentType?.verificationType;

  const handleFileSelect = (file: { uri: string; type: string; name?: string }) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!idVerificationData) {
      setUploadError("Please complete the previous step first");
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    setUploadError("");
    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name || "document.jpg",
      } as any);

      const uploadResponse = await uploadFile({
        body: formData,
        params: {},
        extra: {},
      });

      const photoUrl = uploadResponse?.data?.data?.url;

      if (!photoUrl) {
        throw new Error("Failed to upload file");
      }

      // Submit identity document
      const response = await uploadIdentityDocument({
        body: {
          countryId: user?.metaData?.documentVerification?.selectedVerifiedCountry?._id || idVerificationData?.selectedVerifiedCountry?._id,
          lastName: idVerificationData.lastName || "",
          firstName: idVerificationData.firstName || "",
          idNumber: idVerificationData.documentId || "",
          verificationType: documentType?.verificationType || idVerificationData?.documentType?.verificationType || "",
          docUrl: photoUrl,
          dateOfBirth: idVerificationData.dateOfBirth || "",
        },
        params: {},
        extra: {},
      });

      if (response?.success) {
        // Update user metadata to indicate ID verification is submitted
        updateUser({
          ...user,
          metaData: {
            ...user?.metaData,
            manuallySetAllIdenityDocumentToSubmitted: true,
            idVerificationData: {
              ...idVerificationData,
              // submitted: true,
            },
          },
        });

        // Fetch updated user data
        await fetchUserById(user);
        setCurrentOnboardingStep(Onboarding.AuthVerificationSubmitted);
      } else {
        setUploadError(response?.message || "Failed to submit document. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error?.message || "Failed to upload document. Please try again.");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdVerificationInput);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: theme.colors.bodyTextColor }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        {documentTypeName}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        Please provide a clear photo of the your entire {documentTypeName?.toLowerCase()} page
      </Text>

      <View style={styles.uploadContainer}>
        <AppImageUpload
          onFileSelect={handleFileSelect}
          fileType="image"
          preview={selectedFile?.uri}
          isLoading={isUploading}
        />
      </View>

      {uploadError && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {uploadError}
        </Text>
      )}

      {selectedFile && (
        <AppButton
          title="Use this photo"
          onPress={handleUpload}
          isLoading={isLoading}
          disabled={isLoading || !idVerificationData}
          variant="primary"
          size="lg"
          style={styles.button}
        />
      )}

      <AppButton
        title={selectedFile ? "Replace photo" : "Upload a Picture"}
        onPress={() => {
          // AppImageUpload component handles the file selection
        }}
        variant={selectedFile ? "outline" : "primary"}
        size="lg"
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    minHeight: 400,
  },
  backButton: {
    width: 28,
    height: 28,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_Regular",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: "NewScience_SemiBold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "PlusJakartaSans_Regular",
  },
  uploadContainer: {
    marginBottom: 32,
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "PlusJakartaSans_Regular",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
});

export default AuthIdVerificationUploadStep;

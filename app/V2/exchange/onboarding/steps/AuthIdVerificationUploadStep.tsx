import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Button, ImageUpload } from "../../../components/ui";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";
import { Onboarding } from "../types";

const AuthIdVerificationUploadStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { uploadIdentityDocument } = useKyc();
  const { uploadFile } = useUtilities();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; type: string; name?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Get document type from previous step or context
  const documentTypeName = "PASSPORT"; // This should come from previous step

  const handleFileSelect = (file: { uri: string; type: string; name?: string }) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
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
      await uploadIdentityDocument({
        body: {
          countryId: user?.metaData?.documentVerification?.selectedVerifiedCountry?._id,
          lastName: "", // TODO: Get from previous step
          firstName: "", // TODO: Get from previous step
          idNumber: "", // TODO: Get from previous step
          verificationType: "", // TODO: Get from previous step
          docUrl: photoUrl,
          dateOfBirth: "", // TODO: Get from previous step
        },
        params: {},
        extra: {},
      });

      setCurrentOnboardingStep(Onboarding.AuthVerificationSubmitted);
    } catch (error: any) {
      console.error("Upload error:", error);
      // TODO: Show error message
    } finally {
      setIsLoading(false);
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
        Please provide a clear photo of the your entire {documentTypeName.toLowerCase()} page
      </Text>

      <View style={styles.uploadContainer}>
        <ImageUpload
          onFileSelect={handleFileSelect}
          fileType="image"
          preview={selectedFile?.uri}
          isLoading={isUploading}
        />
      </View>

      {selectedFile && (
        <Button
          title="Use this photo"
          onPress={handleUpload}
          isLoading={isLoading}
          disabled={isLoading}
          variant="primary"
          size="lg"
          style={styles.button}
        />
      )}

      <Button
        title={selectedFile ? "Replace photo" : "Upload a Picture"}
        onPress={() => {
          // ImageUpload component handles the file selection
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
  button: {
    width: "100%",
    marginBottom: 16,
  },
});

export default AuthIdVerificationUploadStep;

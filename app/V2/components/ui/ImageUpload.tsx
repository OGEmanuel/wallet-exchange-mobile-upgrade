import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "./Button";

export type FileType = "image" | "pdf";

export interface ImageUploadProps {
  onFileSelect: (file: { uri: string; type: string; name?: string }) => void;
  fileType?: FileType;
  preview?: string;
  isLoading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  fileType = "image",
  preview,
  isLoading = false,
}) => {
  const theme = useTheme<Theme>();
  const [selectedFile, setSelectedFile] = useState<string | null>(preview || null);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    if (fileType === "image") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions!");
        return false;
      }
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(true);
    try {
      if (fileType === "image") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          setSelectedFile(asset.uri);
          onFileSelect({
            uri: asset.uri,
            type: "image",
            name: asset.fileName || "image.jpg",
          });
        }
      } else {
        // For PDF, use image picker with documents option (if available)
        // Note: expo-image-picker doesn't support PDF directly
        // You may need to install expo-document-picker for full PDF support
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          setSelectedFile(asset.uri);
          onFileSelect({
            uri: asset.uri,
            type: asset.mimeType || "application/pdf",
            name: asset.fileName || "document.pdf",
          });
        }
      }
    } catch (error) {
      console.error("Error picking file:", error);
      alert("Error selecting file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {selectedFile && fileType === "image" ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedFile }} style={styles.previewImage} />
          <TouchableOpacity
            style={[
              styles.replaceButton,
              { backgroundColor: theme.colors.secondaryBackgroundColor },
            ]}
            onPress={handleImagePick}
            disabled={uploading || isLoading}
          >
            {uploading || isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryColor} />
            ) : (
              <Text
                style={[
                  styles.replaceText,
                  { color: theme.colors.primaryColor },
                ]}
              >
                Replace photo
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : selectedFile && fileType === "pdf" ? (
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.pdfPreview,
              { backgroundColor: theme.colors.secondaryBackgroundColor },
            ]}
          >
            <Text style={[styles.pdfIcon, { color: theme.colors.bodyTextColor }]}>
              📄
            </Text>
            <Text
              style={[styles.pdfText, { color: theme.colors.bodyTextColor }]}
            >
              PDF Document
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.replaceButton,
              { backgroundColor: theme.colors.secondaryBackgroundColor },
            ]}
            onPress={handleImagePick}
            disabled={uploading || isLoading}
          >
            {uploading || isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryColor} />
            ) : (
              <Text
                style={[
                  styles.replaceText,
                  { color: theme.colors.primaryColor },
                ]}
              >
                Replace document
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadArea,
            {
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderColor: theme.colors.borderColor,
            },
          ]}
          onPress={handleImagePick}
          disabled={uploading || isLoading}
        >
          {uploading || isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primaryColor} />
          ) : (
            <>
              <Text style={[styles.uploadIcon, { color: theme.colors.bodyTextColor }]}>
                📷
              </Text>
              <Text
                style={[
                  styles.uploadText,
                  { color: theme.colors.bodyTextColor },
                ]}
              >
                {fileType === "image" ? "Upload a Picture" : "Upload Document"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  previewContainer: {
    width: "100%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    marginBottom: 16,
  },
  pdfPreview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  pdfIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  pdfText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Medium",
  },
  replaceButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  replaceText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  uploadArea: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Medium",
  },
});


import { docGuide } from "@/assets/images";
import { ThemedBackIcon } from "@/assets/svg/wallet-icons-components";
import ThemedCameraIcon from "@/assets/svg/wallet-icons-components/ThemedCameraIcon";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomButton, CustomText } from "../general";

interface DocumentCapureProps {
  userData?: any;
  onPhotoCaptured?: (photo: any) => void;
  onBack?: () => void;
  fileUploadLoading?: boolean;
}

export default function DocumentCapure({
  userData,
  onPhotoCaptured,
  onBack,
  fileUploadLoading,
}: DocumentCapureProps) {
  const theme = useTheme<Theme>();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageAsset, setCapturedImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "drivers_license":
        return "Driver's License";
      case "national_id":
        return "National ID";
      case "international_passport":
        return "International Passport";
      default:
        return "ID Document";
    }
  };

  const createFormDataFromAsset = (asset: ImagePicker.ImagePickerAsset): FormData => {
    const formData = new FormData();
    
    // Create a file object from the asset
    const file = {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `image_${Date.now()}.jpg`,
    } as any;

    formData.append('file', file);
    
    return formData;
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Camera permission is required to take photos."
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Media library permission is required to select photos."
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCapturedImageAsset(result.assets[0]);
        setShowCamera(false);
        console.log("Image captured:", result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCapturedImageAsset(result.assets[0]);
        console.log("Image uploaded:", result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
    takePhoto();
  };

  const handleUploadPhoto = () => {
    selectFromGallery();
  };

  return (
    <View style={styles.container}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <ThemedBackIcon />
        </Pressable>
      )}

      <CustomText variant="header" style={styles.title}>
        {userData?.documentType
          ? getDocumentTypeLabel(userData.documentType)
          : "National ID"}
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Make sure you take a clear and complete photo of your card
      </CustomText>
      <View
        style={[
          styles.dashedContainer,
          { backgroundColor: theme.colors.bodyTextColorInverse },
        ]}
      >
        {capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            style={styles.capturedImage}
            // resizeMode="contain"
          />
        ) : showCamera ? (
          <View style={styles.cameraPlaceholder}>
            <ThemedCameraIcon width={48} height={48} />
            <CustomText variant="body" style={styles.cameraText}>
              Camera ready
            </CustomText>
          </View>
        ) : (
          <Image
            source={docGuide}
            style={{ height: 110 }}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.consentContainer}>
        <TouchableOpacity
          onPress={() => setIsConsentChecked(!isConsentChecked)}
          style={styles.checkboxContainer}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isConsentChecked
                  ? theme.colors.primaryColor
                  : "transparent",
                borderColor: isConsentChecked
                  ? theme.colors.primaryColor
                  : theme.colors.borderColor,
              },
            ]}
          >
            {isConsentChecked && (
              <CustomText style={styles.checkmark}>✓</CustomText>
            )}
          </View>
        </TouchableOpacity>
        <CustomText style={styles.consentText}>
          I consent to Zap collecting, processing and sharing my information for
          KYC purposes as stated in the{" "}
          <CustomText
            style={[styles.policyLink, { color: theme.colors.primaryColor }]}
          >
            policy
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.buttonContainer}>
        {capturedImage ? (
          <>
            <CustomButton
              text="Submit Document"
              onPress={() => {
                if (capturedImageAsset) {
                  const formData = createFormDataFromAsset(capturedImageAsset);
                  console.log("Submitting document with FormData:", formData);
                  onPhotoCaptured?.(formData);
                }
              }}
              width="100%"
              height={56}
              borderRadius={56}
              bgColor={theme.colors.primaryColor}
              color={theme.colors.white}
              variant="bodySubheader"
              fontSize={14}
              isLoading={fileUploadLoading}
              disabled={!isConsentChecked || fileUploadLoading}
              disabledColor={theme.colors.borderColor}
            />
            <View style={{ marginTop: 12 }}>
              <CustomButton
                text="Retake Photo"
                onPress={() => {
                  setCapturedImage(null);
                  setCapturedImageAsset(null);
                }}
                width="100%"
                height={56}
                borderRadius={56}
                bgColor={theme.colors.mainBackgroundColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={14}
                disabled={fileUploadLoading}
                disabledColor={theme.colors.borderColor}
                borderWidth={1}
                borderColor={theme.colors.borderColor}
              />
            </View>
          </>
        ) : (
          <>
            <CustomButton
              text="Take a photo"
              onPress={handleTakePhoto}
              width="100%"
              height={56}
              borderRadius={56}
              bgColor={theme.colors.primaryColor}
              color={theme.colors.white}
              variant="bodySubheader"
              fontSize={14}
              disabled={!isConsentChecked || fileUploadLoading}
              disabledColor={theme.colors.borderColor}
            />
            <View style={{ marginTop: 12 }}>
              <CustomButton
                text="Upload photo"
                onPress={handleUploadPhoto}
                width="100%"
                height={56}
                borderRadius={56}
                bgColor={theme.colors.mainBackgroundColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={14}
                disabled={!isConsentChecked || fileUploadLoading}
                disabledColor={theme.colors.borderColor}
                borderWidth={1}
                borderColor={theme.colors.borderColor}
              />
            </View>
          </>
        )}
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
    top: -30,
    left: 0,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
    color: "#FFFFFF",
  },
  subtitle: {
    marginBottom: 24,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 16,
    width: SCREEN_WIDTH * 0.75,
  },
  contentContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 0.9,
    justifyContent: "space-between",
  },
  dashedContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.3,
    borderWidth: 1,
    borderColor: "#58585D",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    // position: "absolute",
    // bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
    gap: 16,
  },
  consentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 24,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  policyLink: {
    textDecorationLine: "underline",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  cameraPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  cameraText: {
    marginTop: 8,
    color: "#FFFFFF",
    opacity: 0.8,
  },
});

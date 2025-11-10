import images from "@/assets/images";
import { ThemedBackIcon } from "@/assets/svg/wallet-icons-components";
import ThemedCameraIcon from "@/assets/svg/wallet-icons-components/ThemedCameraIcon";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CustomButton, CustomText } from "../general";

interface DocumentCapureProps {
  userData?: any;
  onPhotoCaptured?: (photo: FormData) => void;
  onBack?: () => void;
  fileUploadLoading?: boolean;
}

export default function DocumentCapure({
  userData,
  onPhotoCaptured,
  onBack,
  fileUploadLoading = false,
}: DocumentCapureProps) {
  const theme = useTheme<Theme>();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageAsset, setCapturedImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const createFormData = (imageUri: string): FormData => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: filename,
      type: type,
    } as any);

    return formData;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCapturedImageAsset(result.assets[0]);
        setShowCamera(false);
        console.log("Image captured:", result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCapturedImageAsset(result.assets[0]);
        console.log("Image uploaded:", result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = () => {
    if (!isConsentChecked) {
      Alert.alert("Consent Required", "Please check the consent box to continue.");
      return;
    }
    setShowCamera(true);
    takePhoto();
  };

  const handleUploadPhoto = () => {
    if (!isConsentChecked) {
      Alert.alert("Consent Required", "Please check the consent box to continue.");
      return;
    }
    selectFromGallery();
  };

  const handleSubmit = () => {
    if (!capturedImage) {
      Alert.alert("No Image", "Please capture or upload an image first.");
      return;
    }

    if (!isConsentChecked) {
      Alert.alert("Consent Required", "Please check the consent box to continue.");
      return;
    }

    try {
      const formData = createFormData(capturedImage);
      onPhotoCaptured?.(formData);
    } catch {
      Alert.alert("Error", "Failed to process image. Please try again.");
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Back Button */}
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <ThemedBackIcon />
          </Pressable>
        )}

        <CustomText variant="header" style={styles.title}>
          {userData?.documentType?.verificationType
            ? getDocumentTypeLabel(userData.documentType.verificationType)
            : "ID Document"}
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
              resizeMode="contain"
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
              source={images.docGuide}
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
          {/* <Image
            source={images.checkTerms}
            style={{ width: 16, height: 20, marginRight: 8 }}
            resizeMode="contain"
          /> */}
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
                onPress={handleSubmit}
                width="100%"
                height={56}
                borderRadius={56}
                bgColor={theme.colors.primaryColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={14}
                disabled={!isConsentChecked || fileUploadLoading}
                disabledColor={theme.colors.borderColor}
                isLoading={fileUploadLoading}
              />
              <View style={{ marginTop: 12 }}>
                <CustomButton
                  text="Retake Photo"
                  onPress={() => {
                    setCapturedImage(null);
                    setShowCamera(false);
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
                disabled={!isConsentChecked || isProcessing}
                disabledColor={theme.colors.borderColor}
                isLoading={isProcessing}
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
                  disabled={!isConsentChecked || isProcessing}
                  disabledColor={theme.colors.borderColor}
                  borderWidth={1}
                  borderColor={theme.colors.borderColor}
                  isLoading={isProcessing}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 180, // Add padding at bottom to prevent buttons from covering content
  },
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    top: -5,
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
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
    marginTop: 24,
    gap: 12,
  },
  consentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 16,
    paddingRight: 0,
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

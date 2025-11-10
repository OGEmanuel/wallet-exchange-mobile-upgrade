import ThemedSuccessIcon from "@/assets/svg/wallet-icons-components/ThemedSuccessIcon";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, StyleSheet, View } from "react-native";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

interface SumsubVerificationProps {
  documentType: CountryVerificationDocumentModel;
  onVerificationComplete?: (result: any) => void;
  onBack?: () => void;
}

export default function SumsubVerification({
  documentType,
  onVerificationComplete,
  onBack,
}: SumsubVerificationProps) {
  const theme = useTheme<Theme>();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  // Animation refs for success screen
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize Sumsub SDK
  useEffect(() => {
    if (documentType?.isExternal?.token && !isInitialized) {
      initializeSumsub();
    }
  }, [documentType?.isExternal?.token, isInitialized]);

  const initializeSumsub = async () => {
    if (!documentType?.isExternal?.token) {
      setError("Sumsub token is not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dynamic import of Sumsub SDK
      // Note: Make sure @sumsub/react-native-mobilesdk-module is installed
      // npm install @sumsub/react-native-mobilesdk-module
      const SumsubSDK = require("@sumsub/react-native-mobilesdk-module");

      // Initialize Sumsub SDK with the token from backend
      const initResult = await SumsubSDK.init({
        accessToken: documentType.isExternal.token,
        // Optional: Configure applicant info if available
        // applicantConf: {
        //   email: user?.email,
        //   phone: user?.phone,
        // },
        // Optional: Set preferred document type
        preferredDocumentDefinitions: {
          IDENTITY: {
            idDocType: documentType.verificationType?.toUpperCase() || "PASSPORT",
            // country: selectedCountry?.name,
          },
        },
      });

      if (initResult?.success !== false) {
        setIsInitialized(true);
        setIsLoading(false);
      } else {
        throw new Error(initResult?.error || "Failed to initialize Sumsub SDK");
      }
    } catch (err: any) {
      console.error("Sumsub initialization error:", err);
      
      // Check if module is not installed
      if (err?.code === "MODULE_NOT_FOUND" || err?.message?.includes("Cannot find module")) {
        setError("Sumsub SDK is not installed. Please install @sumsub/react-native-mobilesdk-module");
      } else {
        setError(err?.message || "Failed to initialize Sumsub verification");
      }
      setIsLoading(false);
    }
  };

  const startVerification = async () => {
    if (!isInitialized) {
      Alert.alert("Error", "Sumsub SDK is not initialized. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dynamic import of Sumsub SDK
      const SumsubSDK = require("@sumsub/react-native-mobilesdk-module");

      // Start the verification flow
      // This will open Sumsub's native verification UI
      const result = await SumsubSDK.startVerification();

      // Handle verification result
      // The result object contains verification status and details
      if (result?.status === "approved" || result?.status === "pending") {
        setVerificationResult(result);
        setVerificationStatus(result.status);
        
        // Animate success screen
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (result?.status === "rejected") {
        setError("Verification was rejected. Please try again.");
        setVerificationStatus("rejected");
      } else if (result?.action === "close") {
        // User closed the verification flow
        setVerificationStatus(null);
        setIsLoading(false);
      } else {
        // Handle other statuses
        setVerificationResult(result);
        setVerificationStatus(result?.status || "unknown");
      }
    } catch (err: any) {
      console.error("Sumsub verification error:", err);
      
      // Handle specific error cases
      if (err?.code === "USER_CANCELLED" || err?.action === "close") {
        setVerificationStatus(null);
        setIsLoading(false);
        return;
      }
      
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setVerificationStatus(null);
    setVerificationResult(null);
    setIsInitialized(false);
    // Reset animations
    scaleAnim.setValue(0.5);
    opacityAnim.setValue(0);
    slideAnim.setValue(50);
    initializeSumsub();
  };

  const handleContinue = () => {
    if (verificationResult && onVerificationComplete) {
      onVerificationComplete(verificationResult);
    }
  };

  return (
    <Box flex={1} style={styles.container}>
      <View style={styles.content}>
        {isLoading && !isInitialized ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryColor} />
            <CustomText variant="body" style={styles.loadingText}>
              Initializing verification...
            </CustomText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <CustomText variant="header" style={styles.errorTitle}>
              Verification Error
            </CustomText>
            <CustomText variant="body" style={styles.errorText}>
              {error}
            </CustomText>
            <View style={styles.buttonRow}>
              {onBack && (
                <CustomButton
                  text="Go Back"
                  onPress={onBack}
                  width="48%"
                  height={56}
                  borderRadius={56}
                  bgColor={theme.colors.secondaryBackgroundColor}
                  color={theme.colors.bodyTextColor}
                  variant="bodySubheader"
                  fontSize={16}
                />
              )}
              <CustomButton
                text="Retry"
                onPress={handleRetry}
                width={onBack ? "48%" : "100%"}
                height={56}
                borderRadius={56}
                bgColor={theme.colors.primaryColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={16}
              />
            </View>
          </View>
        ) : (verificationStatus === "approved" || verificationStatus === "pending") ? (
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <ThemedSuccessIcon width={120} height={120} />
            </Animated.View>

            {/* Success Title */}
            <CustomText variant="header" style={styles.successTitle}>
              {verificationStatus === "approved" ? "Verification Complete!" : "Verification Submitted"}
            </CustomText>

            {/* Success Message */}
            <CustomText variant="body" style={styles.successMessage}>
              {verificationStatus === "approved"
                ? "Your identity has been successfully verified. You can now proceed with your transactions."
                : "Your verification has been submitted and is pending review. We'll notify you once it's approved."}
            </CustomText>

            {/* Completion Date */}
            <CustomText variant="body" style={styles.completionDate}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </CustomText>

            {/* Continue Button */}
            <View style={styles.successButtonContainer}>
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
              />
            </View>
          </Animated.View>
        ) : verificationStatus === "rejected" ? (
          <View style={styles.errorContainer}>
            <CustomText variant="header" style={styles.errorTitle}>
              Verification Rejected
            </CustomText>
            <CustomText variant="body" style={styles.errorText}>
              Your verification was rejected. Please ensure all documents are clear and valid.
            </CustomText>
            <View style={styles.buttonRow}>
              {onBack && (
                <CustomButton
                  text="Go Back"
                  onPress={onBack}
                  width="48%"
                  height={56}
                  borderRadius={56}
                  bgColor={theme.colors.secondaryBackgroundColor}
                  color={theme.colors.bodyTextColor}
                  variant="bodySubheader"
                  fontSize={16}
                />
              )}
              <CustomButton
                text="Try Again"
                onPress={handleRetry}
                width={onBack ? "48%" : "100%"}
                height={56}
                borderRadius={56}
                bgColor={theme.colors.primaryColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={16}
              />
            </View>
          </View>
        ) : (
          <View style={styles.initialContainer}>
            <CustomText variant="header" style={styles.title}>
              Identity Verification
            </CustomText>
            <CustomText variant="body" style={styles.subtitle}>
              We&apos;ll guide you through a secure identity verification process. Make sure you
              have a valid government-issued ID ready.
            </CustomText>

            <View style={styles.infoBox}>
              <CustomText variant="body" style={styles.infoText}>
                • You&apos;ll need a valid government-issued ID
              </CustomText>
              <CustomText variant="body" style={styles.infoText}>
                • Ensure good lighting and clear photos
              </CustomText>
              <CustomText variant="body" style={styles.infoText}>
                • The process takes about 2-3 minutes
              </CustomText>
            </View>

            <View style={styles.buttonContainer}>
              {onBack && (
                <CustomButton
                  text="Back"
                  onPress={onBack}
                  width="48%"
                  height={56}
                  borderRadius={56}
                  bgColor={theme.colors.secondaryBackgroundColor}
                  color={theme.colors.bodyTextColor}
                  variant="bodySubheader"
                  fontSize={16}
                />
              )}
              <CustomButton
                text="Start Verification"
                onPress={startVerification}
                width={onBack ? "48%" : "100%"}
                height={56}
                borderRadius={56}
                bgColor={theme.colors.primaryColor}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={16}
                isLoading={isLoading}
                disabled={isLoading || !isInitialized}
                disabledColor={theme.colors.borderColor}
              />
            </View>
          </View>
        )}
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initialContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    width: "100%",
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  successIconContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  completionDate: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 40,
  },
  successButtonContainer: {
    width: "100%",
    marginTop: 24,
  },
});


import CodeInput from "@/components/form/CodeInput";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Copy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Switch } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface TwoFactorAuthBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onClose?: () => void;
}

type TwoFAScreen = "toggle" | "setup" | "verify" | "disable";

const TwoFactorAuthBottomSheet: React.FC<TwoFactorAuthBottomSheetProps> = ({
  bottomSheetRef,
  onClose,
}) => {
  const theme = useTheme<Theme>();
  const { exchangeUserData } = useExchangeAuth();
  const { setExchangeUserData } = useWallet();
  const { fetchUserById } = useKyc();
  const [currentScreen, setCurrentScreen] = useState<TwoFAScreen>("toggle");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab bar height: 90 on iOS, 70 on Android
  const tabBarHeight = Platform.OS === "ios" ? 90 : 70;
  const bottomInset = tabBarHeight;

  const snapPoints = useMemo(() => ["95%"], []);

  // Track if we've already checked to prevent loops
  const hasCheckedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Store exchangeUserData in a ref to access it without causing re-renders
  const exchangeUserDataRef = useRef(exchangeUserData);
  useEffect(() => {
    exchangeUserDataRef.current = exchangeUserData;
  }, [exchangeUserData]);

  // Check 2FA status function - fetches latest user data and uses user object data
  const check2FAStatus = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (hasCheckedRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      hasCheckedRef.current = true;
      
      const currentUserData = exchangeUserDataRef.current;
      const currentUserId = currentUserData?._id;
      
      // Use fetchUserById which uses users.getProfile and should include all fields including 2FA
      if (currentUserId) {
        const response = await fetchUserById(currentUserData);
        
        if (response?.data) {
          // Only update if user ID changed to prevent loops
          if (userIdRef.current !== response.data._id && response.data._id) {
            userIdRef.current = response.data._id || null;
            setExchangeUserData(response.data);
          }
          
          // Check user data for 2FA status - check all possible field names
          const userHas2FA = 
            response.data.isTwoFAenabled || 
            response.data.twoFA || 
            (response.data as any)?.is2FAEnabled ||
            (response.data as any)?.is2FA ||
            false;
          
          console.log("🔍 2FA Status Check (with fresh data from fetchUserById):", {
            exchangeUserData: {
              _id: response.data._id,
              isTwoFAenabled: response.data.isTwoFAenabled,
              twoFA: response.data.twoFA,
              is2FAEnabled: (response.data as any)?.is2FAEnabled,
              is2FA: (response.data as any)?.is2FA,
            },
            userHas2FA,
            allKeys: Object.keys(response.data), // Log all keys to see what's available
          });
          
          setIs2FAEnabled(userHas2FA);
        } else {
          // Fall back to existing user data if fetch fails
          const userHas2FA = currentUserData?.isTwoFAenabled || currentUserData?.twoFA || false;
          setIs2FAEnabled(userHas2FA);
        }
      } else {
        // No user ID available, use existing data
        const userHas2FA = currentUserData?.isTwoFAenabled || currentUserData?.twoFA || false;
        setIs2FAEnabled(userHas2FA);
      }
    } catch (error) {
      console.error("Failed to fetch latest user data:", error);
      // Fall back to existing user data on error
      const currentUserData = exchangeUserDataRef.current;
      const userHas2FA = currentUserData?.isTwoFAenabled || currentUserData?.twoFA || false;
      setIs2FAEnabled(userHas2FA);
    } finally {
      setIsLoading(false);
      // Reset the check flag after a delay to allow re-checking if needed
      setTimeout(() => {
        hasCheckedRef.current = false;
      }, 1000);
    }
  }, [fetchUserById, setExchangeUserData]); // Removed exchangeUserData from deps to prevent loop

  // Check 2FA status on mount and when user ID changes
  useEffect(() => {
    const currentUserId = exchangeUserData?._id;
    if (currentUserId && userIdRef.current !== currentUserId) {
      userIdRef.current = currentUserId;
      check2FAStatus();
    } else if (!currentUserId) {
      // If no user ID, just check from existing data
      const userHas2FA = exchangeUserData?.isTwoFAenabled || exchangeUserData?.twoFA || false;
      setIs2FAEnabled(userHas2FA);
    }
  }, [exchangeUserData?._id, check2FAStatus, exchangeUserData]);

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if 2FA is already enabled from user data
      const userHas2FA = exchangeUserData?.isTwoFAenabled || exchangeUserData?.twoFA || false;
      
      console.log("🔍 Attempting to enable 2FA - Current state:", {
        exchangeUserData: exchangeUserData ? {
          _id: exchangeUserData._id,
          isTwoFAenabled: exchangeUserData.isTwoFAenabled,
          twoFA: exchangeUserData.twoFA,
        } : null,
        userHas2FA,
        is2FAEnabled,
        willPrevent: userHas2FA || is2FAEnabled,
      });
      
      if (userHas2FA || is2FAEnabled) {
        Alert.alert(
          "2FA Already Enabled",
          "Two-factor authentication is already enabled for your account. If you need to reset it, please disable it first.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }
      
      const result = await zapSDKService.enableTwoFa({
        userId: exchangeUserData?._id || "",
      });

      console.log("2FA generate result:", result);

      // Handle different response structures
      const secretValue = result?.secret || result?.data?.secret;
      const qrCodeValue = result?.secretQrCode || result?.qrCode || result?.data?.secretQrCode || result?.data?.qrCode;

      if (result && secretValue && qrCodeValue) {
        setSecret(secretValue);
        setQrCodeData(qrCodeValue);
        setCurrentScreen("setup");
      } else {
        console.error("Invalid 2FA response structure:", result);
        Alert.alert("Error", "Failed to generate 2FA setup. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to enable 2FA:", err);
      
      // Check if it's a validation error (likely means 2FA is already enabled)
      const isValidationError = err?.response?.status === 400 || 
                                err?.status === 400 ||
                                (err?.message && err.message.includes('Validation failed'));
      
      if (isValidationError) {
        Alert.alert(
          "2FA Already Enabled",
          "Two-factor authentication is already enabled for your account. Please disable it first if you need to reset it.",
          [{ text: "OK" }]
        );
        // Update the state to reflect that 2FA is enabled
        setIs2FAEnabled(true);
      } else {
        setError("Failed to enable 2FA. Please try again.");
        Alert.alert("Error", "Failed to enable 2FA. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (secret) {
      try {
        await Clipboard.setStringAsync(secret);
        Alert.alert("Copied", "Secret code copied to clipboard");
      } catch {
        Alert.alert("Error", "Failed to copy secret code");
      }
    }
  };

  const handleCodeComplete = async (code: string) => {
    if (code.length === 6) {
      await handleVerifyCode(code);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!secret || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      const result = await zapSDKService.verifyTwoFa({
        code,
        secret,
      });

      console.log("2FA verify result:", result);

      // Handle different response structures
      // SDK returns { verified: boolean } or the full API response
      const isVerified = 
        result?.verified === true || 
        (result && typeof result === 'object' && 'success' in result && (result as any).success === true) ||
        (result && typeof result === 'object' && 'data' in result && (result as any).data?.userId?.isTwoFAenabled === true);

      if (isVerified) {
        // Update local state immediately
        setIs2FAEnabled(true);
        
        // Refresh user data to get latest 2FA status
        await check2FAStatus();
        
        Alert.alert("Success", "Two-factor authentication has been enabled", [
          {
            text: "OK",
            onPress: () => {
              setCurrentScreen("toggle");
              setSecret("");
              setQrCodeData(null);
              setVerificationCode("");
              setError(null);
            },
          },
        ]);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to verify 2FA code:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Invalid code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = () => {
    Alert.alert(
      "Disable 2FA",
      "You'll need to enter a verification code to disable two-factor authentication.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            setCurrentScreen("disable");
            setVerificationCode("");
            setError(null);
          },
        },
      ]
    );
  };

  const handleDisableWithCode = async (code: string) => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      const result = await zapSDKService.disableTwoFa({ code });

      console.log("2FA disable result:", result);

      // SDK returns boolean or the full API response
      const isDisabled = 
        result === true || 
        (result && typeof result === 'object' && 'success' in result && (result as any).success === true);

      if (isDisabled) {
        // Update local state immediately
        setIs2FAEnabled(false);
        
        // Refresh user data to get latest 2FA status
        await check2FAStatus();
        
        Alert.alert("Success", "Two-factor authentication has been disabled", [
          {
            text: "OK",
            onPress: () => {
              setCurrentScreen("toggle");
              setVerificationCode("");
              setError(null);
            },
          },
        ]);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to disable 2FA:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Invalid code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleChange = (value: boolean) => {
    if (value) {
      handleEnable2FA();
    } else {
      handleDisable2FA();
    }
  };

  const handleBack = () => {
    if (currentScreen === "setup" || currentScreen === "disable") {
      setCurrentScreen("toggle");
      setSecret("");
      setQrCodeData(null);
      setVerificationCode("");
      setError(null);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderToggleScreen = () => (
    <BottomSheetView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.mainBackgroundColor,
        },
      ]}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="l"
      >
        <CustomText variant="header" fontSize={20} color="headerTextColor">
          Two Factor Authentication
        </CustomText>
        <Pressable
          onPress={() => {
            bottomSheetRef.current?.close();
            onClose?.();
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            padding: 8,
          })}
        >
          <X size={24} color={theme.colors.headerTextColor} />
        </Pressable>
      </Box>

      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="m"
      >
        <Box flex={1}>
          <CustomText variant="bodyBold" fontSize={16} color="headerTextColor" marginBottom="s">
            Enable 2FA
          </CustomText>
          <CustomText variant="body" fontSize={14} color="bodyTextColor">
            Use a mobile authentication app to get an auth code to log in every time you sign in to Zap
          </CustomText>
        </Box>
        <Switch
          value={is2FAEnabled}
          onValueChange={handleToggleChange}
          disabled={isLoading}
          trackColor={{
            false: theme.colors.secondaryBackgroundColor,
            true: theme.colors.secondaryColor,
          }}
          thumbColor={is2FAEnabled ? theme.colors.white : theme.colors.bodyTextColor}
        />
      </Box>
    </BottomSheetView>
  );

  const renderSetupScreen = () => (
    <BottomSheetScrollView
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="l"
      >
        <Pressable onPress={handleBack} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          
        </Pressable>
        <CustomText variant="header" fontSize={20} color="headerTextColor">
          Two Factor Authentication
        </CustomText>
        <Box width={24} />
      </Box>

      <CustomText
        variant="body"
        fontSize={14}
        color="bodyTextColor"
        textAlign="center"
        marginBottom="l"
      >
        Scan the QR code below with the Authenticator app on your phone. If you can&apos;t scan, copy and paste the code.
      </CustomText>

      {/* QR Code */}
      {qrCodeData && (
        <Box
          alignItems="center"
          justifyContent="center"
          backgroundColor="white"
          borderRadius={16}
          padding="m"
          marginBottom="l"
        >
          {qrCodeData.startsWith("data:image") ? (
            <Image
              source={{ uri: qrCodeData }}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          ) : (
            <QRCode value={qrCodeData} size={200} color="black" backgroundColor="white" />
          )}
        </Box>
      )}

      {/* Secret Code with Copy */}
      {secret && (
        <Box marginBottom="l">
          <Pressable
            onPress={handleCopySecret}
            style={({ pressed }) => [
              styles.copyButton,
              {
                backgroundColor: theme.colors.secondaryBackgroundColor,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <CustomText variant="body" fontSize={14} color="bodyTextColor" marginRight="s">
              Click to copy
            </CustomText>
            <Copy size={16} color={theme.colors.bodyTextColor} />
          </Pressable>
        </Box>
      )}

      {/* Code Input */}
      <Box marginBottom="l">
        <CustomText
          variant="body"
          fontSize={14}
          color="bodyTextColor"
          marginBottom="m"
        >
          Enter the 6-digit code from the app
        </CustomText>
        <CodeInput
          length={6}
          onCodeChange={(code) => setVerificationCode(code)}
          onCodeComplete={handleCodeComplete}
          autoFocus={true}
          disabled={isVerifying}
          error={!!error}
        />
        {error && (
          <Box marginTop="s">
            <CustomText color="error" variant="body" textAlign="center">
              {error}
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Enable Button */}
      <CustomButton
        text="Enable 2FA"
        onPress={() => verificationCode.length === 6 && handleVerifyCode(verificationCode)}
        disabled={verificationCode.length !== 6 || isVerifying}
        isLoading={isVerifying}
        width="100%"
        borderRadius={50}
        bgColor="primaryColor"
      />
    </BottomSheetScrollView>
  );

  const renderDisableScreen = () => (
    <BottomSheetScrollView
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="l"
      >
        <Pressable onPress={handleBack} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <X size={24} color={theme.colors.headerTextColor} />
        </Pressable>
        <CustomText variant="header" fontSize={20} color="headerTextColor">
          Disable 2FA
        </CustomText>
        <Box width={24} />
      </Box>

      <CustomText
        variant="body"
        fontSize={14}
        color="bodyTextColor"
        textAlign="center"
        marginBottom="l"
      >
        Enter the 6-digit code from your authenticator app to disable two-factor authentication.
      </CustomText>

      {/* Code Input */}
      <Box marginBottom="l">
        <CustomText
          variant="body"
          fontSize={14}
          color="bodyTextColor"
          marginBottom="m"
        >
          Enter the 6-digit code from the app
        </CustomText>
        <CodeInput
          length={6}
          onCodeChange={(code) => setVerificationCode(code)}
          onCodeComplete={(code) => handleDisableWithCode(code)}
          autoFocus={true}
          disabled={isVerifying}
          error={!!error}
        />
        {error && (
          <Box marginTop="s">
            <CustomText color="error" variant="body" textAlign="center">
              {error}
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Disable Button */}
      <CustomButton
        text="Disable 2FA"
        onPress={() => verificationCode.length === 6 && handleDisableWithCode(verificationCode)}
        disabled={verificationCode.length !== 6 || isVerifying}
        isLoading={isVerifying}
        width="100%"
        borderRadius={50}
        bgColor="error"
      />
    </BottomSheetScrollView>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableOverDrag={false}
      enableDynamicSizing={false}
      bottomInset={bottomInset}
      backdropComponent={renderBackdrop}
      style={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.borderColor,
        width: 32,
      }}
      onChange={(index) => {
        // When sheet opens (index >= 0), refresh 2FA status
        if (index >= 0) {
          check2FAStatus();
        }
      }}
      onClose={() => {
        setCurrentScreen("toggle");
        setSecret("");
        setQrCodeData(null);
        setVerificationCode("");
        setError(null);
        check2FAStatus(); // Refresh status when closing
        onClose?.();
      }}
    >
      {currentScreen === "toggle"
        ? renderToggleScreen()
        : currentScreen === "setup"
        ? renderSetupScreen()
        : renderDisableScreen()}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

export default TwoFactorAuthBottomSheet;


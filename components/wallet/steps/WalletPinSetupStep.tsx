import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import NumericKeypad from "@/components/general/NumericKeypad";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WalletPinSetupStepProps {
  walletData?: WalletFlowData;
  isLoading?: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletPinSetupStep: React.FC<WalletPinSetupStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pinError, setPinError] = useState("");
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const borderAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const isValidPin = pin.length === 4;

  useEffect(() => {
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnimation]);

  // Animate border color for each individual field
  useEffect(() => {
    const currentPin = showConfirm ? confirmPin : pin;

    borderAnimations.forEach((animation, index) => {
      if (index < currentPin.length) {
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [pin, confirmPin, showConfirm, borderAnimations]);

  const handleContinue = async (currentConfirmPin?: string) => {
    Keyboard.dismiss();

    // If we're not in confirm mode yet, just advance to confirm
    if (!showConfirm) {
      if (!isValidPin) {
        setPinError("PIN must be 4 digits");
        return;
      }
      setShowConfirm(true);
      setPinError("");
      return;
    }

    // If we're in confirm mode, check if PINs match
    const actualConfirmPin = currentConfirmPin || confirmPin;
    const doPinsMatch =
      pin === actualConfirmPin && actualConfirmPin.length === 4;

    if (!doPinsMatch) {
      setPinError("PINs do not match. Please try again.");
      // Clear the confirm PIN so user has to re-enter it
      setConfirmPin("");
      return;
    }

    // Store PIN securely
    try {
      const success = await pinStorageService.storePin(pin);
      if (success) {
        onUpdateData({ passcode: pin });
        onContinue();
      } else {
        setPinError("Failed to store PIN. Please try again.");
      }
    } catch (error) {
      console.error("❌ Failed to store PIN:", error);
      setPinError("Failed to store PIN. Please try again.");
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === ".") return; // Ignore dot key

    const currentPin = showConfirm ? confirmPin : pin;

    if (currentPin.length < 4) {
      const newPin = currentPin + key;

      if (showConfirm) {
        setConfirmPin(newPin);
        // Auto-continue when confirm PIN is complete
        if (newPin.length === 4) {
          // Use setTimeout to ensure state update is processed before validation
          setTimeout(() => {
          handleContinue(newPin);
          }, 100);
          return;
        }
      } else {
        setPin(newPin);
        // Auto-advance to confirm when PIN is complete
        if (newPin.length === 4) {
          setTimeout(() => {
            setShowConfirm(true);
          }, 300);
        }
      }
      setPinError("");
    }
  };

  const handleBackspace = () => {
    const currentPin = showConfirm ? confirmPin : pin;
    if (currentPin.length > 0) {
      const newPin = currentPin.slice(0, -1);
      if (showConfirm) {
        setConfirmPin(newPin);
      } else {
        setPin(newPin);
      }
      setPinError("");
    }
  };

  const handleBack = () => {
    if (showConfirm) {
      setShowConfirm(false);
      setConfirmPin("");
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          height={70}
          leading={
            <Pressable onPress={handleBack} style={{ padding: 8 }}>
              <ChevronLeft size={24} color={theme.colors.white} />
            </Pressable>
          }
        />
      </Box>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={{ flex: 1, opacity: fadeInAnimation }}>
          <Box flex={1} paddingHorizontal="l" paddingTop="l">
            {/* Top Content */}
            <Box alignItems="center" mb="xl">
              <CustomText
                variant="medium"
                fontSize={28}
                mb="m"
                color="white"
                textAlign="center"
              >
                {showConfirm ? "Confirm Passcode" : "Create Passcode"}
              </CustomText>

              <CustomText
                variant="body"
                fontSize={16}
                mb="2xl"
                color="bodyTextColor"
                textAlign="center"
              >
                {showConfirm
                  ? "Please confirm your passcode to continue"
                  : "You will use this to unlock your app. This cannot be used to restore your wallet"}
              </CustomText>

              {/* PIN Input Fields */}
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                mt="l"
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      width: 50,
                      height: 60,
                      borderRadius: 8,
                      backgroundColor: theme.colors.secondaryBackgroundColor,
                      marginHorizontal: theme.spacing.s,
                      borderWidth: 1,
                      borderColor: pinError
                        ? theme.colors.error
                        : borderAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              theme.colors.borderColor,
                              theme.colors.secondaryColor,
                            ],
                          }),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {(showConfirm ? confirmPin : pin).length > index && (
                      <Box
                        width={8}
                        height={8}
                        borderRadius={4}
                        backgroundColor="white"
                      />
                    )}
                  </Animated.View>
                ))}
              </Box>

              {/* Error Display */}
              {pinError && (
                <Box
                  backgroundColor="error"
                  borderRadius={8}
                  padding="s"
                  mt="l"
                  mb="l"
                  borderWidth={1}
                  borderColor="error"
                >
                  <CustomText
                    variant="body"
                    fontSize={12}
                    color="white"
                    textAlign="center"
                  >
                    ⚠️ {pinError}
                  </CustomText>
                </Box>
              )}
            </Box>
          </Box>
          <Box paddingHorizontal="l" paddingBottom="3xl">
            <NumericKeypad
              onPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </Box>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Box>
  );
};

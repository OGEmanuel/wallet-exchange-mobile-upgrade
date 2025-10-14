import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import NumericKeypad from "@/components/general/NumericKeypad";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WalletPinEntryStepProps {
  onSuccess: (pin: string) => void;
  onBack?: () => void;
}

export const WalletPinEntryStep: React.FC<WalletPinEntryStepProps> = ({
  onSuccess,
  onBack,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const borderAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const errorAnimation = useRef(new Animated.Value(0)).current;

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
    borderAnimations.forEach((animation, index) => {
      if (index < pin.length) {
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
  }, [pin, borderAnimations]);

  const showError = () => {
    Animated.timing(errorAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideError = () => {
    Animated.timing(errorAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleVerifyPin = useCallback(
    async (pinToVerify: string) => {
      console.log(
        "🔍 Verifying PIN:",
        pinToVerify,
        "Length:",
        pinToVerify.length
      );

      // Double-check we have exactly 4 digits
      if (pinToVerify.length !== 4) {
        console.log("❌ PIN length is not 4, skipping verification");
        return;
      }

      try {
        setIsVerifying(true);
        setPinError("");
        hideError();

        console.log(
          "🔍 Calling pinStorageService.verifyPin with:",
          pinToVerify
        );
        const isValid = await pinStorageService.verifyPin(pinToVerify);
        console.log("🔍 PIN verification result:", isValid);

        if (isValid) {
          console.log("✅ PIN verified successfully");
          onSuccess(pinToVerify);
        } else {
          console.log("❌ PIN verification failed");
          setPinError("Incorrect PIN. Please try again.");
          showError();
          setPin(""); // Clear PIN on error
        }
      } catch (error) {
        console.error("❌ Failed to verify PIN:", error);
        setPinError("Failed to verify PIN. Please try again.");
        showError();
        setPin(""); // Clear PIN on error
      } finally {
        setIsVerifying(false);
      }
    },
    [onSuccess]
  );

  const handleKeyPress = (key: string) => {
    if (key === ".") return; // Ignore dot key

    if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      setPinError(""); // Clear error when typing
      hideError();

      // Only auto-verify when we have exactly 4 digits
      if (newPin.length === 4) {
        console.log("🔍 PIN is complete, starting verification:", newPin);
        // Auto-verify when PIN is complete - pass the PIN value directly
        setTimeout(() => {
          handleVerifyPin(newPin);
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setPinError(""); // Clear error when typing
      hideError();
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          height={70}
          leading={
            onBack && (
              <Pressable onPress={onBack} style={{ padding: 8 }}>
                <ChevronLeft size={24} color={theme.colors.white} />
              </Pressable>
            )
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
                Enter Passcode
              </CustomText>

              <CustomText
                variant="body"
                fontSize={16}
                mb="2xl"
                color="bodyTextColor"
                textAlign="center"
              >
                Enter your PIN to unlock your wallet
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
                    {pin.length > index && (
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
                <Animated.View
                  style={{
                    opacity: errorAnimation,
                    transform: [
                      {
                        translateY: errorAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <Box
                    backgroundColor="error"
                    borderRadius={8}
                    padding="s"
                    mb="l"
                    borderWidth={1}
                    borderColor="error"
                    mt="l"
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
                </Animated.View>
              )}
            </Box>
          </Box>
          <Box paddingHorizontal="l" paddingBottom="3xl">
            <NumericKeypad
              onPress={handleKeyPress}
              onBackspace={handleBackspace}
              disabled={isVerifying}
            />
          </Box>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Box>
  );
};

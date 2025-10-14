import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Lock, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";

interface PinModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  onForgotPin?: () => void;
  title?: string;
  subtitle?: string;
}

const PinModal: React.FC<PinModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
  onForgotPin,
  title = "Enter your PIN",
  subtitle = "Enter your PIN to continue",
}) => {
  const theme = useTheme<Theme>();
  const [pin, setPin] = useState("");
  const [focused, setFocused] = useState(false);
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const isValidPin = pin.length >= 4 && pin.length <= 6;
  const maxAttempts = 3;

  useEffect(() => {
    if (isVisible) {
      setPin("");
      setPinError("");
      setAttempts(0);
      setFocused(false);

      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnimation, fadeAnimation]);

  const handlePinChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "");
    setPin(numericValue);
    setPinError("");

    // Auto-submit when PIN is complete
    if (numericValue.length >= 4) {
      handleSubmit(numericValue);
    }
  };

  const handleSubmit = async (enteredPin?: string) => {
    const pinToCheck = enteredPin || pin;

    if (!pinToCheck || pinToCheck.length < 4) {
      setPinError("Please enter a valid PIN");
      return;
    }

    try {
      // In a real app, you would verify the PIN against stored data
      const isValid = await verifyPin(pinToCheck);

      if (isValid) {
        setPinError("");
        onSuccess(pinToCheck);
        onClose();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          setPinError("Too many failed attempts. Please try again later.");
        } else {
          setPinError(
            `Invalid PIN. ${maxAttempts - newAttempts} attempts remaining.`
          );
        }
        setPin("");
      }
    } catch (error) {
      setPinError("Failed to verify PIN. Please try again.");
    }
  };

  const verifyPin = async (pinToCheck: string): Promise<boolean> => {
    // Simulate PIN verification
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 4+ digit PIN
        resolve(pinToCheck.length >= 4);
      }, 500);
    });
  };

  const handleClose = () => {
    setPin("");
    setPinError("");
    setAttempts(0);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: fadeAnimation,
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="l"
          >
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              }}
            >
              <Box
                backgroundColor="mainBackgroundColor"
                borderRadius={20}
                padding="xl"
                width="100%"
                maxWidth={400}
                borderWidth={1}
                borderColor="borderColor"
              >
                {/* Header */}
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="l"
                >
                  <Box flex={1} />
                  <CustomText
                    variant="medium"
                    fontSize={18}
                    color="white"
                    textAlign="center"
                    flex={2}
                  >
                    {title}
                  </CustomText>
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => ({
                      padding: 8,
                      borderRadius: 20,
                      opacity: pressed ? 0.5 : 1,
                    })}
                  >
                    <X size={24} color={theme.colors.bodyTextColor} />
                  </Pressable>
                </Box>

                {/* Lock Icon */}
                <Box alignItems="center" mb="l">
                  <Box
                    width={60}
                    height={60}
                    borderRadius={30}
                    backgroundColor="secondaryBackgroundColor"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Lock size={30} color={theme.colors.primaryColor} />
                  </Box>
                </Box>

                <CustomText
                  variant="body"
                  fontSize={14}
                  mb="2xl"
                  color="bodyTextColor"
                  textAlign="center"
                >
                  {subtitle}
                </CustomText>

                {/* PIN Input */}
                <Box
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={12}
                  padding="l"
                  mb="l"
                  borderWidth={focused ? 1 : 0}
                  borderColor={
                    focused ? "primaryColor" : "secondaryBackgroundColor"
                  }
                >
                  <CustomText
                    variant="medium"
                    fontSize={16}
                    color="white"
                    mb="s"
                  >
                    PIN
                  </CustomText>

                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={50}
                  >
                    {Array.from({ length: 6 }, (_, index) => (
                      <Box
                        key={index}
                        width={10}
                        height={10}
                        borderRadius={5}
                        backgroundColor={
                          pin.length > index ? "primaryColor" : "borderColor"
                        }
                      />
                    ))}
                  </Box>
                </Box>

                {/* Hidden input for PIN entry */}
                <Box position="absolute" left={-1000} top={-1000}>
                  <CustomInputWithoutForm
                    value={pin}
                    onChange={handlePinChange}
                    placeholder=""
                    focusable
                    keyboardType="numeric"
                    maxLength={6}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{ opacity: 0 }}
                  />
                </Box>

                {/* Error Display */}
                {pinError && (
                  <Box
                    backgroundColor="error"
                    borderRadius={8}
                    padding="s"
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

                {/* Forgot PIN Button */}
                {onForgotPin && (
                  <Box alignItems="center" mb="l">
                    <Pressable
                      onPress={onForgotPin}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                      })}
                    >
                      <CustomText
                        variant="body"
                        fontSize={14}
                        color="primaryColor"
                      >
                        Forgot your PIN?
                      </CustomText>
                    </Pressable>
                  </Box>
                )}
              </Box>
            </Animated.View>
          </Box>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
};

export default PinModal;

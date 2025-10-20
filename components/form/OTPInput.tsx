import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { CustomText } from "../general";
import Box from "../general/Box";

interface OTPInputProps {
  length?: number;
  onCodeChange?: (code: string) => void;
  onCodeComplete?: (code: string) => void;
  onResend?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  resendTimer?: number;
  showResend?: boolean;
  resendText?: string;
  instructionText?: string;
  phoneNumber?: string;
  textAlign?: "center" | "left" | "right";
}

export default function OTPInput({
  length = 6,
  onCodeChange,
  onCodeComplete,
  onResend,
  autoFocus = true,
  disabled = false,
  error = false,
  errorText,
  resendTimer = 0,
  showResend = true,
  resendText = "Didn't receive a code?",
  instructionText,
  phoneNumber,
  textAlign = "center",
}: OTPInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<TextInput[]>([]);
  const theme = useTheme<Theme>();

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleCodeChange = (value: string, index: number) => {
    if (disabled) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    const codeString = newCode.join("");
    onCodeChange?.(codeString);

    if (value && index < length - 1) {
      // Move to next input
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (value && index === length - 1) {
      // Code is complete
      if (codeString.length === length) {
        onCodeComplete?.(codeString);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handlePress = (index: number) => {
    if (disabled) return;
    inputRefs.current[index]?.focus();
    setFocusedIndex(index);
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      onResend?.();
    }
  };

  return (
    <View>
      {/* Instruction text */}
      {instructionText && (
        <CustomText
          variant="body"
          fontSize={16}
          color="placeholderTextColor"
          textAlign={textAlign}
          lineHeight={22}
        >
          {instructionText}
        </CustomText>
      )}

      {/* Phone number display */}
      {phoneNumber && (
        <CustomText
          variant="body"
          fontSize={16}
          color="bodyTextColor"
          textAlign={textAlign}
          lineHeight={22}
          marginBottom="l"
        >
          {phoneNumber}
        </CustomText>
      )}

      {/* OTP Input Fields */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        marginVertical="m"
      >
        {code.map((digit, index) => (
          <Pressable
            key={index}
            style={[
              styles.input,
              {
                borderColor: error
                  ? theme.colors.error
                  : focusedIndex === index
                  ? theme.colors.primaryColor
                  : digit
                  ? theme.colors.primaryColor
                  : theme.colors.borderColor,
                backgroundColor: theme.colors.secondaryBackgroundColor,
                borderWidth: 1,
              },
            ]}
            onPress={() => handlePress(index)}
          >
            <TextInput
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.textInput,
                {
                  color: theme.colors.bodyTextColor,
                  fontFamily: "PlusJakartaSans_SemiBold",
                },
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              onFocus={() => handleFocus(index)}
              keyboardType="numeric"
              maxLength={1}
              editable={!disabled}
              selectTextOnFocus
              textAlign="center"
              cursorColor={theme.colors.primaryColor}
              returnKeyType="done"
            />
          </Pressable>
        ))}
      </Box>
      {errorText ? (
        <Box mb="s">
          <CustomText color="error" variant="body" textAlign="center">
            {errorText}
          </CustomText>
        </Box>
      ) : null}

      {/* Resend option */}
      {showResend && (
        <Box
          alignItems={
            textAlign === "center"
              ? "center"
              : textAlign === "left"
              ? "flex-start"
              : "flex-end"
          }
          flexDirection="row"
          justifyContent={
            textAlign === "center"
              ? "center"
              : textAlign === "left"
              ? "flex-start"
              : "flex-end"
          }
        >
          <CustomText variant="body" fontSize={14} color="bodyTextColor">
            {resendText}{" "}
          </CustomText>
          <Pressable onPress={handleResend} disabled={resendTimer > 0}>
            <CustomText
              variant="body"
              fontSize={14}
              color={resendTimer > 0 ? "disabledTextColor" : "secondaryColor"}
              style={{ fontWeight: "600" }}
            >
              {resendTimer > 0 ? `Resend ${resendTimer}s` : "Resend"}
            </CustomText>
          </Pressable>
        </Box>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 48,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});

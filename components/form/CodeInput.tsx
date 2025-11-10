import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import Box from "../general/Box";

interface CodeInputProps {
  length?: number;
  onCodeChange?: (code: string) => void;
  onCodeComplete?: (code: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export default function CodeInput({
  length = 6,
  onCodeChange,
  onCodeComplete,
  autoFocus = true,
  disabled = false,
  error = false,
}: CodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<TextInput[]>([]);
  const theme = useTheme<Theme>();

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      // Add a longer delay to ensure the component is fully visible and user is ready
      // This prevents the keyboard from popping up unexpectedly on app start
      // Only focus if the component is actually visible (not on initial app load)
      const focusTimer = setTimeout(() => {
        // Double-check that the input still exists and component is mounted
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      }, 1000); // Increased delay to 1 second
      
      return () => clearTimeout(focusTimer);
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

  return (
    <Box flexDirection="row" justifyContent="space-between" marginVertical="m">
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
                : theme.colors.borderColor,
              backgroundColor: theme.colors.secondaryBackgroundColor,
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
          />
        </Pressable>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 48,
    height: 64,
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

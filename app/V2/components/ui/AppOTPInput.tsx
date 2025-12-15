import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export interface AppOTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onError?: boolean;
  autoFocus?: boolean;
}

export interface AppOTPInputRef {
  getValue: () => string;
  clear: () => void;
  focus: () => void;
}

export const AppOTPInput = forwardRef<AppOTPInputRef, AppOTPInputProps>(
  ({ length = 6, onComplete, onError = false, autoFocus = true }, ref) => {
    const theme = useTheme<Theme>();
    const [codes, setCodes] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<TextInput[]>([]);

    useImperativeHandle(ref, () => ({
      getValue: () => codes.join(""),
      clear: () => {
        setCodes(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      },
      focus: () => {
        inputRefs.current[0]?.focus();
      },
    }));

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      }
    }, [autoFocus]);

    const handleChange = (text: string, index: number) => {
      // Only allow single digit
      const digit = text.replace(/[^0-9]/g, "").slice(-1);
      
      if (digit) {
        const newCodes = [...codes];
        newCodes[index] = digit;
        setCodes(newCodes);

        // Auto-focus next input
        if (index < length - 1 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }

        // Check if all digits are filled
        if (newCodes.every((code) => code !== "") && newCodes.join("").length === length) {
          onComplete(newCodes.join(""));
        }
      } else {
        // Handle backspace
        const newCodes = [...codes];
        newCodes[index] = "";
        setCodes(newCodes);
      }
    };

    const handleKeyPress = (e: any, index: number) => {
      if (e.nativeEvent.key === "Backspace" && !codes[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (text: string, index: number) => {
      const digits = text.replace(/[^0-9]/g, "").slice(0, length);
      if (digits.length === length) {
        const newCodes = digits.split("");
        setCodes(newCodes);
        onComplete(digits);
        // Focus last input
        inputRefs.current[length - 1]?.focus();
      }
    };

    return (
      <View style={styles.container}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            style={[
              styles.input,
              {
                borderColor: onError
                  ? theme.colors.error
                  : codes[index]
                  ? theme.colors.primaryColor
                  : theme.colors.borderColor,
                backgroundColor: theme.colors.secondaryBackgroundColor,
                color: theme.colors.bodyTextColor,
              },
            ]}
            value={codes[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            onPaste={(e) => {
              const pastedText = e.nativeEvent.text;
              handlePaste(pastedText, index);
            }}
          />
        ))}
      </View>
    );
  }
);

AppOTPInput.displayName = "AppOTPInput";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  input: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
    minHeight: 56,
    maxHeight: 56,
  },
});


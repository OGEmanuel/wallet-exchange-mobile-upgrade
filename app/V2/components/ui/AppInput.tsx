import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export type InputType = "text" | "email" | "tel" | "number" | "password";

export interface AppInputProps extends Omit<TextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  type?: InputType;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  maxLength?: number;
  label?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error,
  touched = false,
  disabled = false,
  type = "text",
  prefix,
  suffix,
  maxLength,
  label,
  ...props
}) => {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case "email":
        return "email-address";
      case "tel":
        return "phone-pad";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  };

  const getAutoCapitalize = () => {
    if (type === "email") return "none";
    return "sentences";
  };

  const showError = error && touched;
  const borderColor = showError
    ? theme.colors.error
    : isFocused
    ? theme.colors.primaryColor
    : theme.colors.borderColor;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.bodyTextColor,
              marginBottom: 8,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderWidth: isFocused ? 1.5 : 1,
            backgroundColor: disabled
              ? theme.colors.secondaryBackgroundColor
              : theme.colors.mainBackgroundColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholderTextColor}
          style={[
            styles.input,
            {
              color: theme.colors.bodyTextColor,
              flex: 1,
            },
          ]}
          editable={!disabled}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          secureTextEntry={type === "password"}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>
      {showError && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Medium",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    // paddingHorizontal: 12,
    // minHeight: 48,
    paddingTop: 0,
    // paddingBottom: 16,
  },
  input: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    // paddingVertical: 12,

    width: "100%",
    // height: 56,
    borderRadius: 8,
    backgroundColor: "#2f333d",
    color: "#FFFFFF",
    // paddingVertical: 16,
    paddingHorizontal: 12,
    borderColor: "#6045FF",
    paddingVertical: 16,
  },
  prefix: {
    marginRight: 12,
  },
  suffix: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
    marginTop: 4,
  },
});

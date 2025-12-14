import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

export type ButtonVariant = "primary" | "outline" | "text" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  style?: TouchableOpacityProps["style"];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  style,
  ...props
}) => {
  const theme = useTheme<Theme>();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.primaryColor,
          borderWidth: 0,
          borderColor: "transparent",
          textColor: theme.colors.white,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.primaryColor,
          textColor: theme.colors.primaryColor,
        };
      case "text":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderColor: "transparent",
          textColor: theme.colors.primaryColor,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderColor: "transparent",
          textColor: theme.colors.bodyTextColor,
        };
      default:
        return {
          backgroundColor: theme.colors.primaryColor,
          borderWidth: 0,
          borderColor: "transparent",
          textColor: theme.colors.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 12,
          minHeight: 32,
        };
      case "sm":
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          fontSize: 14,
          minHeight: 40,
        };
      case "md":
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
          minHeight: 48,
        };
      case "lg":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
          minHeight: 48,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? theme.colors.inActiveBtnColor
            : variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
            style={styles.loader}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {
                  color: isDisabled
                    ? theme.colors.disabledTextColor
                    : variantStyles.textColor,
                  fontSize: sizeStyles.fontSize,
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  loader: {
    marginRight: 0,
  },
});


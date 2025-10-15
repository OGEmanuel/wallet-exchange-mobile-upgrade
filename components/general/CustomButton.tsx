import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Haptics from "expo-haptics";
import React, { JSX } from "react";
import { DimensionValue, Pressable } from "react-native";
import CustomText from "./CustomText";
import ZapLoader from "./ZapLoader";

interface IProps {
  width?: DimensionValue;
  height?: DimensionValue;
  padding?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderWidth?: number;
  borderColor?: string;
  isLoading?: boolean;
  shouldVibrate?: boolean;
  icon?: JSX.Element;
  text: string;
  bgColor?: string;
  color?: string;
  fontSize?: number;
  disabled?: boolean;
  disabledColor?: string;
  borderRadius?: number;
  onPress: () => void;
  trailingIcon?: JSX.Element;
  leadingIcon?: JSX.Element;
  iconPosition?: "LEFT" | "RIGHT";
  variant?: "bodySubheader" | "subheader" | "body";
}

export default function CustomButton({
  width = "50%",
  height = 56,
  borderWidth = 0,
  borderColor = "transparent",
  isLoading = false,
  shouldVibrate = false,
  icon,
  text,
  bgColor,
  color = "white",
  fontSize = 14,
  disabled = false,
  borderRadius = 10,
  disabledColor = "lightgrey",
  iconPosition = "LEFT",
  variant = "bodySubheader",
  leadingIcon,
  trailingIcon,
  onPress,
}: IProps) {
  const handlePress = () => {
    if (isLoading || disabled) {
      return;
    }
    if (shouldVibrate) {
      // Vibration.vibrate();
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      onPress();
    }
  };
  const theme = useTheme<Theme>();
  return (
    <Pressable
      style={({ pressed }) => ({
        width,
        height,
        borderWidth,
        borderColor,
        backgroundColor:
          disabled || isLoading
            ? disabledColor
            : bgColor || theme.colors.primaryColor,
        borderRadius,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.5 : pressed ? 0.3 : 1,
      })}
      onPress={handlePress}
      android_ripple={{
        color: "rgba(255, 255, 255, 0.3)",
        borderless: false,
        radius: 20,
      }}
    >
      {isLoading && (
        <ZapLoader size={24} showText={false} style={{ marginRight: 8 }} />
      )}
      {!isLoading && (
        <>
          {leadingIcon && leadingIcon}
          <CustomText variant={variant} fontSize={fontSize} style={{ color }}>
            {text}
          </CustomText>
          {trailingIcon && trailingIcon}
        </>
      )}
    </Pressable>
  );
}

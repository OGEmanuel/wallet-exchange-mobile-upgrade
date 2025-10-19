import theme, { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Haptics from "expo-haptics";
import React, { JSX, useRef } from "react";
import { Animated, DimensionValue, Pressable } from "react-native";
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
  text?: string;
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
  text = "",
  bgColor,
  color = "white",
  fontSize = 14,
  disabled = false,
  borderRadius = 10,
  disabledColor = theme.colors.disabledTextColor,
  iconPosition = "LEFT",
  variant = "body",
  leadingIcon,
  trailingIcon,
  onPress,
}: IProps) {
  const theme = useTheme<Theme>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isLoading || disabled) return;

    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (isLoading || disabled) return;

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width, height }}>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          borderWidth,
          borderColor: borderColor || theme.colors.borderColor,
          backgroundColor:
            disabled || isLoading
              ? disabledColor
              : bgColor || theme.colors.primaryColor,
          borderRadius,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          opacity: disabled ? 0.95 : pressed ? 0.8 : 1,
        })}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
            {text && (
              <CustomText
                variant={variant}
                fontSize={fontSize}
                style={{ color }}
                ml={leadingIcon ? "s" : undefined}
                mr={trailingIcon ? "s" : undefined}
              >
                {text}
              </CustomText>
            )}
            {trailingIcon && trailingIcon}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

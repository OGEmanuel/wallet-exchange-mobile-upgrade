import { useTheme } from "@shopify/restyle";
import React from "react";
import { GestureResponderEvent, Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";

interface TimeFrameProps {
  active: boolean;
  range: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled?: boolean;
}

const TimeFrame: React.FC<TimeFrameProps> = ({
  active,
  range,
  onPress,
  disabled = false,
}) => {
  const theme = useTheme<Theme>();

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
      android_ripple={{
        color: "rgba(255,255,255,0.1)",
        borderless: true,
      }}
    >
      <Box
        paddingHorizontal="s"
        paddingVertical="s"
        borderRadius={8}
        alignSelf="flex-start"
        bg={
          active
            ? "primaryColor"
            : disabled
            ? "secondaryBackgroundColor"
            : undefined
        }
        style={
          !active && !disabled ? { backgroundColor: "transparent" } : undefined
        }
      >
        <CustomText
          variant="body"
          fontSize={12}
          color={
            active ? "white" : disabled ? "disabledTextColor" : "bodyTextColor"
          }
        >
          {range}
        </CustomText>
      </Box>
    </Pressable>
  );
};

export default TimeFrame;

import { useTheme } from "@shopify/restyle";
import { ArrowUpDown } from "lucide-react-native";
import React from "react";
import { Animated, Pressable } from "react-native";

import Box from "@/components/general/Box";
import { Theme } from "@/theme";

// Create animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SwapButtonProps {
  onPress: () => void;
  animatedStyle?: any;
  disabled?: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onPress,
  animatedStyle,
  disabled = false,
}) => {
  const theme = useTheme<Theme>();

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: "50%",
          marginLeft: -25, // Half of button width (50/2)
          top: -25, // Half of button height (50/2)
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: theme.colors.mainBackgroundColor,
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          zIndex: 0,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Box
        width={"100%"}
        height={"100%"}
        borderRadius={50}
        backgroundColor="secondaryBackgroundColor"
        justifyContent="center"
        alignItems="center"
      >
        <ArrowUpDown color={theme.colors.bodyTextColor} size={20} />
      </Box>
    </AnimatedPressable>
  );
};

export default SwapButton;

import { useTheme } from "@shopify/restyle";
import React from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  Pressable,
} from "react-native";

import Box from "@/components/general/Box";
import { Theme } from "@/theme";

interface TouchableIconProps {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  source?: ImageSourcePropType | undefined;
  size?: number;
  disabled?: boolean;
  tintColor?: string;
}

const TouchableIcon: React.FC<TouchableIconProps> = ({
  onPress,
  source,
  size = 20,
  disabled,
  tintColor,
}) => {
  const theme = useTheme<Theme>();

  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      android_ripple={{
        color: "rgba(255,255,255,0.1)",
        borderless: true,
      }}
    >
      <Box
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
      >
        <Image
          source={source}
          style={{
            width: size,
            height: size,
            tintColor: tintColor || (isDark ? "white" : "black"),
          }}
        />
      </Box>
    </Pressable>
  );
};

export default TouchableIcon;

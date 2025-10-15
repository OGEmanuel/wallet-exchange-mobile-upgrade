import { useTheme } from "@shopify/restyle";
import React from "react";
import { GestureResponderEvent, Pressable } from "react-native";

import { Box } from "@/components/general";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";

interface MarketFilterProps {
  label: string;
  active: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

const MarketFilter: React.FC<MarketFilterProps> = ({
  label,
  active,
  onPress,
}) => {
  const theme = useTheme<Theme>();

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  return (
    <Box
      flexDirection="row"
      bg="modalBackgroundColor"
      borderRadius={20}
      marginRight="s"
    >
      <Pressable
        disabled={active}
        onPress={onPress}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: active ? "rgba(75, 87, 33, 0.2)" : "transparent",
          borderWidth: active ? 1 : 0,
          borderColor: active ? "#C7E64D" : "transparent",
        }}
        android_ripple={{
          color: "rgba(255,255,255,0.1)",
          borderless: true,
        }}
      >
        <CustomText
          variant="body"
          fontSize={12}
          color={
            active ? (isDark ? "secondaryColor" : "white") : "bodyTextColor"
          }
          // color={"bodyTextColor"}
        >
          {label}
        </CustomText>
      </Pressable>
    </Box>
  );
};

export default MarketFilter;

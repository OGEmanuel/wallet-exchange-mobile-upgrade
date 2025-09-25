import { useTheme } from "@shopify/restyle";
import React from "react";
import { GestureResponderEvent, Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";

interface FilterPillProps {
  label: string;
  active: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, active, onPress }) => {
  const theme = useTheme<Theme>();

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

  return (
    <Pressable
      disabled={active}
      onPress={onPress}
      style={{
        minWidth: 40,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 5,
        // paddingHorizontal: 14,
        borderRadius: 8,
      }}
      android_ripple={{
        color: "rgba(255,255,255,0.1)",
        borderless: true,
      }}
    >
      <Box
        minWidth={40}
        height={28}
        alignItems="center"
        justifyContent="center"
        marginRight="s"
        paddingHorizontal="s"
        borderRadius={8}
        bg={active ? "headerTextColor" : "secondaryBackgroundColor"}
      >
        <CustomText
          variant="body"
          fontSize={12}
          color={active ? (isDark ? "black" : "white") : "bodyTextColor"}
        >
          {label}
        </CustomText>
      </Box>
    </Pressable>
  );
};

export default FilterPill;

import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

const SidebarItemCard = ({
  icon,
  title,
  link,
  isActive,
  trailingItem,
  disablClick = false,
  onPress,
}: ISidebarItem) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      onPress={() => {
        if (!disablClick) {
          if (onPress) {
            onPress();
          } else {
            router.push(link as any);
          }
        }
      }}
      style={{
        width: "100%",
      }}
    >
      <Box
        width={"100%"}
        height={50}
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="m"
        justifyContent="space-between"
      >
        <Box flexDirection="row" alignItems="center">
          {icon}
          <CustomText
            variant="bodySubheader"
            ml="s"
            fontSize={14}
            color={isActive ? "tabBarActiveColor" : "bodyTextColor"}
          >
            {title}
          </CustomText>
        </Box>
        <Box justifyContent="center">
          {trailingItem ? (
            trailingItem
          ) : (
            <ChevronRight size={20} color={theme.colors.bodyTextColor} />
          )}
        </Box>
      </Box>
    </Pressable>
  );
};

export default SidebarItemCard;

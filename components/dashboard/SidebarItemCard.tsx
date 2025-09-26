import { ISidebarItem } from "@/types/SidebarItem";
import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

const SidebarItemCard = ({ icon, title, link, isActive }: ISidebarItem) => {
  return (
    <Pressable
      onPress={() => router.push(link as any)}
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
      >
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
    </Pressable>
  );
};

export default SidebarItemCard;

import { View, Text } from "react-native";
import React from "react";
import Box from "../general/Box";
import { ISidebarItem } from "@/types/SidebarItem";
import CustomText from "../general/CustomText";

const SidebarItemCard = ({ icon, title, link, isActive }: ISidebarItem) => {
  return (
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
  );
};

export default SidebarItemCard;

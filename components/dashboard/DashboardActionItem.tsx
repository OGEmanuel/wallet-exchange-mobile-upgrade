import { View, Text, Pressable } from "react-native";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface IProps {
  icon: React.ReactNode;
  title: string;
  action: () => void;
}

const DashboardActionItem = ({ icon, title, action }: IProps) => {
  return (
    <Pressable onPress={() => action()} style={{ alignItems: "center" }}>
      <Box
        width={44}
        height={44}
        borderRadius={40}
        backgroundColor="secondaryBackgroundColor"
        justifyContent="center"
        alignItems="center"
        marginBottom="s"
      >
        {icon}
      </Box>
      <CustomText fontSize={12}>{title}</CustomText>
    </Pressable>
  );
};

export default DashboardActionItem;

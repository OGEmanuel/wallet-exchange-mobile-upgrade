import React from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface IProps {
  icon: React.ReactNode;
  title: string;
  action: () => void;
}

const DashboardActionItem = ({ icon, title, action }: IProps) => {
  return (
    <Pressable
      onPress={() => action()}
      style={({ pressed }) => ({
        alignItems: "center",
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Box
        width={50}
        height={50}
        borderRadius={40}
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
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

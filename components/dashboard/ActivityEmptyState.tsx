import { View, Text, Image } from "react-native";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import CustomButton from "../general/CustomButton";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";

const ActivityEmptyState = () => {
  const theme = useTheme<Theme>();
  return (
    <Box width={"100%"} height="auto" alignItems="center">
      <Image
        source={require("@/assets/images/glass.png")}
        style={{ width: 320, height: 300 }}
        resizeMode="contain"
      />
      <CustomText variant="medium" fontSize={24}>
        No history
      </CustomText>
      <CustomText variant="body" fontSize={14} mb="l" mt="s">
        You haven’t made any transactions yet
      </CustomText>

      <CustomButton
        width={152}
        height={42}
        borderRadius={40}
        bgColor={theme.colors.primaryColor}
        text="Buy crypto"
        variant="bodySubheader"
        fontSize={12}
        onPress={() => {}}
      />
    </Box>
  );
};

export default ActivityEmptyState;

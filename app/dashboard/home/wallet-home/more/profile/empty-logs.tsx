import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import React from "react";
import { Image } from "react-native";

const ActivityLogsEmptyState = () => {
  const theme = useTheme<Theme>();
  const router = useRouter();
  return (
    <Box width={"100%"} height="auto" alignItems="center">
      <Image
        source={require("@/assets/images/glass.png")}
        style={{ width: 320, height: 300 }}
        resizeMode="contain"
      />
      <CustomText variant="medium" fontSize={24}>
        No Activity
      </CustomText>
      <CustomText variant="body" fontSize={14} mb="l" mt="s">
        No Activity yet!
      </CustomText>

      {/* <CustomButton
        width={152}
        height={42}
        borderRadius={40}
        bgColor={theme.colors.primaryColor}
        text="Buy crypto"
        variant="bodySubheader"
        fontSize={12}
        onPress={() => {
          router.push("/dashboard/home/wallet-home/swap");
        }}
      /> */}
    </Box>
  );
};

export default ActivityLogsEmptyState;

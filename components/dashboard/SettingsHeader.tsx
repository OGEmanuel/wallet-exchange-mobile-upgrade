import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import React from "react";
import { Pressable } from "react-native";
import { Box, CustomText } from "../general";

const SettingsHeader = ({
  title,
  onBackPress,
}: {
  title: string;
  onBackPress: () => void;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Box
      width="100%"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      mb="s"
      mt="s"
    >
      <Pressable
        onPress={onBackPress}
        style={{ position: "absolute", left: 0, paddingLeft: 16, zIndex: 1 }}
      >
        <ArrowLeft2 size={24} color={theme.colors.bodyTextColor} />
      </Pressable>
      <CustomText
        variant="bodyBold"
        textAlign="center"
        style={{ fontFamily: "NewScience_Bold" }}
      >
        {title}
      </CustomText>
    </Box>
  );
};

export default SettingsHeader;

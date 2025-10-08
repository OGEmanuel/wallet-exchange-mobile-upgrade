import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
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
      width={"100%"}
      height={50}
      borderBottomColor="borderColor"
      borderBottomWidth={1}
      alignItems="center"
      justifyContent="space-between"
      flexDirection="row"
      paddingHorizontal="m"
    >
      <ChevronLeft
        size={25}
        color={theme.colors.bodyTextColor}
        onPress={() => onBackPress()}
      />
      <CustomText variant="medium">{title}</CustomText>
      <Box />
    </Box>
  );
};

export default SettingsHeader;

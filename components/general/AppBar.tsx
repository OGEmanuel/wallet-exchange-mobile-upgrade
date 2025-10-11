import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { DimensionValue } from "react-native";
import Box from "./Box";
import CustomText from "./CustomText";

interface IProps {
  leading?: React.ReactNode;
  title?: React.ReactNode;
  trailing?: React.ReactNode;
  backgroundColor?: string;
  height?: DimensionValue;
  paddingHorizontal?: number;
  fontSize?: number;
  variant?: "bodySubheader" | "subheader";
}

const AppBar = ({
  leading,
  title,
  trailing,
  backgroundColor,
  height = 70,
  paddingHorizontal = 20,
  fontSize = 14,
  variant = "subheader",
}: IProps) => {
  const theme = useTheme<Theme>();
  return (
    <Box
      width={"100%"}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      height={height}
      style={{
        backgroundColor: backgroundColor ?? theme.colors.mainBackgroundColor,
        paddingHorizontal,
      }}
    >
      <Box flex={1} flexDirection="row" alignItems="center">
        {leading && <Box>{leading}</Box>}
      </Box>
      <Box flex={2} alignItems="center" justifyContent="center">
        {title && (
          <CustomText variant={variant} fontSize={fontSize}>
            {title}
          </CustomText>
        )}
      </Box>
      <Box flex={1} flexDirection="row" alignItems="center" justifyContent="flex-end">
        {trailing && <Box>{trailing}</Box>}
      </Box>
    </Box>
  );
};

export default AppBar;

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { DimensionValue } from "react-native";
import Box from "./Box";
import ThemedText from "./ThemedText";

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
  height = 100,
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
      <Box>{leading}</Box>
      <Box>
        {title && (
          <ThemedText color={theme.colors.bodyTextColor}> {title}</ThemedText>
        )}
      </Box>
      <Box>{trailing}</Box>
    </Box>
  );
};

export default AppBar;

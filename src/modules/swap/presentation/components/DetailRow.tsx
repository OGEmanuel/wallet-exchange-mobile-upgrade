import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const DetailRow = ({
  label,
  children,
  labelStyle,
  containerStyle,
}: DetailRowProps) => {
  const theme = useTheme<Theme>();
  return (
    <View style={[styles.row, containerStyle]}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.bodyTextColor },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    color: "#9CA3AF",
  },
});

export default DetailRow;

import { SIZES } from "@/lib/utils";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Box, CustomText } from "../general";

type FindZapOptionProps = {
  active: boolean;
  option: string;
  onPress?: (() => void) | null | undefined;
};

export default function FindZapOption({
  active,
  option,
  onPress,
}: FindZapOptionProps) {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  // Border color logic
  const borderColor = active
    ? isDark
      ? theme.colors.secondaryColor // Active + Dark
      : theme.colors.primaryColor // Active + Light
    : theme.colors.borderColor;

  // Background color logic
  const backgroundColor = active
    ? isDark
      ? "#272B17" // Active + Dark
      : "#F1F1FF" // Active + Light
    : theme.colors.mainBackgroundColor;

  // Radio circle color (same as border)
  const radioColor = active
    ? isDark
      ? theme.colors.secondaryColor // Active + Dark
      : theme.colors.primaryColor // Active + Light
    : theme.colors.borderColor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor,
        },
      ]}
    >
      <Box
        style={[
          styles.radioCircle,
          {
            borderColor: radioColor,
            borderWidth: active ? 2 : 1,
          },
        ]}
        justifyContent="center"
        alignItems="center"
      >
        {active && (
          <Box
            style={[
              styles.radioInner,
              {
                backgroundColor: radioColor,
              },
            ]}
          />
        )}
      </Box>
      <CustomText variant="body" fontSize={14} marginLeft="s">
        {option}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZES.width / 2 - 28,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    borderWidth: 1,
    height: 45,
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
  },
  radioInner: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
});

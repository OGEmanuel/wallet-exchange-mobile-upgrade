import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, View } from "react-native";
import CustomText from "./CustomText";

export default function InfoBox({ text }: { text: string }) {
  const theme = useTheme<Theme>();
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.borderColor,
          backgroundColor: theme.colors.secondaryBackgroundColor,
        },
      ]}
    >
      <CustomText
        variant="body"
        color="secondaryColor"
        fontSize={10}
        textAlign="center"
      >
        {text}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "80%",
    height: 54,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    alignSelf: "center",
  },
});

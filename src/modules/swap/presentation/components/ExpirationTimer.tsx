import icons from "@/assets/icons";
import { CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function ExpirationTimer() {
  const theme = useTheme<Theme>();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.mainBackgroundColor },
      ]}
    >
      <Image source={icons.clock} style={{ width: 16, height: 16 }} />
      <CustomText style={{ fontSize: 12 }}>
        Expires in{" "}
        <CustomText style={{ fontSize: 12 }} color="secondaryColor">
          30:00
        </CustomText>
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    height: 34,
    flexDirection: "row",
    borderRadius: 36,
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
    alignSelf: "center",
  },
});

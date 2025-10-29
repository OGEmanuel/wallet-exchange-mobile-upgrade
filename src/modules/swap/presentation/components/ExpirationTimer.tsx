import icons from "@/assets/icons";
import { Box, CustomText } from "@/components/general";
import { useCountdown } from "@/src/hooks/useCountdown";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet } from "react-native";

export default function ExpirationTimer({
  expirationTime,
}: {
  expirationTime: Date;
}) {
  const theme = useTheme<Theme>();
  let { minutes, seconds } = useCountdown(expirationTime);

  if (minutes < 0 || seconds < 0) {
    minutes = 0;
    seconds = 0;
  }
  return (
    <Box
      mt="s"
      style={[
        styles.container,
        { backgroundColor: theme.colors.mainBackgroundColor },
      ]}
    >
      <Image source={icons.clock} style={{ width: 16, height: 16 }} />
      <CustomText style={{ fontSize: 12 }}>
        Expires in{" "}
        <CustomText style={{ fontSize: 12 }} color="secondaryColor">
          {minutes <= 0 ? "00" : minutes < 10 ? "0" + minutes : minutes}:
          {seconds <= 0 ? "00" : seconds < 10 ? "0" + seconds : seconds}
        </CustomText>
      </CustomText>
    </Box>
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

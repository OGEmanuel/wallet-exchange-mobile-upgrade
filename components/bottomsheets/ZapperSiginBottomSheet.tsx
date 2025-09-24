import { zapLogoWithNameDark } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Box } from "../general";
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from "./AnimatedGradientBottomSheet";

export default function ZapperSiginBottomSheet({
  ref,
}: {
  ref: React.RefObject<AnimatedGradientBottomSheetRef | null>;
}) {
  const { colors } = useTheme<Theme>();

  return (
    <>
      <AnimatedGradientBottomSheet
        ref={ref}
        snapPoints={["100%"]}
        enablePanDownToClose={true}
        showGradientHandle={true}
        gradientColors={[colors.primaryColor, colors.mainBackgroundColor]}
      >
        <View style={styles.handle} />
        <Box
          alignItems="center"
          justifyContent="center"
          style={styles.container}
        >
          <Image
            source={zapLogoWithNameDark}
            style={{ height: 40, width: 120 }}
            resizeMode="contain"
          />
        </Box>
      </AnimatedGradientBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    alignSelf: "center",
  },
});

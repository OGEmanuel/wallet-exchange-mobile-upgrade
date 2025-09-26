import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, View } from "react-native";
import VerifiyBVN from "../kyc/VerifiyBVN";
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from "./AnimatedGradientBottomSheet";

export default function KYCBottomSheet({
  ref,
}: {
  ref: React.RefObject<AnimatedGradientBottomSheetRef | null>;
}) {
  const { colors } = useTheme<Theme>();

  return (
    <AnimatedGradientBottomSheet
      ref={ref}
      snapPoints={["85%", "95%"]}
      enablePanDownToClose={true}
      showGradientHandle={true}
      gradientColors={[colors.mainBackgroundColor, colors.mainBackgroundColor]}
    >
      {/* Handle */}
      <View style={styles.handle} />

      {/* <PhoneVerification /> */}
      {/* <PhoneNumber /> */}
      {/* <IdentityVerification /> */}
      <VerifiyBVN />
    </AnimatedGradientBottomSheet>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
    marginBottom: 16,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

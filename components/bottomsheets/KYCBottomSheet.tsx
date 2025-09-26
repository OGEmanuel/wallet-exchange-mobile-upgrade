import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import PhoneVerification from "../kyc/PhoneVerification";
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
      snapPoints={["90%"]}
      enablePanDownToClose={true}
      showGradientHandle={true}
      gradientColors={[
        colors.mainBackgroundColor,
        colors.mainBackgroundColor,
        colors.mainBackgroundColor,
        colors.mainBackgroundColor,
        colors.mainBackgroundColor,
      ]}
    >
      <PhoneVerification />
    </AnimatedGradientBottomSheet>
  );
}

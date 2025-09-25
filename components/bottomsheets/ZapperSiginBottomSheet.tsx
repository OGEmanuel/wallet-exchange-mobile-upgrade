import { zapLogoWithNameDark } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Confetti, ConfettiMethods } from "react-native-fast-confetti";
import UsernameSuccess from "../onboarding/UsernameSuccess";
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from "./AnimatedGradientBottomSheet";

export default function ZapperSiginBottomSheet({
  ref,
}: {
  ref: React.RefObject<AnimatedGradientBottomSheetRef | null>;
}) {
  const { colors } = useTheme<Theme>();
  const confettiRef = useRef<ConfettiMethods>(null);

  useEffect(() => {
    confettiRef.current?.pause();
  }, []);

  return (
    <>
      <Confetti ref={confettiRef} />
      <AnimatedGradientBottomSheet
        ref={ref}
        snapPoints={["90%"]}
        enablePanDownToClose={true}
        showGradientHandle={true}
        gradientColors={[
          colors.primaryColor,
          colors.mainBackgroundColor,
          colors.mainBackgroundColor,
          colors.mainBackgroundColor,
          colors.mainBackgroundColor,
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.backContainer}></View>
        <Image
          source={zapLogoWithNameDark}
          style={{ height: 40, width: 120, alignSelf: "center", marginTop: 16 }}
          resizeMode="contain"
        />
        {/* <LoginToZap /> */}
        {/* <EmailVerification /> */}
        {/* <EnterUsername /> */}
        <UsernameSuccess confettiRef={confettiRef} />
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
  backContainer: {
    width: "100%",
    height: 40,
  },
});

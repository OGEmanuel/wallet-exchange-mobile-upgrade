import React, { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Box, CustomButton, CustomText } from "../general";
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from "./AnimatedGradientBottomSheet";

export default function ExampleAnimatedBottomSheet() {
  const bottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  const handleOpen = () => {
    bottomSheetRef.current?.open();
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  const handleSnapToIndex = (index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={handleOpen}>
        <CustomText>Open Animated Bottom Sheet</CustomText>
      </TouchableOpacity>

      <AnimatedGradientBottomSheet
        ref={bottomSheetRef}
        title="Welcome to Zap"
        subtitle="Experience the future of DeFi with our animated gradient bottomsheet"
        snapPoints={["50%", "80%"]}
        enablePanDownToClose={true}
        showGradientHandle={true}
        gradientColors={["#6045FF", "#8B5CF6", "#A855F7", "#EC4899"]}
        onClose={handleClose}
      >
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="white" fontSize={18} mb="l">
            This is an animated bottomsheet with gradient background!
          </CustomText>

          <Box flexDirection="row" gap="m" mb="l">
            <CustomButton
              title="Snap to 50%"
              onPress={() => handleSnapToIndex(0)}
              variant="secondary"
            />
            <CustomButton
              title="Snap to 80%"
              onPress={() => handleSnapToIndex(1)}
              variant="secondary"
            />
          </Box>

          <CustomButton title="Close" onPress={handleClose} variant="primary" />
        </Box>
      </AnimatedGradientBottomSheet>
    </View>
  );
}

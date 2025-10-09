import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface Props {
  onPress: () => void;
  isLoading?: boolean;
}

const SwapExchangeButton: React.FC<Props> = ({
  onPress,
  isLoading = false,
}) => {
  const theme = useTheme<Theme>();

  // Animation for shake effect
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Repeat the shake animation every 10 seconds
    const interval = setInterval(() => {
      translateY.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isLoading) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isLoading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Box alignItems="center" justifyContent="center" position="relative" paddingVertical="s" zIndex={10} style={{ paddingVertical: 4 }}>
      <Animated.View style={[animatedStyle, pulseStyle]}>
        <TouchableOpacity onPress={onPress}>
          <Box
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="secondaryBackgroundColor"
            justifyContent="center"
            alignItems="center"
            borderWidth={4}
            borderColor="mainBackgroundColor"
            style={{ opacity: isLoading ? 0.8 : 1 }}
          >
            <CustomText fontSize={20} style={styles.icon}>
              ⇅
            </CustomText>
          </Box>
        </TouchableOpacity>
      </Animated.View>
      {isLoading && (
        <Box mt="s">
          <CustomText variant="body" fontSize={12} color="disabledTextColor">
            Fetching rates...
          </CustomText>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  icon: {
    transform: [{ rotate: "90deg" }],
  },
});

export default SwapExchangeButton;


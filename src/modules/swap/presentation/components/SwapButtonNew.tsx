import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowUpDown } from "lucide-react-native";
import React, { useEffect } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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

const SwapButtonNew: React.FC<Props> = ({ onPress, isLoading = false }) => {
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
    <View style={styles.container}>
      <Animated.View style={[animatedStyle, pulseStyle]}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderColor: theme.colors.mainBackgroundColor,
            },
            isLoading && styles.buttonLoading,
          ]}
        >
          <ArrowUpDown
            color={theme.colors.bodyTextColor}
            size={20}
          />
        </TouchableOpacity>
      </Animated.View>
      {isLoading && (
        <View style={styles.loadingTextContainer}>
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.disabledTextColor },
            ]}
          >
            Fetching rates...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 2,
    zIndex: 10,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  loadingTextContainer: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
});

export default SwapButtonNew;


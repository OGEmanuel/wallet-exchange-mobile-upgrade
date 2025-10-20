import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  children,
  isLoading = false,
}) => {
  const theme = useTheme<Theme>();
  const shimmerAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (isLoading) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.25,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    } else {
      // Reset to normal opacity when not loading
      shimmerAnim.setValue(1);
    }
  }, [shimmerAnim, isLoading]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0.25, 0.5, 1],
    outputRange: [0.25, 1, 0.25],
  });

  // If children are provided, apply shimmer effect to them when loading
  if (children) {
    if (isLoading) {
      return (
        <Animated.View
          style={[
            {
              opacity: shimmerOpacity,
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      );
    }

    return <View style={style}>{children}</View>;
  }

  // Default rectangle skeleton
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.secondaryBackgroundColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.placeholderTextColor,
          opacity: shimmerOpacity,
          transform: [{ translateX: shimmerTranslateX }],
        }}
      />
    </View>
  );
};

export default SkeletonLoader;

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, StyleSheet, View } from "react-native";

interface ButtonLightDecorationProps {
  children: React.ReactNode;
  interval?: number; // Interval in milliseconds (default: 12000)
  lightColor?: string;
  lightWidth?: number;
  lightOpacity?: number;
}

/**
 * ButtonLightDecoration - A reusable component that adds a glass shimmer light effect
 * to any button or component. The light moves across the button every N seconds.
 */
const ButtonLightDecoration: React.FC<ButtonLightDecorationProps> = ({
  children,
  interval = 12000, // 12 seconds default
  lightColor,
  lightWidth = 80,
  lightOpacity = 0.4,
}) => {
  const theme = useTheme<Theme>();
  const translateX = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const [containerWidth, setContainerWidth] = useState(350); // Default button width

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  useEffect(() => {
    const animateLight = () => {
      // Calculate end position to keep light within button bounds
      // Start from just off the left edge, end before the right edge
      const startPosition = -lightWidth + 20;
      const endPosition = containerWidth - lightWidth + 50; // Add small buffer

      // Reset position - start from just inside the left edge
      translateX.setValue(startPosition);
      opacity.setValue(0);
      scaleY.setValue(0.8);

      // Create shimmer animation sequence - glass-like effect
      Animated.sequence([
        // Fade in and start moving
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: lightOpacity,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: endPosition - 50, // Move most of the way
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Fade out while completing the movement
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: endPosition,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    // Initial delay
    const initialTimeout = setTimeout(() => {
      animateLight();
    }, 1000);

    // Set up interval
    const intervalId = setInterval(() => {
      animateLight();
    }, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [interval, lightOpacity, translateX, opacity, scaleY, lightWidth, containerWidth]);

  const lightColorValue = lightColor || theme.colors.white || "#FFFFFF";

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {children}
      <Animated.View
        style={[
          styles.lightContainer,
          {
            opacity: opacity,
            transform: [
              { translateX: translateX },
              { scaleY: scaleY },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.08)",
            "rgba(255, 255, 255, 0.25)",
            lightColorValue,
            "rgba(255, 255, 255, 0.25)",
            "rgba(255, 255, 255, 0.08)",
            "rgba(255, 255, 255, 0)",
          ]}
          locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 56, // Match button border radius
  },
  lightContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 120,
    height: "100%",
    // Skew for glass-like angled reflection
    transform: [{ skewX: "-25deg" }],
    zIndex: 10,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    // Soft edges for glass shimmer
    borderRadius: 1,
  },
});

export default ButtonLightDecoration;


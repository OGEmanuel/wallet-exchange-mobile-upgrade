import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ConfettiMethods } from "react-native-fast-confetti";

export default function UsernameSuccess({
  confettiRef,
}: {
  confettiRef: React.RefObject<ConfettiMethods | null>;
}) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Small delay to ensure the component is fully mounted and visible
    const timer = setTimeout(() => {
      confettiRef.current?.restart();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start the spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const theme = useTheme<Theme>();
  const gradientColors = [theme.colors.primaryColor, "#1B1251"];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <View>
      <Animated.View
        style={[
          styles.userCard,
          {
            backgroundColor: theme.colors.primaryColor,
            borderWidth: 0,
            transform: [{ rotateY: spin }],
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCard}
        >
          <View style={styles.profilePic}></View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B0A5F3",
  },
  profilePic: {
    width: 100,
    height: 100,
    backgroundColor: "#23F9A1",
    borderRadius: 50,
    alignSelf: "center",
  },
});

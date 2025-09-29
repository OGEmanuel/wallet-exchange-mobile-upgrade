import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { ConfettiMethods } from "react-native-fast-confetti";

interface UsernameSuccessProps {
  confettiRef?: React.RefObject<ConfettiMethods | null>;
  onComplete?: () => void;
}

export default function UsernameSuccess({
  confettiRef,
  onComplete,
}: UsernameSuccessProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [hasConfettiRun, setHasConfettiRun] = useState(false);

  // useEffect(() => {
  //   // Small delay to ensure the component is fully mounted and visible
  //   if (!hasConfettiRun) {
  //     // const timer = setTimeout(() => {
  //     //   confettiRef.current?.start();
  //     //   setHasConfettiRun(true);
  //     // }, 500);

  //     // return () => clearTimeout(timer);
  //   }
  // }, [hasConfettiRun]);

  useEffect(() => {
    // Start the spin animation
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // Auto-trigger completion after animation
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    });
  }, [onComplete]);

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
            alignSelf: "center",
            marginTop: 100,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCard}
        >
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.profilePic}
          />
        </LinearGradient>

        <Text
          style={[
            styles.suffix,
            {
              color: theme.colors.bodyTextColor,
              width: SCREEN_WIDTH * 0.9,
              marginTop: 20,
            },
          ]}
        >
          Mofe.zap
        </Text>
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
    marginTop: 50,
  },
  suffix: {
    fontSize: 38,
    fontWeight: "400",
    fontFamily: "PlusJakartaSans_Regular",
    lineHeight: 48,
  },
});

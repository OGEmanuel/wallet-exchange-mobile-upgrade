import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";

interface SwitchTabProps {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  firstText: string;
  secondText: string;
}

const SwitchTab: React.FC<SwitchTabProps> = ({
  active,
  setActive,
  firstText,
  secondText,
}) => {
  const theme = useTheme<Theme>();

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

  // Animation values
  const slideAnim = useRef(new Animated.Value(active ? 0 : 1)).current;
  const firstTextOpacity = useRef(new Animated.Value(active ? 1 : 0.8)).current;
  const secondTextOpacity = useRef(
    new Animated.Value(active ? 0.8 : 1)
  ).current;

  // Update animation when active state changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: active ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(firstTextOpacity, {
        toValue: active ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(secondTextOpacity, {
        toValue: active ? 0.6 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, slideAnim, firstTextOpacity, secondTextOpacity]);

  // Animated background position for the active tab indicator
  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["1%", "46%"],
  });

  // Animated width for the active tab indicator
  const widthInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["55%", "55%"],
  });

  return (
    <Box width="100%" paddingHorizontal="m">
      <Box
        width="100%"
        height={46}
        bg="secondaryBackgroundColor"
        borderRadius={48}
        alignItems="center"
        flexDirection="row"
        // padding="s"
        style={{ padding: 5 }}
        position="relative"
      >
        {/* Animated active tab background */}
        <Animated.View
          style={{
            position: "absolute",
            height: "100%",
            borderRadius: 48,
            zIndex: 1,
            backgroundColor: theme.colors.headerTextColor,
            left: slideInterpolate,
            width: widthInterpolate,
          }}
        />

        <Pressable
          onPress={() => setActive(true)}
          style={{
            height: "100%",
            width: "50%",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          android_ripple={{
            color: "rgba(255,255,255,0.1)",
            borderless: true,
          }}
        >
          <Animated.View style={{ opacity: firstTextOpacity }}>
            <CustomText
              variant="bodySubheader"
              fontSize={12}
              color={active ? (isDark ? "black" : "white") : "bodyTextColor"}
            >
              {firstText}
            </CustomText>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => setActive(false)}
          style={{
            height: "100%",
            width: "50%",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          android_ripple={{
            color: "rgba(255,255,255,0.1)",
            borderless: true,
          }}
        >
          <Animated.View style={{ opacity: secondTextOpacity }}>
            <CustomText
              variant="bodySubheader"
              fontSize={12}
              color={!active ? (isDark ? "black" : "white") : "bodyTextColor"}
            >
              {secondText}
            </CustomText>
          </Animated.View>
        </Pressable>
      </Box>
    </Box>
  );
};

export default SwitchTab;

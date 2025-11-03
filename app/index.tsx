import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  View
} from "react-native";

import ThemedText from "@/components/general/ThemedText";
import DirectionButton from "@/components/onboarding/DirectionButton";
import { SIZES } from "@/data";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import images from "../assets/images";

export default function HomeScreen() {
  const theme = useTheme<Theme>();
  const screenWidth = Dimensions.get("window").width;
  const inset = useSafeAreaInsets();

  // Cloud animations (3 clouds) - now vertical
  const cloud1Animation = useRef(new Animated.Value(0)).current;
  const cloud2Animation = useRef(new Animated.Value(0)).current;
  const cloud3Animation = useRef(new Animated.Value(0)).current;

  // Vertical animations
  const handPhoneAnimation = useRef(new Animated.Value(0)).current;
  const bitcoinAnimation = useRef(new Animated.Value(0)).current;
  const dollarAnimation = useRef(new Animated.Value(0)).current;
  const asteriskAnimation = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   // Vertical floating animations
  //   const createFloatingAnimation = (
  //     animValue: Animated.Value,
  //     duration: number,
  //     delay: number = 0
  //   ) => {
  //     const animate = () => {
  //       Animated.sequence([
  //         Animated.timing(animValue, {
  //           toValue: -15,
  //           duration: duration,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(animValue, {
  //           toValue: 15,
  //           duration: duration,
  //           useNativeDriver: true,
  //         }),
  //       ]).start(() => animate());
  //     };
  //     setTimeout(animate, delay);
  //   };

  //   // Cloud vertical floating animations
  //   createFloatingAnimation(cloud1Animation, 3000, 0);
  //   createFloatingAnimation(cloud2Animation, 3500, 1000);
  //   createFloatingAnimation(cloud3Animation, 2800, 2000);

  //   // Start floating animations with different timings
  //   createFloatingAnimation(handPhoneAnimation, 2000, 0);
  //   createFloatingAnimation(bitcoinAnimation, 1800, 500);
  //   createFloatingAnimation(dollarAnimation, 2200, 1000);
  //   createFloatingAnimation(asteriskAnimation, 1900, 1500);
  // }, [
  //   cloud1Animation,
  //   cloud2Animation,
  //   cloud3Animation,
  //   handPhoneAnimation,
  //   bitcoinAnimation,
  //   dollarAnimation,
  //   asteriskAnimation,
  //   screenWidth,
  // ]);

  return (
    <LinearGradient
      locations={[0.03, 0.95]}
      colors={["#19087d", "#846fff"]}
      start={{ x: 0.95, y: 1 }}
      end={{ x: 0.03, y: 0 }}
    >
      <ImageBackground style={styles.container} source={images.clouds}>
        {/* Hand and phone with vertical animation */}
        <Animated.Image
          source={require("../assets/images/hand.png")}
          style={[
            styles.handImage,
            {
              transform: [{ translateY: handPhoneAnimation }],
            },
          ]}
        />

        {/* Floating icons */}
        <Animated.Image
          source={require("../assets/images/btc.png")}
          style={[
            styles.bitcoinIcon,
            {
              transform: [{ translateY: bitcoinAnimation }],
            },
          ]}
        />
        <Animated.Image
          source={require("../assets/images/dollar.png")}
          style={[
            styles.dollarIcon,
            {
              transform: [{ translateY: dollarAnimation }],
            },
          ]}
        />
        <Animated.Image
          source={require("../assets/images/sym.png")}
          style={[
            styles.asteriskIcon,
            {
              transform: [{ translateY: asteriskAnimation }],
            },
          ]}
        />
        <View
          style={{
            position: "absolute",
            bottom: 126 + inset?.bottom,
          }}
        >
          <ThemedText type="subTitleLg" color={theme.colors.bodyTextColor}>
            Your Funds.
          </ThemedText>
          <ThemedText type="subTitleLg" color={theme.colors.bodyTextColor}>
            Your wallet
          </ThemedText>
        </View>

        <DirectionButton
          color="#6045FF"
          onPress={() => router.push("/select-track")}
        />
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 50,
    height: SIZES.height,
    width: SIZES.width,
  },
  // Cloud styles
  cloud1: {
    position: "absolute",
    top: 0,
    left: "0%",
    width: 200,
    height: 200,
    resizeMode: "contain",
    zIndex: 1,
    opacity: 0.8,
  },
  cloud2: {
    position: "absolute",
    top: 10,
    left: "50%",
    width: 200,
    height: 200,
    resizeMode: "contain",
    zIndex: 1,
    opacity: 0.6,
  },
  cloud3: {
    position: "absolute",
    top: 180,
    left: "0%",
    width: 200,
    height: 200,
    resizeMode: "contain",
    zIndex: 1,
    opacity: 0.8,
  },
  // Hand image
  handImage: {
    position: "absolute",
    top: "25%",
    left: "20%",
    marginLeft: -100,
    width: 350,
    height: 450,
    resizeMode: "contain",
    zIndex: 3,
  },
  // Floating icons
  bitcoinIcon: {
    position: "absolute",
    top: "20%",
    left: "60%",
    right: 30,
    width: 69,
    height: 74,
    resizeMode: "contain",
    zIndex: 3,
  },
  dollarIcon: {
    position: "absolute",
    top: "42%",
    left: "15%",
    width: 66,
    height: 67,
    resizeMode: "contain",
    zIndex: 3,
  },
  asteriskIcon: {
    position: "absolute",
    bottom: "35%",
    right: 40,
    left: "60%",
    width: 66,
    height: 83,
    resizeMode: "contain",
    zIndex: 3,
  },
});

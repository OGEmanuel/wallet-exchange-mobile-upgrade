import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
} from "react-native";

import icons from "@/assets/icons";
import images from "../assets/images";

export default function HomeScreen() {
  const theme = useTheme<Theme>();
  const screenWidth = Dimensions.get("window").width;

  // Cloud animations (3 clouds) - now vertical
  const cloud1Animation = useRef(new Animated.Value(0)).current;
  const cloud2Animation = useRef(new Animated.Value(0)).current;
  const cloud3Animation = useRef(new Animated.Value(0)).current;

  // Vertical animations
  const handPhoneAnimation = useRef(new Animated.Value(0)).current;
  const bitcoinAnimation = useRef(new Animated.Value(0)).current;
  const dollarAnimation = useRef(new Animated.Value(0)).current;
  const asteriskAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Vertical floating animations
    const createFloatingAnimation = (
      animValue: Animated.Value,
      duration: number,
      delay: number = 0
    ) => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -15,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 15,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start(() => animate());
      };
      setTimeout(animate, delay);
    };

    // Cloud vertical floating animations
    createFloatingAnimation(cloud1Animation, 3000, 0);
    createFloatingAnimation(cloud2Animation, 3500, 1000);
    createFloatingAnimation(cloud3Animation, 2800, 2000);

    // Start floating animations with different timings
    createFloatingAnimation(handPhoneAnimation, 2000, 0);
    createFloatingAnimation(bitcoinAnimation, 1800, 500);
    createFloatingAnimation(dollarAnimation, 2200, 1000);
    createFloatingAnimation(asteriskAnimation, 1900, 1500);
  }, [
    cloud1Animation,
    cloud2Animation,
    cloud3Animation,
    handPhoneAnimation,
    bitcoinAnimation,
    dollarAnimation,
    asteriskAnimation,
    screenWidth,
  ]);

  return (
    <Box flex={1}>
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
          <CustomText variant="header" color="white" fontSize={40}>
            Your Funds,
          </CustomText>
          <CustomText variant="header" mb="m" color="white" fontSize={40}>
            Your Wallet
          </CustomText>
          <CustomButton
            text="Get Started"
            trailingIcon={
              <Image
                source={icons.arrowRight}
                style={{ width: 20, height: 20 }}
              />
            }
            bgColor="white"
            color={theme.colors.primaryColor}
            borderRadius={55}
            height={55}
            shouldVibrate
            onPress={() => router.push("/select-track")}
          />
        </ImageBackground>
      </LinearGradient>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 50,
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

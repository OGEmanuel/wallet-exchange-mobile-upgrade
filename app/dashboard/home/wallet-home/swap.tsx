import { ThemedLinkExternalIcon } from "@/assets/svg/wallet-icons-components";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ArrowUpDown, ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, TouchableOpacity } from "react-native";

// Create animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBox = Animated.createAnimatedComponent(Box);

const Swap = () => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = React.useState<"EXCHANGE" | "WALLET">(
    "EXCHANGE"
  );

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);

  // Animated values for entrance animations
  const sellContainerAnim = useRef(new Animated.Value(0)).current;
  const receiveContainerAnim = useRef(new Animated.Value(0)).current;

  // Animated values for swap button
  const swapButtonScale = useRef(new Animated.Value(1)).current;
  const swapButtonRotation = useRef(new Animated.Value(0)).current;
  const swapButtonPosition = useRef(new Animated.Value(0)).current;

  // Animated values for card swapping
  const sellCardY = useRef(new Animated.Value(0)).current;
  const receiveCardY = useRef(new Animated.Value(0)).current;

  // Animated values for currency buttons
  const currencyButtonScale = useRef(new Animated.Value(1)).current;

  // Shake animation values
  const sellCardShakeX = useRef(new Animated.Value(0)).current;
  const receiveCardShakeX = useRef(new Animated.Value(0)).current;

  // For controlling the periodic animation of the swap button
  const buttonAnimInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Animation for button bounce
  const animateButtonUpDown = useCallback(() => {
    Animated.sequence([
      Animated.timing(swapButtonPosition, {
        toValue: -4,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 4,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: -4,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 4,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 0,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [swapButtonPosition]);

  // Initialize entrance animations
  useEffect(() => {
    // Initial mount animations
    Animated.timing(sellContainerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Stagger the animations
    setTimeout(() => {
      Animated.timing(receiveContainerAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 200);

    // Start the periodic animation for the swap button
    animateButtonUpDown();

    // Set interval for subsequent animations
    const intervalId = setInterval(() => {
      if (!isAnimating) {
        animateButtonUpDown();
      }
    }, 5000);

    buttonAnimInterval.current = intervalId;

    // Cleanup on unmount
    return () => {
      if (buttonAnimInterval.current) {
        clearInterval(buttonAnimInterval.current);
        buttonAnimInterval.current = null;
      }
    };
  }, [
    sellContainerAnim,
    receiveContainerAnim,
    animateButtonUpDown,
    isAnimating,
  ]);

  // Simplified and more reliable card swapping animation
  const animateCardSwap = () => {
    setIsAnimating(true);
    // Reset positions first
    sellCardY.setValue(0);
    receiveCardY.setValue(0);

    // Simple and reliable swap animation
    Animated.parallel([
      // Button rotation
      Animated.timing(swapButtonRotation, {
        toValue: rotationDegree,
        duration: 400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),

      // Card 1 moves down
      Animated.sequence([
        // First up slightly to give bounce effect
        Animated.timing(sellCardY, {
          toValue: -10,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Then down past final position
        Animated.timing(sellCardY, {
          toValue: 130,
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // Settle at final position with slight bounce
        Animated.timing(sellCardY, {
          toValue: 124,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Card 2 moves up
      Animated.sequence([
        // First down slightly to give bounce effect
        Animated.timing(receiveCardY, {
          toValue: 10,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Then up past final position
        Animated.timing(receiveCardY, {
          toValue: -130,
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // Settle at final position with slight bounce
        Animated.timing(receiveCardY, {
          toValue: -124,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Reset the animation values after swap
      sellCardY.setValue(0);
      receiveCardY.setValue(0);

      setIsAnimating(false);

      // Restart periodic button animation
      if (buttonAnimInterval.current) {
        clearInterval(buttonAnimInterval.current);
      }
      startPeriodicButtonAnimation();
    });
  };

  // Periodic animation for the swap button (every 5 seconds)
  const startPeriodicButtonAnimation = () => {
    // Initial bounce when component mounts
    animateButtonUpDown();

    // Clear any existing interval
    if (buttonAnimInterval.current) {
      clearInterval(buttonAnimInterval.current);
    }

    // Set interval for subsequent animations
    const intervalId = setInterval(() => {
      if (!isAnimating) {
        animateButtonUpDown();
      }
    }, 5000);

    buttonAnimInterval.current = intervalId;
  };

  // Swap button animation handler
  const handleSwapPress = () => {
    // Prevent multiple animations from running simultaneously
    if (isAnimating) {
      return;
    }

    // Reset interval to make button still during swap animation
    if (buttonAnimInterval.current) {
      clearInterval(buttonAnimInterval.current);
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(swapButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Update rotation state
    const newRotation = rotationDegree + 180;
    setRotationDegree(newRotation);

    // Start card swap animation
    animateCardSwap();
  };

  // Currency button press animation
  const handleCurrencyPress = () => {
    Animated.sequence([
      Animated.timing(currencyButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(currencyButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to trigger shake animation
  const triggerShakeAnimation = (animatedValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animated styles
  const sellContainerStyle = {
    opacity: sellContainerAnim,
    transform: [{ translateY: sellCardY }, { translateX: sellCardShakeX }],
    zIndex: 1,
  };

  const receiveContainerStyle = {
    opacity: receiveContainerAnim,
    transform: [
      { translateY: receiveCardY },
      { translateX: receiveCardShakeX },
    ],
    zIndex: 2,
  };

  const swapButtonStyle = {
    transform: [
      { scale: swapButtonScale },
      {
        rotate: swapButtonRotation.interpolate({
          inputRange: [0, 360],
          outputRange: ["0deg", "360deg"],
        }),
      },
      { translateY: swapButtonPosition },
    ],
    elevation: 5, // Android elevation
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  };

  const currencyButtonStyle = {
    transform: [{ scale: currencyButtonScale }],
  };

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>
        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

        <Box marginBottom="s" mt="m" position="relative">
          <AnimatedBox
            width={"100%"}
            height={105}
            borderRadius={12}
            backgroundColor="modalBackgroundColor"
            p="m"
            justifyContent="space-between"
            style={sellContainerStyle}
          >
            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="medium">0.009</CustomText>
              <AnimatedTouchableOpacity
                style={currencyButtonStyle}
                onPress={handleCurrencyPress}
              >
                <CustomButton
                  width={107}
                  height={36}
                  borderRadius={36}
                  bgColor={theme.colors.mainBackgroundColor}
                  text="BUSD"
                  fontSize={12}
                  onPress={() => {}}
                  leadingIcon={
                    <Image
                      source={require("@/assets/images/btc.png")}
                      style={{ width: 20, height: 20, marginRight: 5 }}
                    />
                  }
                  trailingIcon={
                    <ChevronDown
                      color={theme.colors.bodyTextColor}
                      size={12}
                      style={{ marginLeft: 5 }}
                    />
                  }
                />
              </AnimatedTouchableOpacity>
            </Box>

            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mt="s"
            >
              <CustomText variant="medium">0.009</CustomText>
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <CustomText fontSize={12} variant="body" marginRight="s">
                  Bal: 20BNB
                </CustomText>
                <CustomButton
                  width={50}
                  height={25}
                  borderRadius={36}
                  bgColor={theme.colors.white}
                  color="black"
                  text="MAX"
                  fontSize={12}
                  onPress={() => {}}
                />
              </Box>
            </Box>
          </AnimatedBox>
        </Box>

        <Box>
          <AnimatedBox
            width={"100%"}
            height={105}
            borderRadius={12}
            backgroundColor="modalBackgroundColor"
            p="m"
            justifyContent="center"
            style={receiveContainerStyle}
          >
            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="medium">30,027,060.88</CustomText>
              <AnimatedTouchableOpacity
                style={currencyButtonStyle}
                onPress={handleCurrencyPress}
              >
                <CustomButton
                  width={107}
                  height={36}
                  borderRadius={36}
                  bgColor={theme.colors.mainBackgroundColor}
                  text="BUSD"
                  fontSize={12}
                  onPress={() => {}}
                  leadingIcon={
                    <Image
                      source={require("@/assets/images/btc.png")}
                      style={{ width: 20, height: 20, marginRight: 5 }}
                    />
                  }
                  trailingIcon={
                    <ChevronDown
                      color={theme.colors.bodyTextColor}
                      size={12}
                      style={{ marginLeft: 5 }}
                    />
                  }
                />
              </AnimatedTouchableOpacity>
            </Box>

            <CustomText variant="body" mt="s">
              $180
            </CustomText>
          </AnimatedBox>

          <AnimatedPressable
            style={[
              swapButtonStyle,
              {
                position: "absolute",
                left: "50%",
                marginLeft: -25, // Half of button width (50/2)
                top: -25, // Half of button height (50/2)
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.colors.mainBackgroundColor,
                justifyContent: "center",
                alignItems: "center",
                padding: 8,
                zIndex: 10,
              },
            ]}
            onPress={handleSwapPress}
          >
            <Box
              width={"100%"}
              height={"100%"}
              borderRadius={50}
              backgroundColor="secondaryBackgroundColor"
              justifyContent="center"
              alignItems="center"
            >
              <TouchableOpacity onPress={handleSwapPress}>
                <ArrowUpDown color={theme.colors.bodyTextColor} size={20} />
              </TouchableOpacity>
            </Box>
          </AnimatedPressable>
        </Box>

        <Box
          marginVertical="m"
          width={"100%"}
          borderRadius={10}
          borderWidth={2}
          borderColor="borderColor"
          height={150}
          p="m"
        >
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Provider
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <ThemedLinkExternalIcon
                darkModeColor={theme.colors.bodyTextColor}
                lightModeColor={theme.colors.bodyTextColor}
                width={15}
                height={15}
              />
              <Image
                source={require("@/assets/images/btc.png")}
                style={{ width: 20, height: 20, marginHorizontal: 5 }}
                contentFit="cover"
              />
              <CustomText variant="body" fontSize={12}>
                Zap exchange
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12} color="bodyTextColor">
              Zap Fee
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText
                variant="bodyMedium"
                fontSize={12}
                color="headerTextColor"
              >
                $0.009
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Rate
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="bodyMedium" fontSize={12}>
                1BNB = 500 USDC
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Minimium Received
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="bodyMedium" fontSize={12}>
                327,060.88 NGN
              </CustomText>
            </Box>
          </Box>
          <Box alignItems="center" width={"100%"}>
            <CustomButton
              trailingIcon={<ChevronDown color={"white"} size={15} />}
              width={120}
              height={22}
              borderRadius={22}
              onPress={() => {}}
              text="Show Less"
              fontSize={12}
              bgColor={theme.colors.secondaryBackgroundColor}
            />
          </Box>
          BB
        </Box>
        <CustomButton
          text="Continue"
          fontSize={14}
          width={"100%"}
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={() => {}}
        />
      </Box>
    </PageWrapper>
  );
};

export default Swap;

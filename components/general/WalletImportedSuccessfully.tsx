import React, { useRef, useEffect } from "react";
import Box from "../general/Box";
import { Image } from "expo-image";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import useActiveTheme from "@/hooks/useTheme";
import { Dimensions, Animated } from "react-native";
import ConfettiCannon from "react-native-confetti";

const { width } = Dimensions.get("window");

const WalletImportSuccessfullyPage = ({
  onContinue,
}: {
  onContinue: () => void;
}) => {
  const theme = useTheme<Theme>();
  const { colorTheme: activeTheme } = useActiveTheme();

  // Animation values for each card
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;

  // Animation values for chain icons
  const chainIcon1Anim = useRef(new Animated.Value(0)).current; // arb
  const chainIcon2Anim = useRef(new Animated.Value(0)).current; // op
  const chainIcon3Anim = useRef(new Animated.Value(0)).current; // bnb
  const chainIcon4Anim = useRef(new Animated.Value(0)).current; // eth
  const chainIcon5Anim = useRef(new Animated.Value(0)).current; // btc
  
  // Confetti ref
  const confettiRef = useRef<any>(null);
  const confettiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset all animations to 0 when modal opens
    card1Anim.setValue(0);
    card2Anim.setValue(0);
    card3Anim.setValue(0);
    card4Anim.setValue(0);
    chainIcon1Anim.setValue(0);
    chainIcon2Anim.setValue(0);
    chainIcon3Anim.setValue(0);
    chainIcon4Anim.setValue(0);
    chainIcon5Anim.setValue(0);

    // Staggered animation sequence
    const animations = [
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 200,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 200,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(card4Anim, {
        toValue: 1,
        duration: 200,
        delay: 600,
        useNativeDriver: true,
      }),
    ];

    // Start all animations
    Animated.parallel(animations).start(() => {
      // Start chain icon animations after cards complete
      const chainAnimations = [
        Animated.timing(chainIcon1Anim, {
          toValue: 1,
          duration: 300,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(chainIcon2Anim, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(chainIcon3Anim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(chainIcon4Anim, {
          toValue: 1,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(chainIcon5Anim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: true,
        }),
      ];

      Animated.parallel(chainAnimations).start();
    });

    // Start continuous confetti animation
    const startContinuousConfetti = () => {
      if (confettiRef.current) {
        confettiRef.current.startConfetti();
      }
    };

    // Start confetti immediately
    startContinuousConfetti();

    // Set up interval to restart confetti every 10 seconds (before the 12-second duration ends)
    confettiIntervalRef.current = setInterval(startContinuousConfetti, 10000);

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
    };
  }, [
    card1Anim,
    card2Anim,
    card3Anim,
    card4Anim,
    chainIcon1Anim,
    chainIcon2Anim,
    chainIcon3Anim,
    chainIcon4Anim,
    chainIcon5Anim,
  ]);

  return (
    <Box flex={1} p="m" backgroundColor="mainBackgroundColor">
      <Box flex={1} justifyContent="center">
        {/* Confetti Background */}
        <ConfettiCannon
          ref={confettiRef}
          confettiCount={400}
          duration={12000}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
          size={1}
          bsize={1}
        />

        {/* Main Content */}
        <Box flex={1} padding="m" justifyContent="center" alignItems="center">
          {/* Wallet Created Text */}
          <Box alignItems="center" flexDirection="row" mb="xl">
            <CustomText variant="header" fontSize={32}>
              Wallet Created!
            </CustomText>
            <CustomText fontSize={24} ml="s">
              🎉
            </CustomText>
          </Box>

          {/* Stacked Wallet Cards */}
          <Box alignItems="center" mb="xl">
            {/* Bottom Card (peeking from left) */}
            <Animated.View
              style={{
                position: "absolute",
                top: -55,
                opacity: card1Anim,
                transform: [
                  {
                    translateY: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/images/wallet-created/wallet-card-background.png")}
                style={{
                  width: width * 0.6,
                  height: 280,
                  resizeMode: "contain",
                  borderRadius: 20,
                }}
              />
            </Animated.View>

            {/* Second Card */}
            <Animated.View
              style={{
                position: "absolute",
                top: -40,
                opacity: card2Anim,
                transform: [
                  {
                    translateY: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/images/wallet-created/wallet-card-middle.png")}
                style={{
                  width: width * 0.7,
                  height: 280,
                  resizeMode: "contain",
                  borderRadius: 20,
                }}
              />
            </Animated.View>

            {/* Third Card */}
            <Animated.View
              style={{
                position: "absolute",
                top: -20,
                opacity: card3Anim,
                transform: [
                  {
                    translateY: card3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/images/wallet-created/wallet-card-front.png")}
                style={{
                  width: width * 0.8,
                  height: 280,
                  resizeMode: "contain",
                  borderRadius: 20,
                }}
              />
            </Animated.View>

            {/* Main Card */}
            <Animated.View
              style={{
                position: "relative",
                opacity: card4Anim,
                transform: [
                  {
                    translateY: card4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/images/wallet-created/wallet-card-main.png")}
                style={{
                  width: width * 0.9,
                  height: 280,
                  resizeMode: "contain",
                  borderRadius: 20,
                }}
              />
              <CustomText 
                color="black" 
                variant="header" 
                fontSize={16} 
                style={{ position: "absolute", top: 80, left: 10 }}
                >
                Wallet Name
              </CustomText>

              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 65,
                  left: width * 0.6,
                  opacity: chainIcon1Anim,
                  transform: [
                    {
                      scale: chainIcon1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: chainIcon1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={require("@/assets/images/wallet-created/chains/arb.png")}
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: "contain",
                  }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 65,
                  left: width * 0.65,
                  opacity: chainIcon2Anim,
                  transform: [
                    {
                      scale: chainIcon2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: chainIcon2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={require("@/assets/images/wallet-created/chains/op.png")}
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: "contain",
                  }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 65,
                  left: width * 0.7,
                  opacity: chainIcon3Anim,
                  transform: [
                    {
                      scale: chainIcon3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: chainIcon3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={require("@/assets/images/wallet-created/chains/bnb.png")}
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: "contain",
                  }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 65,
                  left: width * 0.75,
                  opacity: chainIcon4Anim,
                  transform: [
                    {
                      scale: chainIcon4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: chainIcon4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={require("@/assets/images/wallet-created/chains/eth.png")}
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: "contain",
                  }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 65,
                  left: width * 0.8,
                  opacity: chainIcon5Anim,
                  transform: [
                    {
                      scale: chainIcon5Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: chainIcon5Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={require("@/assets/images/wallet-created/chains/btc.png")}
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: "contain",
                  }}
                />
              </Animated.View>
            </Animated.View>
          </Box>
        </Box>
      </Box>
      <Box width="100%" height={60} justifyContent="center" mb="m">
        {/* <Pressable
          onPress={(e) => {
            e?.stopPropagation();
            onContinue();
          }}
        > */}
          <CustomButton
            width={"100%"}
            // height={56}
            borderRadius={56}
            text="Continue"
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={() => { 
            onContinue();
            }}
          />
        {/* </Pressable> */}
      </Box>
    </Box>
  );
};

export default WalletImportSuccessfullyPage;

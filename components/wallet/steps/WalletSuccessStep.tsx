import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { WalletFlowData, WalletFlowType } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, TouchableWithoutFeedback } from "react-native";

interface WalletSuccessStepProps {
  walletData: WalletFlowData;
  flowType: WalletFlowType;
  onContinue: () => void;
}

const getSuccessMessage = (flowType: WalletFlowType) => {
  switch (flowType) {
    case "create":
      return {
        title: "Wallet Created Successfully!",
        subtitle: "Your new wallet is ready to use",
      };
    case "import-seed":
      return {
        title: "Wallet Imported Successfully!",
        subtitle: "Your wallet has been imported",
      };
    case "import-key":
      return {
        title: "Private Key Imported!",
        subtitle: "Your wallet has been imported",
      };
    case "watch-address":
      return {
        title: "Address Added!",
        subtitle: "You can now monitor this address",
      };
    default:
      return {
        title: "Success!",
        subtitle: "Operation completed successfully",
      };
  }
};

export const WalletSuccessStep: React.FC<WalletSuccessStepProps> = ({
  walletData,
  flowType,
  onContinue,
}) => {
  const theme = useTheme<Theme>();
  const { title } = getSuccessMessage(flowType);
  const { width } = Dimensions.get("window");

  // Animation values
  const confettiAnimations = useRef(
    Array.from({ length: 80 }, () => new Animated.Value(0))
  ).current;
  const cardStackAnimation = useRef(new Animated.Value(0)).current;
  const cardSpreadAnimation = useRef(new Animated.Value(0)).current;
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

  // Automatically navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  // Start animations
  useEffect(() => {
    // Confetti animation
    confettiAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000 + index * 100,
        useNativeDriver: true,
      }).start();
    });

    // Cards enter with fan spread motion
    const cardEnterSequence = Animated.parallel([
      // Cards slide up and spread simultaneously
      Animated.timing(cardStackAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(cardSpreadAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    cardEnterSequence.start();

    // Fade in animation
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Generate confetti pieces
  const confettiPieces = confettiAnimations.map((anim, index) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    const color = colors[index % colors.length];
    const startX = Math.random() * width;
    const rotation = Math.random() * 360;

    return (
      <Animated.View
        key={index}
        style={{
          position: "absolute",
          left: startX,
          top: -50,
          width: 8,
          height: 8,
          backgroundColor: color,
          pointerEvents: "none",
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1200],
              }),
            },
            {
              rotate: `${rotation}deg`,
            },
          ],
        }}
      />
    );
  });

  return (
    <TouchableWithoutFeedback onPress={() => onContinue()}>
      <LinearGradient
        colors={["#1f232d", "#2a2d3a", "#393181"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Confetti Animation */}
        {confettiPieces}

        {/* Success Text */}
        <Animated.View
          style={{
            opacity: fadeInAnimation,
            transform: [
              {
                translateY: fadeInAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, -40],
                }),
              },
            ],
            marginTop: 80,
          }}
        >
          <CustomText
            variant="header"
            fontSize={20}
            mb="l"
            textAlign="center"
            color="white"
          >
            {title} 🎉
          </CustomText>
        </Animated.View>

        {/* Stacked Cards Animation */}
        <Animated.View
          style={{
            transform: [
              {
                translateY: cardStackAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
              {
                scale: cardStackAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
            opacity: cardStackAnimation,
            marginTop: 40,
          }}
        >
          {/* Card Stack with 4 Cards */}
          <Box
            position="relative"
            width={width * 0.8}
            height={280}
            alignItems="center"
          >
            {/* Back Card 4 (furthest back) */}
            <Animated.View
              style={{
                position: "absolute",
                top: -30,
                left: (width * 0.2) / 2,
                opacity: cardStackAnimation,
                transform: [
                  {
                    translateY: cardStackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                  {
                    translateY: cardSpreadAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15],
                    }),
                  },
                ],
              }}
            >
              <Box
                width={width * 0.6}
                height={200}
                borderRadius={16}
                style={{
                  backgroundColor: "#FAFFE5",
                }}
              />
            </Animated.View>

            {/* Back Card 3 */}
            <Animated.View
              style={{
                position: "absolute",
                top: -20,
                left: (width * 0.1) / 2,
                opacity: cardStackAnimation,
                transform: [
                  {
                    translateY: cardStackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                  {
                    translateY: cardSpreadAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    }),
                  },
                ],
              }}
            >
              <Box
                width={width * 0.7}
                height={200}
                borderRadius={16}
                style={{
                  backgroundColor: "#F5FFCE",
                }}
              />
            </Animated.View>

            {/* Back Card 2 */}
            <Animated.View
              style={{
                position: "absolute",
                top: -10,
                left: (width * 0.05) / 2,
                opacity: cardStackAnimation,
                transform: [
                  {
                    translateY: cardStackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                  {
                    translateY: cardSpreadAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                  },
                ],
              }}
            >
              <Box
                width={width * 0.75}
                height={200}
                borderRadius={16}
                style={{
                  backgroundColor: "#EAFF95",
                }}
              />
            </Animated.View>

            {/* Front Card with Gradient */}
            <Animated.View
              style={{
                opacity: cardStackAnimation,
                transform: [
                  {
                    translateY: cardStackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                  {
                    translateY: cardSpreadAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={["#DDFF55", "#138900"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  width: width * 0.8,
                  height: 200,
                  borderRadius: 16,
                  padding: 20,
                  justifyContent: "space-between",
                }}
              >
                <CustomText variant="medium" fontSize={18} color="black">
                  {walletData.name}
                </CustomText>

                <Box
                  flexDirection="row"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  <CustomText variant="medium" fontSize={24} color="black">
                    $0
                  </CustomText>
                </Box>
              </LinearGradient>
            </Animated.View>
          </Box>
        </Animated.View>

      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

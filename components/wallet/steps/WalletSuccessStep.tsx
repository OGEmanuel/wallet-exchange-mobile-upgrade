import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { PinSetupModal } from "@/components/Modals/PinSetupModal";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { WalletFlowData, WalletFlowType } from "@/src/hooks/useWalletFlow";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, TouchableWithoutFeedback, View } from "react-native";

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
  const { title } = getSuccessMessage(flowType);
  const { width } = Dimensions.get("window");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);
  const shouldNavigateRef = useRef(false);

  // Animation values
  const confettiAnimations = useRef(
    Array.from({ length: 80 }, () => new Animated.Value(0))
  ).current;
  const cardStackAnimation = useRef(new Animated.Value(0)).current;
  const cardSpreadAnimation = useRef(new Animated.Value(0)).current;
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

  // Check if PIN exists when component mounts
  useEffect(() => {
    const checkPin = async () => {
      try {
        const hasPin = await pinStorageService.hasPin();
        setHasCheckedPin(true);
        if (!hasPin) {
          // Show PIN setup modal after a short delay to let success animation play
          setTimeout(() => {
            setShowPinSetup(true);
          }, 2000);
        } else {
          // PIN exists, proceed with normal navigation
          shouldNavigateRef.current = true;
        }
      } catch (error) {
        console.error("Failed to check PIN status:", error);
        setHasCheckedPin(true);
        // On error, proceed with navigation
        shouldNavigateRef.current = true;
      }
    };
    checkPin();
  }, []);

  // Automatically navigate after 3 seconds (only if PIN exists or was skipped)
  useEffect(() => {
    if (!hasCheckedPin) return;
    
    const timer = setTimeout(() => {
      if (shouldNavigateRef.current) {
        onContinue();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue, hasCheckedPin]);

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

  const handlePinSetupComplete = () => {
    console.log("✅ PIN setup completed, proceeding to home");
    setShowPinSetup(false);
    shouldNavigateRef.current = true;
    onContinue();
  };

  const handlePinSetupClose = () => {
    console.log("⏭️ PIN setup skipped, proceeding to home");
    setShowPinSetup(false);
    shouldNavigateRef.current = true;
    onContinue();
  };

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

  const handlePress = () => {
    // Only allow navigation if PIN check is complete and modal is not showing
    if (hasCheckedPin && !showPinSetup && shouldNavigateRef.current) {
      onContinue();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handlePress}>
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
      <PinSetupModal
        visible={showPinSetup}
        onClose={handlePinSetupClose}
        onComplete={handlePinSetupComplete}
        skipIntro={false}
      />
    </View>
  );
};

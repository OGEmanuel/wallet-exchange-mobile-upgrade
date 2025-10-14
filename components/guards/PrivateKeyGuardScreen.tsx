import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import theme from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PrivateKeyGuardScreenProps {
  onContinue: () => void;
  type: "private-keys" | "seed-phrase";
}

const { height: screenHeight } = Dimensions.get("window");

const PrivateKeyGuardScreen: React.FC<PrivateKeyGuardScreenProps> = ({
  onContinue,
  type,
}) => {
  // const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [showButton, setShowButton] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [backgroundAnim] = useState(new Animated.Value(0));
  const [userScrolled, setUserScrolled] = useState(false);
  const [lastUserScrollY, setLastUserScrollY] = useState(0);
  const currentIndexRef = useRef(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const title =
    type === "private-keys"
      ? "We're about to show you your private keys"
      : "We're about to show you your seedphrase";

  const warnings =
    type === "private-keys"
      ? [
          "Never share this key",
          "If anyone learns your Private Keys, they can access and control your wallet",
          "Make sure nobody can see your screen when viewing your Private Key",
          "Even if you change your device",
          "Remember Zap will never ask you for your secret Private Keys",
        ]
      : [
          "Never share these words",
          "If anyone learns your phrase, they can access and control your wallet",
          "Backing up your secret recovery phrase helps make sure you can always access your assets",
          "Even if you change your device",
          "Remember Zap will never ask you for your secret recovery phrase",
        ];

  const buttonText =
    type === "private-keys" ? "Show Private Keys" : "Show Seed Phrase";

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        setLastUserScrollY(currentScrollY);
        setUserScrolled(true);
      }
    }
  );

  const handleScrollEnd = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 300;
    if (isAtBottom) setShowButton(isAtBottom);
  };

  // Background animation effect
  useEffect(() => {
    // Animate background from primary to orange gradient
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 2000, // 2 seconds to transition
      useNativeDriver: false,
    }).start();
  }, [backgroundAnim]);

  // Step-by-step animation effect
  useEffect(() => {
    const timePerWarning = 3000; // 3 seconds per warning

    const animateStep = () => {
      if (currentIndexRef.current < warnings.length + 1) {
        // Check if user has scrolled past this warning
        const targetY = currentIndexRef.current * 80;
        const userHasScrolledPast = lastUserScrollY > targetY + 40; // 40px buffer
        
        if (!userHasScrolledPast) {
          // Only auto-scroll if user hasn't passed this warning
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: targetY,
              animated: true,
            });
          }

          // Animate scrollY for interpolations
          Animated.timing(scrollY, {
            toValue: targetY,
            duration: 800, // Smooth transition to warning
            useNativeDriver: false,
          }).start();
        }

        // Move to next warning after pause
        currentIndexRef.current++;
        
        // Show button when we reach the last warning
        if (currentIndexRef.current === warnings.length -1) {
          setShowButton(true);
        }
        
        animationTimeoutRef.current = setTimeout(animateStep, timePerWarning);
      } else {
        // All warnings shown, show button
        setShowButton(true);
      }
    };

    // Reset index and start animation
    currentIndexRef.current = 0;
    animationTimeoutRef.current = setTimeout(animateStep, 1500);
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [scrollY, warnings.length]);

  // Update current line based on scroll position
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const lineIndex = Math.floor(value / 80); // Keep your earlier switching
      const newLine = Math.min(Math.max(0, lineIndex), warnings.length - 1);
      setCurrentLine(newLine);
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, warnings.length]);

  // Pulsing effect for active line
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleBack = () => {
    router.back();
  };

  return (
    <Box flex={1}>
      {/* Primary background that fades out */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primaryColor,
          opacity: backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
      />

      {/* Orange gradient that fades in */}
      <Animated.View
        style={{
          flex: 1,
          opacity: backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        }}
      >
        <LinearGradient colors={["#8B5CF6", "#E65100"]} style={{ flex: 1 }}>
          {/* Status Bar Spacer */}
          <Box style={{ height: insets.top }} />

          {/* Header */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="m"
            paddingVertical="m"
          >
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 8,
              })}
            >
              <X size={24} color="white" />
            </Pressable>
          </Box>

          {/* Scrollable Content */}
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
              minHeight: screenHeight * 1.5, // Ensure enough content to scroll
            }}
          >
            <Box paddingHorizontal="l" paddingTop="xl">
              {/* Title */}
              <Animated.View
                style={{
                  opacity: scrollY.interpolate({
                    inputRange: [0, 150],
                    outputRange: [1, 0.1],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [0, 150],
                        outputRange: [0, -50],
                        extrapolate: "clamp",
                      }),
                    },
                    {
                      scale: scrollY.interpolate({
                        inputRange: [0, 150],
                        outputRange: [1, 0.8],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                }}
              >
                <CustomText
                  variant="header"
                  fontSize={32}
                  color="white"
                  textAlign="center"
                  marginBottom="2xl"
                  fontWeight="bold"
                  lineHeight={40}
                >
                  {title}
                </CustomText>
              </Animated.View>

              {/* Warnings */}
              {[...warnings, ""].map((warning, index) => {
                const isActive = currentLine === index;
                const isPast = currentLine > index;
                const isFuture = currentLine < index;

                // Create animated values for smooth transitions
                const fontSize = scrollY.interpolate({
                  inputRange: [index * 80, (index + 1) * 80],
                  outputRange: [20, 24],
                  extrapolate: "clamp",
                });

                const lineHeight = scrollY.interpolate({
                  inputRange: [index * 80, (index + 1) * 80],
                  outputRange: [32, 36],
                  extrapolate: "clamp",
                });

                const opacity = scrollY.interpolate({
                  inputRange: [index * 80, (index + 1) * 80, (index + 2) * 80],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                });

                const scale = scrollY.interpolate({
                  inputRange: [index * 80, (index + 1) * 80],
                  outputRange: [0.9, 1.1],
                  extrapolate: "clamp",
                });

                const shadowOpacity = scrollY.interpolate({
                  inputRange: [index * 80, (index + 1) * 80],
                  outputRange: [0, 0.8],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={index}
                    style={{
                      opacity,
                      transform: [{ scale }],
                      paddingHorizontal: 20, // Add padding to prevent text from leaving screen
                      marginBottom: 40, // More spacing between lines
                    }}
                  >
                    <Animated.Text
                      style={{
                        fontSize,
                        color: "white",
                        textAlign: "center",
                        lineHeight,
                        fontWeight: isActive ? "bold" : "600",
                        textShadowColor: shadowOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            "transparent",
                            "rgba(255, 255, 255, 0.8)",
                          ],
                        }),
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: shadowOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 10],
                        }),
                        flexWrap: "wrap", // Allow text wrapping
                        maxWidth: "100%", // Prevent overflow
                      }}
                    >
                      {warning}
                    </Animated.Text>
                  </Animated.View>
                );
              })}

              {/* Spacer for button */}
              <Box height={screenHeight * 0.4} />
            </Box>
          </ScrollView>

          {/* Continue Button */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: insets.bottom + 30,
              left: 20,
              right: 20,
              opacity: showButton ? 1 : 0,
              transform: [
                {
                  translateY: showButton ? 0 : 100,
                },
                {
                  scale: showButton ? 1 : 0.8,
                },
              ],
            }}
          >
            <CustomButton
              text={buttonText}
              onPress={onContinue}
              trailingIcon={
                <ThemedFaceIDIcon
                  darkModeColor={theme.colors.error}
                  lightModeColor={theme.colors.error}
                  style={{ marginLeft: 8 }}
                />
              }
              color={theme.colors.error}
              bgColor={theme.colors.white}
              width="100%"
              borderRadius={30}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Box>
  );
};

export default PrivateKeyGuardScreen;

import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

export const useSwapAnimations = () => {
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

  // Shake animation values (for future use)
  const sellCardShakeX = useRef(new Animated.Value(0)).current;
  const receiveCardShakeX = useRef(new Animated.Value(0)).current;

  // For controlling the periodic animation of the swap button
  const buttonAnimInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Animation for button bounce with subtle pulse
  const animateButtonUpDown = useCallback(() => {
    Animated.sequence([
      Animated.timing(swapButtonPosition, {
        toValue: -3,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 3,
        duration: 80,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: -2,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 2,
        duration: 80,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonPosition, {
        toValue: 0,
        duration: 80,
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
  const animateCardSwap = useCallback(() => {
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
  }, [
    rotationDegree,
    swapButtonRotation,
    sellCardY,
    receiveCardY,
    buttonAnimInterval,
    startPeriodicButtonAnimation,
  ]);

  // Periodic animation for the swap button (every 5 seconds)
  const startPeriodicButtonAnimation = useCallback(() => {
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
  }, [animateButtonUpDown, isAnimating]);

  // Swap button animation handler
  const handleSwapPress = useCallback(() => {
    // Prevent multiple animations from running simultaneously
    if (isAnimating) {
      return;
    }

    // Reset interval to make button still during swap animation
    if (buttonAnimInterval.current) {
      clearInterval(buttonAnimInterval.current);
    }

    // Button press animation with enhanced feedback
    Animated.sequence([
      Animated.timing(swapButtonScale, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonScale, {
        toValue: 1.15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Update rotation state
    const newRotation = rotationDegree + 180;
    setRotationDegree(newRotation);

    // Start card swap animation
    animateCardSwap();
  }, [isAnimating, swapButtonScale, rotationDegree, animateCardSwap]);

  // Currency button press animation
  const handleCurrencyPress = useCallback(() => {
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
  }, [currencyButtonScale]);

  // Function to trigger shake animation (for future use)
  const triggerShakeAnimation = useCallback((animatedValue: Animated.Value) => {
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
  }, []);

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

  return {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    currencyButtonStyle,
    handleSwapPress,
    handleCurrencyPress,
    triggerShakeAnimation,
  };
};

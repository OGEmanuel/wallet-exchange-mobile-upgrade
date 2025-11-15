import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useCallback, useImperativeHandle } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { Box, CustomText } from "../general";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AnimatedGradientBottomSheetProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  showGradientHandle?: boolean;
  gradientColors?: string[];
  backgroundColor?: string;
  locations?: number[];
  onClose?: () => void;
}

export interface AnimatedGradientBottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

const AnimatedGradientBottomSheet = forwardRef<
  AnimatedGradientBottomSheetRef,
  AnimatedGradientBottomSheetProps
>(
  (
    {
      children,
      title,
      subtitle,
      snapPoints = ["100%"],
      enablePanDownToClose = true,
      showGradientHandle = true,
      gradientColors = [] as const,
      backgroundColor = "rgba(0,0,0,0.5)",
      locations = [0, 0.6, 1],
      onClose,
    },
    ref
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });
    const isOpen = useSharedValue(false);
    const backdropOpacity = useSharedValue(0);

    const snapPointsArray = snapPoints.map((point) => {
      const percentage = parseFloat(point.replace("%", ""));
      return (SCREEN_HEIGHT * percentage) / 100;
    });

    const open = useCallback(() => {
      "worklet";
      // For 100% snap point, position at the top of the screen
      const targetY =
        snapPointsArray[0] === SCREEN_HEIGHT
          ? 0
          : SCREEN_HEIGHT - snapPointsArray[0];
      translateY.value = withTiming(targetY, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      isOpen.value = true;
    }, [snapPointsArray]);

    const close = useCallback(() => {
      "worklet";
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
      isOpen.value = false;
      if (onClose) {
        runOnJS(onClose)();
      }
    }, [onClose]);

    const snapToIndex = useCallback(
      (index: number) => {
        "worklet";
        if (index < 0) {
          close();
        } else {
          const targetY = SCREEN_HEIGHT - snapPointsArray[index];
          translateY.value = withTiming(targetY, { duration: 300 });
          backdropOpacity.value = withTiming(1, { duration: 300 });
          isOpen.value = true;
        }
      },
      [snapPointsArray, close, translateY, backdropOpacity, isOpen]
    );

    useImperativeHandle(ref, () => ({
      open,
      close,
      snapToIndex,
    }));


    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        if (enablePanDownToClose) {
          translateY.value = Math.max(0, context.value.y + event.translationY);
        }
      })
      .onEnd((event) => {
        const shouldClose = event.translationY > 100 || event.velocityY > 500;

        if (shouldClose && enablePanDownToClose) {
          close();
        } else {
          // Snap to nearest snap point
          const currentY = translateY.value;
          const targetIndex = snapPointsArray.findIndex((point, index) => {
            const pointY = SCREEN_HEIGHT - point;
            const nextPointY =
              index < snapPointsArray.length - 1
                ? SCREEN_HEIGHT - snapPointsArray[index + 1]
                : 0;
            return currentY >= pointY && currentY <= nextPointY;
          });

          const targetY =
            targetIndex >= 0 ? SCREEN_HEIGHT - snapPointsArray[targetIndex] : 0;

          translateY.value = withTiming(targetY, { duration: 300 });
        }
      });

    const animatedSheetStyle = useAnimatedStyle(() => {
      const isVisible = translateY.value < SCREEN_HEIGHT - 10; // 10px threshold for closed
      return {
        transform: [{ translateY: translateY.value }],
        pointerEvents: isVisible ? ("auto" as const) : ("none" as const),
        // Move completely off-screen when closed to prevent any interference
        top: isVisible ? 0 : SCREEN_HEIGHT * 2,
      };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => {
      const isVisible = translateY.value < SCREEN_HEIGHT - 10; // 10px threshold for closed
      return {
        opacity: backdropOpacity.value,
        pointerEvents: isVisible ? ("auto" as const) : ("none" as const),
        // Move completely off-screen when closed to prevent any interference
        top: isVisible ? 0 : SCREEN_HEIGHT * 2,
      };
    });

    const animatedHandleStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateY.value,
        [SCREEN_HEIGHT - 100, SCREEN_HEIGHT - 50],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        opacity,
      };
    });

    const handleBackdropPress = useCallback(() => {
      if (enablePanDownToClose) {
        close();
      }
    }, [close, enablePanDownToClose]);

    return (
      <>
        <Animated.View 
          style={[styles.backdrop, animatedBackdropStyle]}
          collapsable={false}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View 
            style={[styles.container, animatedSheetStyle]}
            pointerEvents="box-none"
          >
            <LinearGradient
              colors={gradientColors as any}
              locations={[0, 0.25, 1] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              {showGradientHandle && (
                <Animated.View
                  style={[styles.handleContainer, animatedHandleStyle]}
                >
                  <View style={styles.handle} />
                </Animated.View>
              )}

              <Box style={styles.content}>
                {title && (
                  <CustomText
                    variant="header"
                    fontSize={24}
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                    mb="s"
                  >
                    {title}
                  </CustomText>
                )}

                {subtitle && (
                  <CustomText
                    variant="body"
                    fontSize={16}
                    color="white"
                    textAlign="center"
                    mb="l"
                    style={{ opacity: 0.8 }}
                  >
                    {subtitle}
                  </CustomText>
                )}

                {children}
              </Box>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);

AnimatedGradientBottomSheet.displayName = "AnimatedGradientBottomSheet";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradientContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default AnimatedGradientBottomSheet;

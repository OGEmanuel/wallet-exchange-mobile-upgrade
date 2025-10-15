import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing } from "react-native";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("screen");

const MIN_SCALE = 0.92;
const MAX_SCALE = 1.08;

const Cards = () => {
  const scaleAnim = useRef(new Animated.Value(MIN_SCALE)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: MAX_SCALE,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: MIN_SCALE,
        duration: 500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <PageWrapper>
      <Box flex={1}>
        <Box width={"100%"} mt="l" alignItems="center">
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image
              source={require("@/assets/images/cardsnew.png")}
              contentFit="contain"
              style={{ width: 500, height: HEIGHT * 0.38 }}
            />
          </Animated.View>
        </Box>

        <Box width={"100%"} alignItems="center" mt="l">
          <CustomText
            variant="bodySubheader"
            textAlign="center"
            style={{ width: WIDTH * 0.8 }}
            fontSize={28}
          >
            {" "}
            Spend IRL with the{" "}
            <CustomText
              color="tabBarActiveColor"
              fontSize={28}
              variant="bodySubheader"
            >
              famous
            </CustomText>{" "}
            Zap Card{" "}
          </CustomText>
          <CustomText
            variant="bodyMedium"
            mt="m"
            style={{ width: WIDTH * 0.8 }}
            textAlign="center"
          >
            Experience freedom with the famous Zap card. Spend, bay and shop
            anywhere.
          </CustomText>

          <Box height={100} />

          <CustomButton
            borderRadius={50}
            text="Get Card"
            onPress={() => {}}
            width={WIDTH * 0.4}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default Cards;

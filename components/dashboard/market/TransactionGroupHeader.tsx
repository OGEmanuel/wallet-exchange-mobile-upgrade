import React from "react";
import { Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const TransactionGroupHeader: React.FC<{ label: string }> = ({ label }) => (
  <Animated.View
    entering={FadeIn.duration(400)}
    className="w-full bg-background h-[24px] items-center px-[16px] flex-row"
  >
    <Text>{label}</Text>
  </Animated.View>
);

export default TransactionGroupHeader;

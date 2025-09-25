import React from "react";
import { View } from "react-native";

interface AnimatedTabContentProps {
  active: boolean;
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  containerHeight?: number;
}

export default function AnimatedTabContent({
  active,
  firstContent,
  secondContent,
  containerHeight = 400,
}: AnimatedTabContentProps) {
  return (
    <View style={{ height: containerHeight }}>
      {active ? firstContent : secondContent}
    </View>
  );
}

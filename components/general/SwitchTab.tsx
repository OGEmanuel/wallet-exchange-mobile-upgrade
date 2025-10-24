import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import { Animated, LayoutChangeEvent, Pressable, View } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface IProps {
  labels: [string, string]; // e.g. ["Exchange", "Wallet"]
  activeIndex: 0 | 1;
  onPress: (index: 0 | 1) => void;
}

const SwitchTab = ({ labels, activeIndex, onPress }: IProps) => {
  const theme = useTheme<Theme>();
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;
  const containerWidth = useRef(0);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeIndex,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeIndex]);

  const handleLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
  };

  const handleTabPress = (index: 0 | 1) => {
    onPress(index);
  };

  const tabWidth = containerWidth.current / 2 || 0;

  return (
    <Box
      width="100%"
      height={40}
      bg="secondaryBackgroundColor"
      borderRadius={40}
      alignItems="center"
      flexDirection="row"
      position="relative"
      onLayout={handleLayout}
    >
      {/* Sliding background */}
      <Animated.View
        style={{
          position: "absolute",
          width: "48%",
          height: 32,
          borderRadius: 50,
          backgroundColor: theme.colors.white,
          left: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["2%", "50%"],
          }),
          top: 4,
        }}
      />

      {labels.map((label, index) => (
        <Pressable
          key={label}
          style={{ flex: 1, zIndex: 1 }}
          onPress={() => handleTabPress(index as 0 | 1)}
        >
          <View
            style={{
              width: "100%",
              height: 32,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomText
              variant="body"
              fontSize={14}
              color={activeIndex === index ? "black" : "disabledTextColor"}
            >
              {label}
            </CustomText>
          </View>
        </Pressable>
      ))}
    </Box>
  );
};

export default SwitchTab;

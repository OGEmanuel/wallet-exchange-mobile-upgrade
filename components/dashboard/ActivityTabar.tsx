import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface IProps {
  activeTab: "EXCHANGE" | "WALLET";
  onPress: (tab: "EXCHANGE" | "WALLET") => void;
}
const ActivityTabar = ({ activeTab, onPress }: IProps) => {
  const theme = useTheme<Theme>();
  const slideAnim = useRef(
    new Animated.Value(activeTab === "EXCHANGE" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "EXCHANGE" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabPress = (tab: "EXCHANGE" | "WALLET") => {
    onPress(tab);
  };
  return (
    <Box
      width={"100%"}
      height={40}
      bg="secondaryBackgroundColor"
      borderRadius={40}
      alignItems="center"
      flexDirection="row"
      px="s"
      position="relative"
    >
      {/* Sliding background */}
      <Animated.View
        style={{
          position: "absolute",
          width: "50%",
          height: 32,
          borderRadius: 50,
          backgroundColor: theme.colors.white,
          left: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["2%", "53%"],
          }),
          top: 4,
        }}
      />

      <Pressable
        style={{ width: "50%", zIndex: 0 }}
        onPress={() => {
          handleTabPress("EXCHANGE");
        }}
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
            color={activeTab === "EXCHANGE" ? "black" : "disabledTextColor"}
          >
            Exchange
          </CustomText>
        </View>
      </Pressable>
      <Pressable
        style={{ width: "50%", zIndex: 0 }}
        onPress={() => {
          handleTabPress("WALLET");
        }}
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
            color={activeTab === "WALLET" ? "black" : "disabledTextColor"}
          >
            Wallet
          </CustomText>
        </View>
      </Pressable>
    </Box>
  );
};

export default ActivityTabar;

import LottieView from "lottie-react-native";
import React from "react";
import { ViewStyle } from "react-native";
import Box from "./Box";
import CustomText from "./CustomText";

interface ZapLoaderProps {
  size?: number;
  text?: string;
  style?: ViewStyle;
  showText?: boolean;
}

const ZapLoader: React.FC<ZapLoaderProps> = ({
  size = 100,
  text = "Loading...",
  style,
  showText = true,
}) => {
  return (
    <Box alignItems="center" justifyContent="center" style={style}>
      <Box
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        marginBottom={showText ? "m" : undefined}
      >
        <LottieView
          source={require("../../assets/jsons/loader.json")}
          style={{ width: "100%", height: "100%" }}
          autoPlay
          loop
        />
      </Box>
      {showText && (
        <CustomText variant="body" color="bodyTextColor" textAlign="center">
          {text}
        </CustomText>
      )}
    </Box>
  );
};

export default ZapLoader;

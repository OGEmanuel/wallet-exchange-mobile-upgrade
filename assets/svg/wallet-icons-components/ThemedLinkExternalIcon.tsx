import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedLinkExternalIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedLinkExternalIcon: React.FC<ThemedLinkExternalIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const strokeColor = colorScheme === "dark" ? darkModeColor : lightModeColor;

  // SVG content with dynamic stroke color
  const svgContent = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="none">
      <path 
        d="M10.9998 4.49954H6.24982C4.17874 4.49954 2.49982 6.17846 2.49982 8.24954V17.7495C2.49982 19.8206 4.17874 21.4995 6.24982 21.4995H15.7498C17.8209 21.4995 19.4998 19.8206 19.4998 17.7495V12.9995M21.432 7.55474V4.34021C21.432 3.37371 20.6484 2.59021 19.6819 2.59021L16.2498 2.59028M18.2498 5.29056L10.9998 12.5406" 
        stroke="${strokeColor}" 
        stroke-linecap="round"
      />
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedLinkExternalIcon;

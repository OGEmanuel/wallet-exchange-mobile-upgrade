import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedEditIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedEditIcon: React.FC<ThemedEditIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const fillColor = colorScheme === "dark" ? darkModeColor : lightModeColor;

  // SVG with dynamic theme color
  const svgContent = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path d="M3.995 17.207V19.5C3.995 19.6326 4.04768 19.7598 4.14145 19.8535C4.23521 19.9473 4.36239 20 4.495 20H6.793C6.92535 19.9999 7.05229 19.9474 7.146 19.854L16.594 10.406L13.594 7.40597L4.142 16.854C4.04816 16.9475 3.99529 17.0745 3.995 17.207ZM14.832 6.16697L17.832 9.16697L19.292 7.70697C19.4795 7.51944 19.5848 7.26514 19.5848 6.99997C19.5848 6.73481 19.4795 6.4805 19.292 6.29297L17.707 4.70697C17.5195 4.5195 17.2652 4.41418 17 4.41418C16.7348 4.41418 16.4805 4.5195 16.293 4.70697L14.832 6.16697Z" fill="${fillColor}"/>
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedEditIcon;

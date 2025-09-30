import React from "react";
import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { SvgXml } from "react-native-svg";

interface ThemedExternalLinkIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedExternalLinkIcon: React.FC<ThemedExternalLinkIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const strokeColor = colorScheme === "dark" ? darkModeColor : lightModeColor;

  const svgContent = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <path
    d="M13.5 10.5L21 3
       M21 3H16
       M21 3V8
       M21 14V19
         C21 19.5304 20.7893 20.0391 20.4142 20.4142
         C20.0391 20.7893 19.5304 21 19 21
         H5
         C4.46957 21 3.96086 20.7893 3.58579 20.4142
         C3.21071 20.0391 3 19.5304 3 19
         V5
         C3 4.46957 3.21071 3.96086 3.58579 3.58579
         C3.96086 3.21071 4.46957 3 5 3
         H10"
    stroke="${strokeColor}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedExternalLinkIcon;

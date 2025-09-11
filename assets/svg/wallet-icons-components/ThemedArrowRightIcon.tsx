import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedArrowRightIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedArrowRightIcon: React.FC<ThemedArrowRightIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Pick color based on theme
  const strokeColor = isDark ? darkModeColor : lightModeColor;

  // SVG content
  const svgContent = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path d="M5 12H19M19 12L13 18M19 12L13 6" 
        stroke="${strokeColor}" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedArrowRightIcon;

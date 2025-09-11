import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedScanIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedScanIcon: React.FC<ThemedScanIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Select stroke color based on theme
  const strokeColor = isDark ? darkModeColor : lightModeColor;

  // SVG content with dynamic stroke color
  const svgContent = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="none">
      <path 
        d="M4 7V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8M4 17V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H8M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V7M16 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V17M5 12H19" 
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

export default ThemedScanIcon;

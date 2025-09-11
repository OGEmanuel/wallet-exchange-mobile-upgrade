import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme } from "react-native";

interface ThemedCancelIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedCancelIcon: React.FC<ThemedCancelIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Define colors for light and dark modes
  const lightColor = lightModeColor;
  const darkColor = darkModeColor;

  // Select color based on theme
  const strokeColor = isDark ? darkColor : lightColor;
  const fillColor = isDark ? darkColor : lightColor;

  // SVG content with dynamic color
  const svgContent = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M6.758 17.243L12.001 12L17.244 17.243M17.244 6.75696L12 12L6.758 6.75696" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedCancelIcon;

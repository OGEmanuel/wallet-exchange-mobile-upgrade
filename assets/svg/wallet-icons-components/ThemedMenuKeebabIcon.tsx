import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme } from "react-native";

interface ThemedMenuKeebabIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedMenuKeebabIcon: React.FC<ThemedMenuKeebabIconProps> = ({
  width = 20,
  height = 20,
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
  const svgContent = `<svg   viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M10 10.8333C10.4603 10.8333 10.8334 10.4602 10.8334 9.99996C10.8334 9.53972 10.4603 9.16663 10 9.16663C9.53978 9.16663 9.16669 9.53972 9.16669 9.99996C9.16669 10.4602 9.53978 10.8333 10 10.8333Z" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 5.00004C10.4603 5.00004 10.8334 4.62694 10.8334 4.16671C10.8334 3.70647 10.4603 3.33337 10 3.33337C9.53978 3.33337 9.16669 3.70647 9.16669 4.16671C9.16669 4.62694 9.53978 5.00004 10 5.00004Z" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 16.6667C10.4603 16.6667 10.8334 16.2936 10.8334 15.8333C10.8334 15.3731 10.4603 15 10 15C9.53978 15 9.16669 15.3731 9.16669 15.8333C9.16669 16.2936 9.53978 16.6667 10 16.6667Z" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedMenuKeebabIcon;

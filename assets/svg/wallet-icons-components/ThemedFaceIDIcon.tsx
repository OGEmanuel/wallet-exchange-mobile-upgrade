import React from "react";
import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { SvgXml } from "react-native-svg";

interface ThemedFaceIDIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedFaceIDIcon: React.FC<ThemedFaceIDIconProps> = ({
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
    d="M7 3H5C4.47 3 3.96 3.21 3.59 3.59C3.21 3.96 3 4.47 3 5V7
       M17 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V7
       M16 8V10
       M8 8V10
       M9 16C9 16 10 17 12 17C14 17 15 16 15 16
       M12 8V13H11
       M7 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V17
       M17 21H19C19.53 21 20.04 20.79 20.41 20.41C20.79 20.04 21 19.53 21 19V17"
    stroke="${strokeColor}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedFaceIDIcon;

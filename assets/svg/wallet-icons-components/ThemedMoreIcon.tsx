import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ThemedMoreIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedMoreIcon: React.FC<ThemedMoreIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fillColor = isDark ? darkModeColor : lightModeColor;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      style={style}
    >
      {/* 3x3 grid of dots */}
      {/* Top row */}
      <Path
        d="M6 5a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M12 5a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M18 5a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      
      {/* Middle row */}
      <Path
        d="M6 12a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M12 12a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M18 12a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      
      {/* Bottom row */}
      <Path
        d="M6 19a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M12 19a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
      <Path
        d="M18 19a2 2 0 110-4 2 2 0 010 4z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default ThemedMoreIcon;

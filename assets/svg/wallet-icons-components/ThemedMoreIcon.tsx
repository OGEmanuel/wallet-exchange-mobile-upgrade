import React from "react";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "react-native";

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
      viewBox="0 0 24 24" // adjust if original viewBox differs
      style={style}
    >
      {/* Example traced path from the SVG */}
      <Path
        d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 21a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default ThemedMoreIcon;

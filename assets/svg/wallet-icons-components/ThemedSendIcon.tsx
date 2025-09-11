import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedSendIconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSendIcon: React.FC<ThemedSendIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Select color based on theme
  const fillColor = isDark ? darkModeColor : lightModeColor;

  // SVG content with dynamic fill
  const svgContent = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path 
        d="M3.18639 10.9679C3.18639 10.9679 11.7445 7.45563 14.7125 6.21889C15.8503 5.72417 19.7088 4.14113 19.7088 4.14113C19.7088 4.14113 21.4897 3.44854 21.3413 5.13058C21.2918 5.82317 20.8961 8.24708 20.5004 10.869C19.9068 14.5791 19.2636 18.6356 19.2636 18.6356C19.2636 18.6356 19.1646 19.7733 18.3238 19.9713C17.4829 20.1693 16.0977 19.2789 15.8504 19.0809C15.6525 18.9326 12.1402 16.7064 10.8541 15.6181C10.5078 15.3214 10.1121 14.7277 10.9036 14.0351C12.6845 12.4026 14.8117 10.3744 16.0977 9.08824C16.6913 8.49451 17.285 7.10948 14.8115 8.79137C11.2993 11.2153 7.8365 13.4909 7.8365 13.4909C7.8365 13.4909 7.04491 13.9856 5.56102 13.5403C4.07684 13.0952 2.34551 12.5015 2.34551 12.5015C2.34551 12.5015 1.15834 11.7594 3.18653 10.9679H3.18639Z" 
        fill="${fillColor}" 
      />
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedSendIcon;

import React from "react";
import { SvgXml } from "react-native-svg";
import { useColorScheme, StyleProp, ViewStyle } from "react-native";

interface ThemedSwap1IconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSwap1Icon: React.FC<ThemedSwap1IconProps> = ({
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

  // SVG content with dynamic color
  const svgContent = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <g clip-path="url(#clip0)">
        <path 
          d="M18.8484 5.44615L10.6413 5.44615C9.89021 5.44615 9.2757 6.06066 9.2757 6.81172C9.2757 7.56279 9.89021 8.1773 10.6413 8.1773L18.8484 8.1773L18.8484 10.6217C18.8484 11.2362 19.5858 11.5366 20.0091 11.0996L23.8054 7.28967C24.0649 7.01656 24.0649 6.59323 23.8054 6.32012L20.0091 2.51017C19.5858 2.07318 18.8484 2.38726 18.8484 2.98812L18.8484 5.44615ZM0.194634 15.4831L4.00459 19.2931C4.42791 19.7301 5.16532 19.4296 5.16532 18.8151L5.16532 16.3707L13.3724 16.3707C14.1235 16.3707 14.738 15.7562 14.738 15.0052C14.738 14.2541 14.1235 13.6396 13.3724 13.6396L5.16532 13.6396L5.16532 11.1952C5.16532 10.5807 4.42791 10.2803 4.00458 10.7173L0.194634 14.5272C0.0698527 14.655 0 14.8266 0 15.0052C0 15.1838 0.0698528 15.3553 0.194634 15.4831Z" 
          fill="${fillColor}" 
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="24" height="24" />
        </clipPath>
      </defs>
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedSwap1Icon;

import React from "react";
import { useColorScheme } from "react-native";
import { SvgXml } from "react-native-svg";

interface ThemedLockPasswordIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedLockPasswordIcon: React.FC<ThemedLockPasswordIconProps> = ({
  width = 25,
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
  const svgContent = `<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M8.75 10V8C8.75 5.239 9.989 3 12.75 3C15.511 3 16.75 5.239 16.75 8V10M12.75 15.75V15.25M16.75 15.75V15.25M8.75 15.75V15.25M4.25 17.8V13.2C4.25 12.08 4.25 11.52 4.468 11.093C4.65957 10.7163 4.96554 10.41 5.342 10.218C5.77 10.001 6.33 10.001 7.45 10.001H18.05C19.17 10.001 19.73 10.001 20.158 10.218C20.5343 10.4097 20.8403 10.7157 21.032 11.092C21.25 11.52 21.25 12.08 21.25 13.2V17.8C21.25 18.92 21.25 19.48 21.032 19.908C20.8403 20.2843 20.5343 20.5903 20.158 20.782C19.73 21 19.17 21 18.05 21H7.45C6.33 21 5.77 21 5.342 20.782C4.96569 20.5903 4.65974 20.2843 4.468 19.908C4.25 19.481 4.25 18.921 4.25 17.8Z" stroke="${strokeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedLockPasswordIcon;

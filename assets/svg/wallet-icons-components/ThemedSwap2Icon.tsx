import React from "react";
import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { SvgXml } from "react-native-svg";

interface ThemedSwap2IconProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSwap2Icon: React.FC<ThemedSwap2IconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fillColor = isDark ? darkModeColor : lightModeColor;

  const svgContent = `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="${width}" 
      height="${height}" 
      fill="none"
    >
      <path 
        d="M9.99999 5.99998C9.73478 5.99998 9.48042 6.10534 9.29289 6.29288C9.10535 6.48041 8.99999 6.73477 8.99999 6.99998L8.99999 18.59L6.70999 16.29C6.52169 16.1017 6.2663 15.9959 5.99999 15.9959C5.73369 15.9959 5.4783 16.1017 5.28999 16.29C5.10169 16.4783 4.9959 16.7337 4.9959 17C4.9959 17.2663 5.10169 17.5217 5.28999 17.71L9.28999 21.71C9.43062 21.8487 9.60919 21.9427 9.80318 21.9801C9.99717 22.0175 10.1979 21.9966 10.38 21.92C10.5626 21.845 10.7189 21.7176 10.8293 21.5538C10.9396 21.3901 10.999 21.1974 11 21L11 6.99998C11 6.73477 10.8946 6.48041 10.7071 6.29288C10.5196 6.10534 10.2652 5.99998 9.99999 5.99998ZM13.62 2.07998C13.4374 2.155 13.281 2.2824 13.1707 2.44612C13.0604 2.60984 13.001 2.80256 13 2.99998L13 17C13 17.2652 13.1054 17.5196 13.2929 17.7071C13.4804 17.8946 13.7348 18 14 18C14.2652 18 14.5196 17.8946 14.7071 17.7071C14.8946 17.5196 15 17.2652 15 17L15 5.40998L17.29 7.70998C17.383 7.80371 17.4936 7.87811 17.6154 7.92888C17.7373 7.97964 17.868 8.00578 18 8.00578C18.132 8.00578 18.2627 7.97964 18.3846 7.92888C18.5064 7.87811 18.617 7.80371 18.71 7.70998C18.8037 7.61702 18.8781 7.50642 18.9289 7.38456C18.9797 7.2627 19.0058 7.132 19.0058 6.99998C19.0058 6.86797 18.9797 6.73727 18.9289 6.61541C18.8781 6.49355 18.8037 6.38295 18.71 6.28999L14.71 2.28999C14.5694 2.15123 14.3908 2.05723 14.1968 2.01986C14.0028 1.98248 13.8021 2.00341 13.62 2.07998Z" 
        fill="${fillColor}"
      />
    </svg>
  `;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedSwap2Icon;

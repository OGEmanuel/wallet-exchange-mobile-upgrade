import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedChatOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedChatOutlineIcon: React.FC<ThemedChatOutlineIconProps> = ({ 
  width = 20, 
  height = 21, 
  style,
  lightModeColor = '#121212',
  darkModeColor = '#FFFFFF'
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors for light and dark modes
  const lightColor = lightModeColor;
  const darkColor = darkModeColor;
  
  // Select color based on theme
  const strokeColor = isDark ? darkColor : lightColor;
  const fillColor = isDark ? darkColor : lightColor;
  
  // SVG content with dynamic color
  const svgContent = `<svg   viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M3.13281 19.4766C2.90352 19.474 2.6773 19.4235 2.46875 19.3281C2.19693 19.2034 1.96687 19.0029 1.80612 18.7507C1.64538 18.4985 1.56079 18.2053 1.5625 17.9062V5.5C1.56455 5.08623 1.72983 4.69 2.02241 4.39741C2.31499 4.10483 2.71123 3.93955 3.125 3.9375H16.875C17.2888 3.93955 17.685 4.10483 17.9776 4.39741C18.2702 4.69 18.4354 5.08623 18.4375 5.5V15.5C18.4354 15.9138 18.2702 16.31 17.9776 16.6026C17.685 16.8952 17.2888 17.0604 16.875 17.0625H6.5625L4.13281 19.1016C3.85319 19.339 3.4996 19.4716 3.13281 19.4766ZM3.4375 5.8125V17.2344L5.4375 15.5547C5.72059 15.319 6.07692 15.1891 6.44531 15.1875H16.5625V5.8125H3.4375Z" fill="${fillColor}"/>
</svg>
`;

  return (
    <SvgXml
      xml={svgContent}
      width={width}
      height={height}
      style={style}
    />
  );
};

export default ThemedChatOutlineIcon;

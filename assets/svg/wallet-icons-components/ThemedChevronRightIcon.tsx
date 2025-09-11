import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedChevronRightIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedChevronRightIcon: React.FC<ThemedChevronRightIconProps> = ({ 
  width = 24, 
  height = 24, 
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
  const svgContent = `<svg   viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M9 18L15 12L9 6" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedChevronRightIcon;

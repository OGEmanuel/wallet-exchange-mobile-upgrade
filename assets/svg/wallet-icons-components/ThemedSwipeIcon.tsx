import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedSwipeIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSwipeIcon: React.FC<ThemedSwipeIconProps> = ({ 
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
<rect   rx="12" fill="white"/>
<path d="M8.69454 14.88L11.0655 12.5091C11.3455 12.2291 11.3455 11.7709 11.0655 11.4909L8.69454 9.12" stroke="#292D32" stroke- stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.0582 14.88L15.4291 12.5091C15.7091 12.2291 15.7091 11.7709 15.4291 11.4909L13.0582 9.12" stroke="#292D32" stroke- stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedSwipeIcon;

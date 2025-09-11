import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedCardOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedCardOutlineIcon: React.FC<ThemedCardOutlineIconProps> = ({ 
  width = 16, 
  height = 16, 
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
  const svgContent = `<svg   viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M12.75 3H3.25C2.2835 3 1.5 3.7835 1.5 4.75V11.25C1.5 12.2165 2.2835 13 3.25 13H12.75C13.7165 13 14.5 12.2165 14.5 11.25V4.75C14.5 3.7835 13.7165 3 12.75 3Z" stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.5 6H14.5M4 9.375H5.5V10H4V9.375Z" stroke="${strokeColor}" stroke- stroke-linejoin="round"/>
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

export default ThemedCardOutlineIcon;

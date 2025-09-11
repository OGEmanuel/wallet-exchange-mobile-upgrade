import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedWalletFilledIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedWalletFilledIcon: React.FC<ThemedWalletFilledIconProps> = ({ 
  width = 25, 
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
  const svgContent = `<svg   viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M20.5 7V5C20.5 3.897 19.603 3 18.5 3H5.5C3.846 3 2.5 4.346 2.5 6V18C2.5 20.201 4.294 21 5.5 21H20.5C21.603 21 22.5 20.103 22.5 19V9C22.5 7.897 21.603 7 20.5 7ZM18.5 16H16.5V12H18.5V16ZM5.5 7C5.24252 6.98848 4.99941 6.87809 4.82128 6.69182C4.64315 6.50554 4.54373 6.25774 4.54373 6C4.54373 5.74226 4.64315 5.49446 4.82128 5.30818C4.99941 5.12191 5.24252 5.01152 5.5 5H18.5V7H5.5Z" fill="${fillColor}"/>
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

export default ThemedWalletFilledIcon;

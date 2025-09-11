import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedRadioFalseIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedRadioFalseIcon: React.FC<ThemedRadioFalseIconProps> = ({ 
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
<path d="M8 2.39998C7.2646 2.39998 6.53639 2.54482 5.85697 2.82625C5.17755 3.10768 4.56021 3.52017 4.0402 4.04018C3.52019 4.56019 3.1077 5.17753 2.82627 5.85695C2.54485 6.53637 2.4 7.26457 2.4 7.99998C2.4 8.73538 2.54485 9.46358 2.82627 10.143C3.1077 10.8224 3.52019 11.4398 4.0402 11.9598C4.56021 12.4798 5.17755 12.8923 5.85697 13.1737C6.53639 13.4551 7.2646 13.6 8 13.6C9.48521 13.6 10.9096 13.01 11.9598 11.9598C13.01 10.9096 13.6 9.48519 13.6 7.99998C13.6 6.51476 13.01 5.09038 11.9598 4.04018C10.9096 2.98997 9.48521 2.39998 8 2.39998ZM1.6 7.99998C1.6 6.30259 2.27428 4.67473 3.47452 3.47449C4.67475 2.27426 6.30261 1.59998 8 1.59998C9.69738 1.59998 11.3252 2.27426 12.5255 3.47449C13.7257 4.67473 14.4 6.30259 14.4 7.99998C14.4 9.69736 13.7257 11.3252 12.5255 12.5255C11.3252 13.7257 9.69738 14.4 8 14.4C6.30261 14.4 4.67475 13.7257 3.47452 12.5255C2.27428 11.3252 1.6 9.69736 1.6 7.99998Z" fill="${fillColor}"/>
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

export default ThemedRadioFalseIcon;

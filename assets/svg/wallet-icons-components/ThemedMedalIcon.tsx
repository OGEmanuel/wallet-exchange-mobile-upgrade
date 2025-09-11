import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedMedalIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedMedalIcon: React.FC<ThemedMedalIconProps> = ({ 
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
<path d="M17 2H13V6.059C14.4313 6.21633 15.8035 6.71684 17 7.518V2ZM11 2H7V7.518C8.19648 6.71684 9.56868 6.21633 11 6.059V2ZM12 22C13.8565 22 15.637 21.2625 16.9497 19.9497C18.2625 18.637 19 16.8565 19 15C19 13.1435 18.2625 11.363 16.9497 10.0503C15.637 8.7375 13.8565 8 12 8C10.1435 8 8.36301 8.7375 7.05025 10.0503C5.7375 11.363 5 13.1435 5 15C5 16.8565 5.7375 18.637 7.05025 19.9497C8.36301 21.2625 10.1435 22 12 22ZM10.775 13.481L12 11L13.225 13.481L15.963 13.878L13.982 15.81L14.45 18.537L12 17.25L9.551 18.537L10.019 15.81L8.038 13.878L10.775 13.481Z" fill="${fillColor}"/>
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

export default ThemedMedalIcon;

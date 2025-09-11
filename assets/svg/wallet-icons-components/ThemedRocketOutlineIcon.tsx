import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedRocketOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedRocketOutlineIcon: React.FC<ThemedRocketOutlineIconProps> = ({ 
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
<path d="M20.92 2.38C19.7973 2.12857 18.6505 2.00114 17.5 2C16.4135 1.93101 15.3241 2.0775 14.2944 2.43103C13.2647 2.78456 12.315 3.33816 11.5 4.06C10.4267 5.13333 9.36334 6.20333 8.31 7.27C7.1 7.14 4.23 7.07 2.31 9.01C2.12375 9.19736 2.01921 9.45081 2.01921 9.715C2.01921 9.97918 2.12375 10.2326 2.31 10.42L13.61 21.74C13.7974 21.9262 14.0508 22.0308 14.315 22.0308C14.5792 22.0308 14.8326 21.9262 15.02 21.74C16.97 19.74 16.91 16.92 16.79 15.74L20 12.54C23.19 9.35 21.74 3.36 21.68 3.11C21.6338 2.92963 21.5382 2.76574 21.404 2.63677C21.2697 2.50779 21.1021 2.41887 20.92 2.38ZM18.56 11.13L15 14.67C14.8847 14.7864 14.7998 14.9294 14.7527 15.0863C14.7056 15.2432 14.6978 15.4093 14.73 15.57C14.946 16.9078 14.758 18.2796 14.19 19.51L4.52 9.82C5.76985 9.24477 7.16701 9.07012 8.52 9.32C8.68008 9.34084 8.84282 9.32262 8.99432 9.2669C9.14583 9.21117 9.28159 9.1196 9.39 9C9.39 9 10.79 7.55 12.9 5.44C14.1974 4.39811 15.8401 3.88389 17.5 4C18.2808 4.00387 19.06 4.07075 19.83 4.2C20.07 5.63 20.45 9.24 18.56 11.13Z" fill="${fillColor}"/>
<path d="M15.73 10.3C16.8346 10.3 17.73 9.40462 17.73 8.30005C17.73 7.19548 16.8346 6.30005 15.73 6.30005C14.6254 6.30005 13.73 7.19548 13.73 8.30005C13.73 9.40462 14.6254 10.3 15.73 10.3Z" fill="${fillColor}"/>
<path d="M5 16C3 17 3 21 3 21C4.85107 20.9472 6.62315 20.2384 8 19L5 16Z" fill="${fillColor}"/>
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

export default ThemedRocketOutlineIcon;

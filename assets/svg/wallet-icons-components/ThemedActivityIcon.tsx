import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedActivityIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedActivityIcon: React.FC<ThemedActivityIconProps> = ({ 
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
<path d="M14.6667 8.00004H13.0133C12.722 7.99942 12.4385 8.09424 12.2061 8.27002C11.9737 8.44579 11.8053 8.69284 11.7267 8.97337L10.16 14.5467C10.1499 14.5813 10.1289 14.6117 10.1 14.6334C10.0712 14.655 10.0361 14.6667 10 14.6667C9.96395 14.6667 9.92886 14.655 9.90001 14.6334C9.87116 14.6117 9.85011 14.5813 9.84001 14.5467L6.16001 1.45337C6.14991 1.41875 6.12886 1.38834 6.10001 1.36671C6.07116 1.34507 6.03607 1.33337 6.00001 1.33337C5.96395 1.33337 5.92886 1.34507 5.90001 1.36671C5.87116 1.38834 5.85011 1.41875 5.84001 1.45337L4.27334 7.02671C4.19499 7.30614 4.0276 7.55238 3.79659 7.72805C3.56557 7.90371 3.28356 7.99921 2.99334 8.00004H1.33334" stroke="${strokeColor}" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedActivityIcon;

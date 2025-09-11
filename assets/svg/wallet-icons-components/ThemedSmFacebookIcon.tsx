import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedSmFacebookIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSmFacebookIcon: React.FC<ThemedSmFacebookIconProps> = ({ 
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
<path d="M13.1904 19.68V12.6912H15.5808L15.9264 9.96483H13.2V8.25603C13.2 7.48803 13.4592 6.89283 14.5632 6.89283H16.0128V4.41603C15.6768 4.41603 14.8224 4.33923 13.8816 4.33923C12.0672 4.21443 10.5024 5.57763 10.368 7.39203C10.368 7.56483 10.368 7.73763 10.368 7.92003V9.96483H7.9872V12.6912H10.368V19.68H13.1904Z" fill="${fillColor}"/>
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

export default ThemedSmFacebookIcon;

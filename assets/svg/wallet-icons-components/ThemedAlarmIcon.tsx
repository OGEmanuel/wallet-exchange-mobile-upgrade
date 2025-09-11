import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedAlarmIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedAlarmIcon: React.FC<ThemedAlarmIconProps> = ({ 
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
<path d="M7.25 12.5C7.25 9.7385 9.4885 7.5 12.25 7.5C15.0115 7.5 17.25 9.7385 17.25 12.5V20.5H7.25V12.5Z" stroke="${strokeColor}" stroke- stroke-linejoin="round"/>
<path d="M12.25 2.5V4M18.196 4.664L17.2315 5.813M21.3595 10.1435L19.882 10.404M3.1405 10.1435L4.618 10.404M6.3045 4.664L7.2685 5.813M3.25 20.5H21.75" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedAlarmIcon;

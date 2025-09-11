import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedCommandFillIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedCommandFillIcon: React.FC<ThemedCommandFillIconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M1.58683 1.58683C1.80249 1.37116 2.095 1.25 2.4 1.25H13.6C13.905 1.25 14.1975 1.37116 14.4132 1.58683C14.6288 1.8025 14.75 2.095 14.75 2.4V13.6C14.75 13.905 14.6288 14.1975 14.4132 14.4132C14.1975 14.6288 13.905 14.75 13.6 14.75H2.4C2.095 14.75 1.8025 14.6288 1.58683 14.4132C1.37116 14.1975 1.25 13.905 1.25 13.6V2.4C1.25 2.095 1.37116 1.80249 1.58683 1.58683ZM9.66874 4.66251C10.0392 4.84775 10.1894 5.29826 10.0042 5.66874L7.33749 11.0021C7.15225 11.3726 6.70174 11.5227 6.33126 11.3375C5.96077 11.1522 5.81061 10.7017 5.99585 10.3313L8.66251 4.99792C8.84775 4.62744 9.29826 4.47727 9.66874 4.66251Z" fill="${fillColor}"/>
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

export default ThemedCommandFillIcon;

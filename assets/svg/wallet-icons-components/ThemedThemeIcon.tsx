import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedThemeIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedThemeIcon: React.FC<ThemedThemeIconProps> = ({ 
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
<path d="M12 4.20002C14.0687 4.20002 16.0526 5.02181 17.5154 6.48459C18.9782 7.94738 19.8 9.93134 19.8 12C19.8 14.0687 18.9782 16.0527 17.5154 17.5155C16.0526 18.9782 14.0687 19.8 12 19.8V4.20002ZM12 2.40002C9.45392 2.40002 7.01212 3.41145 5.21177 5.2118C3.41143 7.01215 2.4 9.45395 2.4 12C2.4 14.5461 3.41143 16.9879 5.21177 18.7883C7.01212 20.5886 9.45392 21.6 12 21.6C14.5461 21.6 16.9879 20.5886 18.7882 18.7883C20.5886 16.9879 21.6 14.5461 21.6 12C21.6 9.45395 20.5886 7.01215 18.7882 5.2118C16.9879 3.41145 14.5461 2.40002 12 2.40002Z" fill="${fillColor}"/>
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

export default ThemedThemeIcon;

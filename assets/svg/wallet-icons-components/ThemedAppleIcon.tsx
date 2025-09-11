import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedAppleIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedAppleIcon: React.FC<ThemedAppleIconProps> = ({ 
  width = 16, 
  height = 17, 
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
  const svgContent = `<svg   viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M11.3667 14.02C10.7133 14.6533 10 14.5533 9.31333 14.2533C8.58667 13.9467 7.92 13.9333 7.15333 14.2533C6.19333 14.6667 5.68667 14.5467 5.11333 14.02C1.86 10.6667 2.34 5.56 6.03333 5.37333C6.93333 5.42 7.56 5.86667 8.08667 5.90667C8.87333 5.74667 9.62667 5.28667 10.4667 5.34667C11.4733 5.42667 12.2333 5.82667 12.7333 6.54667C10.6533 7.79333 11.1467 10.5333 13.0533 11.3C12.6733 12.3 12.18 13.2933 11.36 14.0267L11.3667 14.02ZM8.02 5.33333C7.92 3.84667 9.12667 2.62 10.5133 2.5C10.7067 4.22 8.95333 5.5 8.02 5.33333Z" fill="${fillColor}"/>
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

export default ThemedAppleIcon;

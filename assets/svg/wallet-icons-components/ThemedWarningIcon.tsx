import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedWarningIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedWarningIcon: React.FC<ThemedWarningIconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.4142 2.11169L21.8883 10.5858C22.6694 11.3668 22.6694 12.6332 21.8883 13.4142L13.4142 21.8883C12.6331 22.6694 11.3668 22.6694 10.5858 21.8883L2.11167 13.4142C1.33059 12.6332 1.33059 11.3668 2.11167 10.5858L10.5857 2.11169C11.3668 1.33061 12.6331 1.33061 13.4142 2.11169M12 14.75C11.2857 14.75 10.75 15.278 10.75 15.982C10.75 16.718 11.2695 17.246 12 17.246C12.7143 17.246 13.25 16.718 13.25 15.998C13.25 15.278 12.7143 14.75 12 14.75ZM13 7H11V13H13V7Z" fill="${fillColor}"/>
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

export default ThemedWarningIcon;

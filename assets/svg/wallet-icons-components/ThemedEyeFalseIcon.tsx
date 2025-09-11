import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedEyeFalseIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedEyeFalseIcon: React.FC<ThemedEyeFalseIconProps> = ({ 
  width = 20, 
  height = 20, 
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
  const svgContent = `<svg   viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<path d="M10 7.5C10.6631 7.5 11.2989 7.76339 11.7678 8.23223C12.2366 8.70107 12.5 9.33696 12.5 10C12.5 10.663 12.2366 11.2989 11.7678 11.7678C11.2989 12.2366 10.6631 12.5 10 12.5C9.33697 12.5 8.70108 12.2366 8.23224 11.7678C7.7634 11.2989 7.50001 10.663 7.50001 10C7.50001 9.33696 7.7634 8.70107 8.23224 8.23223C8.70108 7.76339 9.33697 7.5 10 7.5ZM10 3.75C14.1667 3.75 17.725 6.34167 19.1667 10C17.725 13.6583 14.1667 16.25 10 16.25C5.83334 16.25 2.27501 13.6583 0.833344 10C2.27501 6.34167 5.83334 3.75 10 3.75ZM2.65001 10C3.32355 11.3753 4.36943 12.534 5.66874 13.3444C6.96805 14.1548 8.46867 14.5844 10 14.5844C11.5313 14.5844 13.032 14.1548 14.3313 13.3444C15.6306 12.534 16.6765 11.3753 17.35 10C16.6765 8.62474 15.6306 7.46604 14.3313 6.65562C13.032 5.8452 11.5313 5.41557 10 5.41557C8.46867 5.41557 6.96805 5.8452 5.66874 6.65562C4.36943 7.46604 3.32355 8.62474 2.65001 10Z" fill="${fillColor}"/>
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

export default ThemedEyeFalseIcon;

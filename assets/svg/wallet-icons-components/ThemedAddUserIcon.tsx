import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedAddUserIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedAddUserIcon: React.FC<ThemedAddUserIconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 2.66663C5.29276 2.66663 4.61448 2.94758 4.11438 3.44767C3.61428 3.94777 3.33333 4.62605 3.33333 5.33329C3.33333 6.04054 3.61428 6.71881 4.11438 7.21891C4.61448 7.71901 5.29276 7.99996 6 7.99996C6.70724 7.99996 7.38552 7.71901 7.88562 7.21891C8.38572 6.71881 8.66667 6.04054 8.66667 5.33329C8.66667 4.62605 8.38572 3.94777 7.88562 3.44767C7.38552 2.94758 6.70724 2.66663 6 2.66663ZM4.66667 8.66663C3.95942 8.66663 3.28115 8.94758 2.78105 9.44767C2.28095 9.94777 2 10.626 2 11.3333V12C2 12.3536 2.14048 12.6927 2.39052 12.9428C2.64057 13.1928 2.97971 13.3333 3.33333 13.3333H8.66667C9.02029 13.3333 9.35943 13.1928 9.60948 12.9428C9.85952 12.6927 10 12.3536 10 12V11.3333C10 10.626 9.71905 9.94777 9.21895 9.44767C8.71885 8.94758 8.04058 8.66663 7.33333 8.66663H4.66667ZM10 7.99996C10 7.82315 10.0702 7.65358 10.1953 7.52855C10.3203 7.40353 10.4899 7.33329 10.6667 7.33329H11.3333V6.66663C11.3333 6.48981 11.4036 6.32025 11.5286 6.19522C11.6536 6.0702 11.8232 5.99996 12 5.99996C12.1768 5.99996 12.3464 6.0702 12.4714 6.19522C12.5964 6.32025 12.6667 6.48981 12.6667 6.66663V7.33329H13.3333C13.5101 7.33329 13.6797 7.40353 13.8047 7.52855C13.9298 7.65358 14 7.82315 14 7.99996C14 8.17677 13.9298 8.34634 13.8047 8.47136C13.6797 8.59639 13.5101 8.66663 13.3333 8.66663H12.6667V9.33329C12.6667 9.5101 12.5964 9.67967 12.4714 9.8047C12.3464 9.92972 12.1768 9.99996 12 9.99996C11.8232 9.99996 11.6536 9.92972 11.5286 9.8047C11.4036 9.67967 11.3333 9.5101 11.3333 9.33329V8.66663H10.6667C10.4899 8.66663 10.3203 8.59639 10.1953 8.47136C10.0702 8.34634 10 8.17677 10 7.99996Z" fill="${fillColor}"/>
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

export default ThemedAddUserIcon;

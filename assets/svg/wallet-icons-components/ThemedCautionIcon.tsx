import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedCautionIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedCautionIcon: React.FC<ThemedCautionIconProps> = ({ 
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
<path d="M12 22.0002C17.5229 22.0002 22 17.5231 22 12.0002C22 6.4774 17.5229 2.00024 12 2.00024C6.47719 2.00024 2.00004 6.4774 2.00004 12.0002C2.00004 17.5231 6.47719 22.0002 12 22.0002Z" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 6.6156V11.231" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 17.7703C12.9913 17.7703 13.7949 16.9667 13.7949 15.9754C13.7949 14.9841 12.9913 14.1805 12 14.1805C11.0087 14.1805 10.2051 14.9841 10.2051 15.9754C10.2051 16.9667 11.0087 17.7703 12 17.7703Z" fill="${fillColor}"/>
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

export default ThemedCautionIcon;

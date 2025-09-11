import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedLegalIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedLegalIcon: React.FC<ThemedLegalIconProps> = ({ 
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
<path d="M0.857147 22.7828H13.7143M12 22.7828V18.4971H2.57143V22.7828" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3488 1.71847L7.20303 7.86423C6.53356 8.5337 6.53356 9.61913 7.20303 10.2886L9.91832 13.0039C10.5878 13.6734 11.6732 13.6734 12.3427 13.0039L18.4885 6.85812C19.1579 6.18865 19.1579 5.10322 18.4885 4.43375L15.7732 1.71847C15.1037 1.04899 14.0183 1.049 13.3488 1.71847Z" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.4286 9.92566L23.1429 17.6399" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedLegalIcon;

import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedAttachIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedAttachIcon: React.FC<ThemedAttachIconProps> = ({ 
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
<path d="M9.6282 8.38379V16.4772C9.63755 17.069 9.87921 17.6334 10.301 18.0486C10.7229 18.4638 11.291 18.6965 11.8829 18.6965C12.4748 18.6965 13.043 18.4638 13.4648 18.0486C13.8866 17.6334 14.1283 17.069 14.1376 16.4772L14.145 5.86885C14.1511 5.36301 14.0568 4.86098 13.8674 4.39187C13.6781 3.92276 13.3975 3.4959 13.042 3.13602C12.6865 2.77615 12.263 2.49043 11.7963 2.29542C11.3295 2.10041 10.8286 2 10.3228 2C9.81688 2 9.31604 2.10041 8.84926 2.29542C8.38247 2.49043 7.95905 2.77615 7.60351 3.13602C7.24798 3.4959 6.96742 3.92276 6.77809 4.39187C6.58876 4.86098 6.49443 5.36301 6.50056 5.86885V16.5486C6.49026 17.2608 6.62162 17.9678 6.88702 18.6288C7.15241 19.2897 7.54655 19.8913 8.04651 20.3985C8.54647 20.9058 9.14227 21.3086 9.79929 21.5835C10.4563 21.8584 11.1614 22 11.8736 22C12.5859 22 13.291 21.8584 13.948 21.5835C14.605 21.3086 15.2008 20.9058 15.7008 20.3985C16.2007 19.8913 16.5949 19.2897 16.8603 18.6288C17.1257 17.9678 17.257 17.2608 17.2467 16.5486V6.56876" stroke="${strokeColor}" stroke- stroke-miterlimit="10" stroke-linecap="round"/>
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

export default ThemedAttachIcon;

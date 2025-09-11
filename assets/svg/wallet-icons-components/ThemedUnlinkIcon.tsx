import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedUnlinkIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedUnlinkIcon: React.FC<ThemedUnlinkIconProps> = ({ 
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
<path d="M12.143 10.691L12.35 10.484C12.8205 10.0135 13.3791 9.64024 13.9939 9.38559C14.6087 9.13094 15.2676 8.99988 15.933 8.99988C16.5984 8.99988 17.2573 9.13094 17.8721 9.38559C18.4869 9.64024 19.0455 10.0135 19.516 10.484C19.9865 10.9545 20.3598 11.5131 20.6144 12.1279C20.8691 12.7427 21.0001 13.4016 21.0001 14.067C21.0001 14.7324 20.8691 15.3913 20.6144 16.0061C20.3598 16.6209 19.9865 17.1795 19.516 17.65L16.65 20.516C16.1795 20.9865 15.6209 21.3598 15.0061 21.6144C14.3913 21.8691 13.7324 22.0001 13.067 22.0001C12.4016 22.0001 11.7427 21.8691 11.1279 21.6144C10.5131 21.3598 9.95453 20.9865 9.48401 20.516C9.01348 20.0455 8.64024 19.4869 8.38559 18.8721C8.13094 18.2573 7.99988 17.5984 7.99988 16.933C7.99988 16.2676 8.13094 15.6087 8.38559 14.9939C8.64024 14.3791 9.01348 13.8205 9.48401 13.35L9.94801 12.886" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.052 11.114L20.516 10.65C20.9865 10.1795 21.3598 9.62088 21.6144 9.00611C21.8691 8.39134 22.0001 7.73243 22.0001 7.06701C22.0001 6.40158 21.8691 5.74267 21.6144 5.1279C21.3598 4.51313 20.9865 3.95453 20.516 3.48401C20.0455 3.01348 19.4869 2.64024 18.8721 2.38559C18.2573 2.13094 17.5984 1.99988 16.933 1.99988C16.2676 1.99988 15.6087 2.13094 14.9939 2.38559C14.3791 2.64024 13.8205 3.01348 13.35 3.48401L10.484 6.35001C10.0135 6.82053 9.64023 7.37913 9.38558 7.9939C9.13094 8.60867 8.99987 9.26758 8.99987 9.933C8.99987 10.5984 9.13094 11.2573 9.38558 11.8721C9.64023 12.4869 10.0135 13.0455 10.484 13.516C10.9545 13.9865 11.5131 14.3598 12.1279 14.6144C12.7427 14.8691 13.4016 15.0001 14.067 15.0001C14.7324 15.0001 15.3913 14.8691 16.0061 14.6144C16.6209 14.3598 17.1795 13.9865 17.65 13.516L17.857 13.309M4.5 4.00001L6 6.00001M2 8.00001L5 9.00001M3 13.5L5 12" stroke="${strokeColor}" stroke- stroke-linecap="round" stroke-linejoin="round"/>
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

export default ThemedUnlinkIcon;

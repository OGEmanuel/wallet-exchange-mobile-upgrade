import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedSmDiscordIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSmDiscordIcon: React.FC<ThemedSmDiscordIconProps> = ({ 
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
<path d="M19.5088 5.34C18.1709 4.714 16.7402 4.25905 15.2446 4C15.0609 4.33209 14.8463 4.77877 14.6983 5.1341C13.1084 4.89499 11.5331 4.89499 9.97243 5.1341C9.8245 4.77877 9.60503 4.33209 9.41971 4C7.92243 4.25905 6.49018 4.71567 5.15222 5.34331C2.45355 9.42136 1.72199 13.3981 2.08777 17.3184C3.87767 18.655 5.6123 19.467 7.31766 19.9984C7.73872 19.4189 8.11425 18.8028 8.43776 18.1536C7.82162 17.9195 7.23149 17.6306 6.67389 17.2952C6.82182 17.1856 6.96652 17.071 7.10632 16.9531C10.5073 18.5438 14.2025 18.5438 17.5628 16.9531C17.7043 17.071 17.849 17.1856 17.9953 17.2952C17.436 17.6322 16.8443 17.9211 16.2281 18.1553C16.5517 18.8028 16.9256 19.4205 17.3482 20C19.0552 19.4687 20.7915 18.6567 22.5814 17.3184C23.0106 12.7738 21.8482 8.83355 19.5088 5.34ZM8.90109 14.9075C7.88016 14.9075 7.04291 13.9543 7.04291 12.7937C7.04291 11.6331 7.86228 10.6783 8.90109 10.6783C9.93993 10.6783 10.7772 11.6314 10.7593 12.7937C10.7609 13.9543 9.93993 14.9075 8.90109 14.9075ZM15.7681 14.9075C14.7471 14.9075 13.9099 13.9543 13.9099 12.7937C13.9099 11.6331 14.7292 10.6783 15.7681 10.6783C16.8069 10.6783 17.6441 11.6314 17.6263 12.7937C17.6263 13.9543 16.8069 14.9075 15.7681 14.9075Z" fill="${fillColor}"/>
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

export default ThemedSmDiscordIcon;

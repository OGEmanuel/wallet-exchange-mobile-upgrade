import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedGlobeOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedGlobeOutlineIcon: React.FC<ThemedGlobeOutlineIconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.44398 4.83377C7.67355 5.21605 6.96276 5.72353 6.34315 6.34315C5.08052 7.60577 4.28353 9.247 4.06272 11H7.02327C7.12639 8.79624 7.56774 6.78223 8.25741 5.23018C8.31727 5.09546 8.37946 4.9632 8.44398 4.83377ZM12 2C9.34784 2 6.8043 3.05357 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.8043 20.9464 9.34784 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM12 4C11.7728 4 11.4813 4.09938 11.132 4.43173C10.7776 4.76902 10.413 5.30433 10.0851 6.04232C9.52372 7.30565 9.12731 9.03364 9.02566 11H14.9743C14.8727 9.03364 14.4763 7.30565 13.9149 6.04232C13.587 5.30433 13.2224 4.76902 12.868 4.43173C12.5187 4.09938 12.2272 4 12 4ZM16.9767 11C16.8736 8.79624 16.4323 6.78223 15.7426 5.23018C15.6827 5.09546 15.6205 4.96321 15.556 4.83378C16.3265 5.21606 17.0372 5.72353 17.6569 6.34315C18.9195 7.60577 19.7165 9.247 19.9373 11H16.9767ZM14.9743 13H9.02566C9.12731 14.9664 9.52372 16.6944 10.0851 17.9577C10.413 18.6957 10.7776 19.231 11.132 19.5683C11.4813 19.9006 11.7728 20 12 20C12.2272 20 12.5187 19.9006 12.868 19.5683C13.2224 19.231 13.587 18.6957 13.9149 17.9577C14.4763 16.6944 14.8727 14.9664 14.9743 13ZM15.556 19.1662C15.6205 19.0368 15.6827 18.9045 15.7426 18.7698C16.4323 17.2178 16.8736 15.2038 16.9767 13H19.9373C19.7165 14.753 18.9195 16.3942 17.6569 17.6569C17.0372 18.2765 16.3265 18.7839 15.556 19.1662ZM8.44398 19.1662C8.37946 19.0368 8.31727 18.9045 8.25741 18.7698C7.56774 17.2178 7.12639 15.2038 7.02327 13H4.06272C4.28353 14.753 5.08052 16.3942 6.34315 17.6569C6.96276 18.2765 7.67355 18.7839 8.44398 19.1662Z" fill="#60617D"/>
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

export default ThemedGlobeOutlineIcon;

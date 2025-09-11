import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedGiftFill3IconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedGiftFill3Icon: React.FC<ThemedGiftFill3IconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.95 4C7.61848 4 7.30054 4.1317 7.06612 4.36612C6.8317 4.60054 6.7 4.91848 6.7 5.25C6.7 5.58152 6.8317 5.89946 7.06612 6.13388C7.30054 6.3683 7.61848 6.5 7.95 6.5H10.6419C10.5428 6.25396 10.4229 5.99162 10.28 5.73192C9.71982 4.71334 8.9689 4 7.95 4ZM13.3581 6.5H16.05C16.3815 6.5 16.6995 6.3683 16.9339 6.13388C17.1683 5.89946 17.3 5.58152 17.3 5.25C17.3 4.91848 17.1683 4.60054 16.9339 4.36612C16.6995 4.1317 16.3815 4 16.05 4C15.0311 4 14.2802 4.71334 13.72 5.73192C13.5771 5.99162 13.4572 6.25396 13.3581 6.5ZM19.0462 6.50914C19.2121 6.11424 19.3 5.68665 19.3 5.25C19.3 4.38805 18.9576 3.5614 18.3481 2.9519C17.7386 2.34241 16.912 2 16.05 2C13.9525 2 12.6852 3.48861 12 4.70964C11.3148 3.48861 10.0475 2 7.95 2C7.08805 2 6.2614 2.34241 5.65191 2.9519C5.04241 3.5614 4.7 4.38805 4.7 5.25C4.7 5.68665 4.78787 6.11424 4.95382 6.50913C4.8347 6.51324 4.72208 6.51921 4.61634 6.52784C4.25434 6.55742 3.88582 6.62329 3.52883 6.80518C3.15942 6.99341 2.83844 7.26024 2.58705 7.58452C2.22438 7.94655 2 8.44707 2 9V10.2798V10.3423V10.3423V13H11L11 9L11 8.5L11 7H13L13 8.5L13 9L13 13H22V9C22 8.44708 21.7756 7.94656 21.413 7.58454C21.1616 7.26025 20.8406 6.99341 20.4712 6.80518C20.1142 6.62329 19.7457 6.55742 19.3837 6.52785C19.2779 6.51921 19.1653 6.51325 19.0462 6.50914ZM2 15V18.1577V18.1577V18.2206V20C2 21.1046 2.89543 22 4 22L5.84229 22H5.88L11 22V15H2ZM13 22H18.12H18.1577H18.2243H20C21.1046 22 22 21.1046 22 20V18.2397L22 18.1577V18.12L22 18.118V15H13V22Z" fill="${fillColor}"/>
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

export default ThemedGiftFill3Icon;

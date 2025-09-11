import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedLiquIDityOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedLiquIDityOutlineIcon: React.FC<ThemedLiquIDityOutlineIconProps> = ({ 
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
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.5 10.8C22.5 13.7316 20.9426 16.2995 18.6099 17.7213C18.323 18.4994 17.9382 19.2301 17.4704 19.8985C21.2665 18.6179 24 15.0281 24 10.8C24 5.49802 19.702 1.19995 14.4 1.19995C11.1433 1.19995 8.26543 2.82158 6.52969 5.30142C2.73349 6.58198 0 10.1717 0 14.4C0 19.7019 4.29807 24 9.6 24C14.9019 24 19.2 19.7019 19.2 14.4C19.2 9.09802 14.9019 4.79995 9.6 4.79995C9.37593 4.79995 9.15366 4.80763 8.93342 4.82273C10.3742 3.50433 12.2932 2.69995 14.4 2.69995C18.8735 2.69995 22.5 6.32645 22.5 10.8ZM17.4 14.4C17.4 18.7078 13.9078 22.2 9.6 22.2C5.29218 22.2 1.8 18.7078 1.8 14.4C1.8 10.0921 5.29218 6.59995 9.6 6.59995C13.9078 6.59995 17.4 10.0921 17.4 14.4Z" fill="${fillColor}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.35 8.89917C10.35 8.48496 10.0142 8.14917 9.60001 8.14917C9.18579 8.14917 8.85001 8.48496 8.85001 8.89917V10.1507H8.35001C7.68696 10.1507 7.05108 10.4141 6.58224 10.883C6.1134 11.3518 5.85001 11.9877 5.85001 12.6507C5.85001 13.3138 6.1134 13.9497 6.58224 14.4185C7.05108 14.8873 7.68696 15.1507 8.35001 15.1507H8.85001V17.1507H6.60001C6.18579 17.1507 5.85001 17.4865 5.85001 17.9007C5.85001 18.3149 6.18579 18.6507 6.60001 18.6507H8.85001V19.8992C8.85001 20.3134 9.18579 20.6492 9.60001 20.6492C10.0142 20.6492 10.35 20.3134 10.35 19.8992V18.6507H10.85C11.513 18.6507 12.1489 18.3873 12.6178 17.9185C13.0866 17.4497 13.35 16.8138 13.35 16.1507C13.35 15.4877 13.0866 14.8518 12.6178 14.383C12.1489 13.9141 11.513 13.6507 10.85 13.6507H10.35V11.6507H12.1C12.5142 11.6507 12.85 11.3149 12.85 10.9007C12.85 10.4865 12.5142 10.1507 12.1 10.1507H10.35V8.89917ZM8.85001 11.6507H8.35001C8.08479 11.6507 7.83044 11.7561 7.6429 11.9436C7.45536 12.1312 7.35001 12.3855 7.35001 12.6507C7.35001 12.9159 7.45536 13.1703 7.6429 13.3578C7.83044 13.5454 8.08479 13.6507 8.35001 13.6507H8.85001V11.6507ZM10.35 15.1507V17.1507H10.85C11.1152 17.1507 11.3696 17.0454 11.5571 16.8578C11.7446 16.6703 11.85 16.4159 11.85 16.1507C11.85 15.8855 11.7446 15.6312 11.5571 15.4436C11.3696 15.2561 11.1152 15.1507 10.85 15.1507H10.35Z" fill="${fillColor}"/>
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

export default ThemedLiquIDityOutlineIcon;

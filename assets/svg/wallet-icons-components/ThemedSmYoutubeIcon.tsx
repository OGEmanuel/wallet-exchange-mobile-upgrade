import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedSmYoutubeIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSmYoutubeIcon: React.FC<ThemedSmYoutubeIconProps> = ({ 
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
<g clip-path="url(#clip0_84_1436)">
<mask id="mask0_84_1436" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0"  >
<path d="M0 0H24V24H0V0Z" fill="white"/>
</mask>
<g mask="url(#mask0_84_1436)">
<path d="M23.5 6.50695C23.3641 6.02219 23.0994 5.5833 22.734 5.23695C22.3583 4.87996 21.8978 4.62459 21.396 4.49495C19.518 3.99995 11.994 3.99995 11.994 3.99995C8.85734 3.96427 5.72144 4.12123 2.60401 4.46995C2.1022 4.60917 1.64257 4.87024 1.26601 5.22995C0.896007 5.58595 0.628007 6.02495 0.488007 6.50595C0.1517 8.3177 -0.0117011 10.1573 6.83166e-06 12C-0.0119932 13.841 0.151007 15.68 0.488007 17.494C0.625007 17.973 0.892007 18.41 1.26301 18.763C1.63401 19.116 2.09601 19.371 2.60401 19.506C4.50701 20 11.994 20 11.994 20C15.1347 20.0357 18.2746 19.8787 21.396 19.53C21.8978 19.4003 22.3583 19.145 22.734 18.788C23.0993 18.4417 23.3637 18.0027 23.499 17.518C23.8441 15.7069 24.0119 13.8665 24 12.023C24.026 10.1716 23.8584 8.32352 23.5 6.50695ZM9.60201 15.424V8.57695L15.862 12.001L9.60201 15.424Z" fill="${fillColor}"/>
</g>
</g>
<defs>
<clipPath id="clip0_84_1436">
<rect   fill="white"/>
</clipPath>
</defs>
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

export default ThemedSmYoutubeIcon;

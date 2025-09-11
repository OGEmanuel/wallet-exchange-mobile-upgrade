import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedRadioTrueIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedRadioTrueIcon: React.FC<ThemedRadioTrueIconProps> = ({ 
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
<path d="M8 1.33264C11.6827 1.33264 14.668 4.31798 14.668 8.00064C14.668 11.6826 11.6827 14.668 8 14.668C4.31733 14.668 1.332 11.6826 1.332 8.00064C1.332 4.31798 4.31733 1.33264 8 1.33264ZM8 2.33264C7.25054 2.32451 6.50691 2.46511 5.81215 2.74629C5.11738 3.02747 4.48529 3.44365 3.95244 3.97075C3.4196 4.49785 2.99658 5.1254 2.70788 5.81707C2.41918 6.50874 2.27053 7.2508 2.27053 8.00031C2.27053 8.74981 2.41918 9.49188 2.70788 10.1835C2.99658 10.8752 3.4196 11.5028 3.95244 12.0299C4.48529 12.557 5.11738 12.9731 5.81215 13.2543C6.50691 13.5355 7.25054 13.6761 8 13.668C9.48802 13.6452 10.9074 13.038 11.9516 11.9777C12.9958 10.9173 13.5811 9.48883 13.5811 8.00064C13.5811 6.51245 12.9958 5.08396 11.9516 4.02361C10.9074 2.96327 9.48802 2.35547 8 2.33264ZM7.99733 3.99997C9.05785 3.99997 10.0749 4.42126 10.8248 5.17116C11.5747 5.92105 11.996 6.93813 11.996 7.99864C11.996 9.05915 11.5747 10.0762 10.8248 10.8261C10.0749 11.576 9.05785 11.9973 7.99733 11.9973C6.93682 11.9973 5.91975 11.576 5.16985 10.8261C4.41995 10.0762 3.99867 9.05915 3.99867 7.99864C3.99867 6.93813 4.41995 5.92105 5.16985 5.17116C5.91975 4.42126 6.93682 3.99997 7.99733 3.99997Z" fill="${fillColor}"/>
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

export default ThemedRadioTrueIcon;

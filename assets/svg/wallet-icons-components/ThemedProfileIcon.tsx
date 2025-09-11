import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface ThemedProfileIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedProfileIcon: React.FC<ThemedProfileIconProps> = ({ 
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
<path d="M22.0688 19.6875C20.7539 17.4203 18.7125 15.6631 16.275 14.7C17.4713 13.8028 18.355 12.5518 18.8009 11.1244C19.2468 9.69705 19.2323 8.16555 18.7594 6.74688C18.2865 5.3282 17.3792 4.09428 16.1661 3.2199C14.9529 2.34552 13.4954 1.875 12 1.875C10.5046 1.875 9.04708 2.34552 7.83394 3.2199C6.6208 4.09428 5.71352 5.3282 5.24063 6.74688C4.76774 8.16555 4.75321 9.69705 5.19909 11.1244C5.64498 12.5518 6.52867 13.8028 7.725 14.7C5.28747 15.6631 3.24615 17.4203 1.93125 19.6875C1.78207 19.9461 1.74172 20.2533 1.81908 20.5417C1.89643 20.83 2.08517 21.0758 2.34375 21.225C2.60234 21.3742 2.9096 21.4145 3.19793 21.3372C3.48627 21.2598 3.73207 21.0711 3.88125 20.8125C4.70411 19.3874 5.88758 18.2041 7.31271 17.3813C8.73784 16.5586 10.3544 16.1254 12 16.1254C13.6456 16.1254 15.2622 16.5586 16.6873 17.3813C18.1124 18.2041 19.2959 19.3874 20.1188 20.8125C20.2183 20.983 20.3606 21.1246 20.5316 21.2232C20.7026 21.3219 20.8963 21.3742 21.0938 21.375C21.2913 21.3766 21.4857 21.3248 21.6563 21.225C21.7844 21.1512 21.8966 21.0529 21.9867 20.9356C22.0768 20.8184 22.1429 20.6845 22.1812 20.5417C22.2195 20.399 22.2293 20.25 22.21 20.1034C22.1907 19.9569 22.1427 19.8155 22.0688 19.6875ZM7.125 9C7.125 8.03582 7.41092 7.09329 7.94659 6.2916C8.48226 5.48991 9.24363 4.86506 10.1344 4.49609C11.0252 4.12711 12.0054 4.03057 12.9511 4.21867C13.8967 4.40677 14.7654 4.87107 15.4471 5.55285C16.1289 6.23464 16.5932 7.10328 16.7813 8.04893C16.9694 8.99459 16.8729 9.97479 16.5039 10.8656C16.1349 11.7564 15.5101 12.5177 14.7084 13.0534C13.9067 13.5891 12.9642 13.875 12 13.875C10.7071 13.875 9.4671 13.3614 8.55286 12.4471C7.63862 11.5329 7.125 10.2929 7.125 9Z" fill="${fillColor}"/>
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

export default ThemedProfileIcon;

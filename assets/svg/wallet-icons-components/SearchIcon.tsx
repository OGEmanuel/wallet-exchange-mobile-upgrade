import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SearchIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#666666' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchIcon;

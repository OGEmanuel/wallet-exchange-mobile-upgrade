import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={21}
      viewBox="0 0 20 21"
      fill="none"
      {...props}
    >
      <Path
        d="M6.667 9.881a.833.833 0 000 1.667h6.667a.833.833 0 000-1.667H6.667z"
        fill="#FF696A"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.167 10.714a9.167 9.167 0 11-18.334 0 9.167 9.167 0 0118.334 0zm-1.667 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        fill="#FF696A"
      />
    </Svg>
  );
}

export default SvgComponent;

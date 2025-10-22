import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function ThemedUnlinkIcon2(props: SvgProps) {
  return (
    <Svg
      width={21}
      height={20}
      viewBox="0 0 21 20"
      fill="none"
      {...props}
    >
      <Path
        d="M10.619 8.91l.172-.173a4.223 4.223 0 015.972 5.971l-2.389 2.389a4.222 4.222 0 01-5.971-5.972l.386-.387"
        stroke="#FBFBFB"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.21 9.262l.386-.387a4.223 4.223 0 10-5.972-5.971L9.236 5.292a4.223 4.223 0 105.972 5.972l.172-.173M4.25 3.334L5.5 5M2.165 6.667l2.5.833m-1.667 3.75L4.666 10"
        stroke="#FBFBFB"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default ThemedUnlinkIcon2;

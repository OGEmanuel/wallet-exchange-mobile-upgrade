import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function ZapShieldLogo(props: SvgProps) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      {/* Shield shape - more rounded and centered */}
      <Path
        d="M20 3L7 8.5V17.5C7 25.2 12.2 31.8 20 35.5C27.8 31.8 33 25.2 33 17.5V8.5L20 3Z"
        fill="rgba(255, 255, 255, 0.25)"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth={1.5}
      />
      {/* Zap logo inside shield - centered at 20,20 and properly scaled */}
      <Path
        d="M24.2 20.2l-.2.8-9.8 2.3c.3-4.5 2-9.1 2-9.1-.55 0-3.7.3-3.7.3l.1-3.7 9.8-0.7c0 0-1.45 5.4-2.05 9.3l5.2-0.8-.7 2.6v-1.6z"
        fill="#DDFF55"
      />
    </Svg>
  );
}

export default ZapShieldLogo;


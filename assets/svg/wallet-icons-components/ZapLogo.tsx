import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function SvgComponent(props: SvgProps) {
  return (
    <Svg
      width={25}
      height={25}
      viewBox="0 0 40 41"
      fill="none"
      {...props}
    >
      <Path
        d="M30.538.5H9.462A9.463 9.463 0 000 9.963v21.075A9.462 9.462 0 009.463 40.5h21.075A9.462 9.462 0 0040 31.038V9.962A9.462 9.462 0 0030.538.5z"
        fill="#6045FF"
      />
      <Path
        d="M28.962 26.5l-.307 1.235-15.994 3.768c.523-7.368 3.42-14.953 3.42-14.953-.891 0-6.12.445-6.12.445l.147-6.098 15.931-1.19S22.4 18.41 21.58 23.47l8.472-1.337-1.09 4.37V26.5z"
        fill="#DF5"
      />
    </Svg>
  );
}

export default SvgComponent;

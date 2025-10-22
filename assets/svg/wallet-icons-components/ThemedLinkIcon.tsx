import * as React from "react";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from "react-native-svg";

function ThemedLinkIcon(props: SvgProps) {
  return (
    <Svg
      width={91}
      height={48}
      viewBox="0 0 91 48"
      fill="none"
      {...props}
    >
      <G clipPath="url(#clip0_3160_30472)">
        <Path
          d="M44.733 47.91H18.196C8.426 47.91.479 39.963.479 30.193s7.947-17.717 17.717-17.717H44.73c9.77 0 17.717 7.947 17.717 17.717S54.5 47.91 44.73 47.91h.002zM18.196 21.112c-5.008 0-9.081 4.073-9.081 9.08 0 5.008 4.073 9.081 9.08 9.081h26.536c5.007 0 9.08-4.073 9.08-9.08 0-5.008-4.073-9.081-9.08-9.081H18.196z"
          fill="url(#paint0_linear_3160_30472)"
          stroke="#374015"
          strokeMiterlimit={10}
        />
        <Path
          d="M90.61 17.719c0 9.768-7.947 17.717-17.717 17.717H46.356c-8.607 0-15.802-6.173-17.39-14.324h8.968c1.346 3.332 4.615 5.688 8.422 5.688h26.537c5.008 0 9.081-4.074 9.081-9.081s-4.073-9.083-9.08-9.083H46.355a9.078 9.078 0 00-7.41 3.84H29.43C31.671 5.257 38.413 0 46.356 0h26.537c9.77 0 17.717 7.949 17.717 17.719z"
          fill="url(#paint1_linear_3160_30472)"
        />
        <Path
          d="M72.895 35.436H46.36c-9.77 0-17.717-7.948-17.717-17.717a4.32 4.32 0 018.636 0c0 5.007 4.073 9.08 9.08 9.08h26.536c5.007 0 9.08-4.073 9.08-9.08a4.32 4.32 0 018.637 0c0 9.77-7.947 17.717-17.717 17.717z"
          fill="url(#paint2_linear_3160_30472)"
        />
        <Path
          d="M62.122 26.8h-8.967c-1.346-3.331-4.614-5.688-8.422-5.688H18.196c-5.008 0-9.081 4.073-9.081 9.08 0 .796.102 1.584.304 2.343a4.318 4.318 0 11-8.347 2.219 17.755 17.755 0 01-.593-4.561c0-9.77 7.949-17.717 17.717-17.717h26.537c8.609 0 15.802 6.171 17.39 14.323z"
          fill="url(#paint3_linear_3160_30472)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_3160_30472"
          x1={32.1487}
          y1={3.17894}
          x2={30.3386}
          y2={74.5222}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#DF5" />
          <Stop offset={1} stopColor="#DF5" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_3160_30472"
          x1={60.4705}
          y1={-9.29712}
          x2={58.6507}
          y2={62.0493}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#DF5" stopOpacity={0} />
          <Stop offset={1} stopColor="#DF5" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_3160_30472"
          x1={60.2576}
          y1={4.34737}
          x2={59.4454}
          y2={44.0325}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.03} stopColor="#DF5" stopOpacity={0} />
          <Stop offset={0.09} stopColor="#DF5" stopOpacity={0.0324} />
          <Stop offset={0.17} stopColor="#DF5" stopOpacity={0.1369} />
          <Stop offset={0.25} stopColor="#DF5" stopOpacity={0.2916} />
          <Stop offset={0.33} stopColor="#DF5" stopOpacity={0.4624} />
          <Stop offset={0.41} stopColor="#DF5" stopOpacity={0.64} />
          <Stop offset={0.5} stopColor="#DF5" stopOpacity={0.7921} />
          <Stop offset={0.6} stopColor="#DF5" stopOpacity={0.9025} />
          <Stop offset={0.71} stopColor="#DF5" stopOpacity={0.9801} />
          <Stop offset={0.85} stopColor="#DF5" />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_3160_30472"
          x1={31.9274}
          y1={2.00404}
          x2={30.8352}
          y2={47.9007}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.03} stopColor="#DF5" stopOpacity={0} />
          <Stop offset={0.09} stopColor="#DF5" stopOpacity={0.0324} />
          <Stop offset={0.17} stopColor="#DF5" stopOpacity={0.1369} />
          <Stop offset={0.25} stopColor="#DF5" stopOpacity={0.2916} />
          <Stop offset={0.33} stopColor="#DF5" stopOpacity={0.4624} />
          <Stop offset={0.41} stopColor="#DF5" stopOpacity={0.64} />
          <Stop offset={0.5} stopColor="#DF5" stopOpacity={0.7921} />
          <Stop offset={0.6} stopColor="#DF5" stopOpacity={0.9025} />
          <Stop offset={0.71} stopColor="#DF5" stopOpacity={0.9801} />
          <Stop offset={0.85} stopColor="#DF5" />
        </LinearGradient>
        <ClipPath id="clip0_3160_30472">
          <Path
            fill="#fff"
            transform="translate(.389)"
            d="M0 0H90.2227V48H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default ThemedLinkIcon;

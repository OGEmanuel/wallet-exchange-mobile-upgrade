import { createTheme } from "@shopify/restyle";

const COLOR_PALLET = {
  primaryColor: "#6045FF",
  fadedPrimary: "#A0BDF9",
  mainBackgroundColor: "#FFFFFF",
  secondaryBackgroundColor: "#F9F9F9",
  headerTextColor: "#121212",
  disabledTextColor: "#92969D",
  bodyTextColor: "#121212",
  whiteBodyText: "#F2F4F7",
  whiteHeaderText: "#FFFFFF",
  error: "#F04438",
  btnBgColor: "#FFFFFF",
  black: "black",
  white: "white",
  lightBlue: "#F5F8FF",
  borderColor: "#4C4C54",
  inActiveBtnColor: "#5A5D64",
  success: "#35B592",
  tabBarActiveColor: "#C7E64D",
  fadedPrimaryColor: "#CFD1FF",
  pendingColor: "#EDB118",
};

const DARK_COLOR_PALLET = {
  primaryColor: "#6045FF",
  fadedPrimary: "#A0BDF9",
  mainBackgroundColor: "#1F232D",
  secondaryBackgroundColor: "#2F333D",
  headerTextColor: "#FBFBFB",
  disabledTextColor: "#92969D",
  bodyTextColor: "#FBFBFB",
  whiteBodyText: "#F2F4F7",
  whiteHeaderText: "#FFFFFF",
  error: "#F04438",
  btnBgColor: "#FFFFFF",
  black: "black",
  white: "white",
  lightBlue: "#F5F8FF",
  borderColor: "#4C4C54",
  inActiveBtnColor: "#5A5D64",
  success: "#35B592",
  tabBarActiveColor: "#C7E64D",
  fadedPrimaryColor: "#CFD1FF",
  pendingColor: "#EDB118",
};

const theme = createTheme({
  colors: {
    ...COLOR_PALLET,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
    "2xl": 48,
    "3xl": 56,
    "4xl": 64,
    "5xl": "",
  },
  textVariants: {
    header2: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    header2_italic: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    header: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    subheader: {
      fontSize: 24,
      color: "headerTextColor",
      fontFamily: "NewScience_SemiBold",
    },
    medium: {
      fontSize: 18,
      color: "headerTextColor",
      fontFamily: "NewScience_Medium",
    },
    bodyBold: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Bold",
      // lineHeight: 22.4,
    },
    bodySubheader: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_SemiBold",
      // lineHeight: 22.4,
    },
    bodyMedium: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Medium",
      // lineHeight: 22.4,
    },
    body: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Regular",
      // lineHeight: 22.4,
    },
    light: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Light",
    },
    xs: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Light",
    },
    defaults: {
      fontSize: 15,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Regular",
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    ...DARK_COLOR_PALLET,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
    "2xl": 48,
    "3xl": 56,
    "4xl": 64,
    "5xl": "",
  },
  textVariants: {
    header2: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    header2_italic: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    header: {
      fontSize: 30,
      color: "headerTextColor",
      fontFamily: "NewScience_Bold",
    },
    subheader: {
      fontSize: 24,
      color: "headerTextColor",
      fontFamily: "NewScience_SemiBold",
    },
    medium: {
      fontSize: 18,
      color: "headerTextColor",
      fontFamily: "NewScience_Medium",
    },
    bodyBold: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Bold",
      // lineHeight: 22.4,
    },
    bodySubheader: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_SemiBold",
      // lineHeight: 22.4,
    },
    bodyMedium: {
      fontSize: 16,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Medium",
      // lineHeight: 22.4,
    },
    body: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Regular",
      // lineHeight: 22.4,
    },
    light: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Light",
    },
    xs: {
      fontSize: 14,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Light",
    },
    defaults: {
      fontSize: 15,
      color: "bodyTextColor",
      fontFamily: "PlusJakartaSans_Regular",
    },
  },
});

export type Theme = typeof theme;
export default theme;

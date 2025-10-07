import { atom } from "jotai";
import { Appearance } from "react-native";

// Initialize with system preference instead of hardcoded "light"
const getInitialTheme = (): "light" | "dark" => {
  const systemTheme = Appearance.getColorScheme();
  return systemTheme === "dark" ? "dark" : "light";
};

export const colorThemeAtom = atom<"light" | "dark">(getInitialTheme());

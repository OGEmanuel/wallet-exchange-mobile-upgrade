import {
  Appearance,
  NativeEventSubscription,
  useColorScheme,
} from "react-native";
import React from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/state/storagekeys";
import { colorThemeAtom } from "@/state/theme.atom";
import { useAtom } from "jotai";

const useActiveTheme = () => {
  const colorScheme = useColorScheme();
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);

  React.useEffect(() => {
    // check storage first
    let subscription: NativeEventSubscription;
    (async function () {
      subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setColorTheme(colorScheme as "dark" | "light");
      });
      const colorTheme: "dark" | "light" | null =
        (await SecureStore.getItemAsync(STORAGE_KEYS.COLOR_THEME)) as
          | "dark"
          | "light"
          | null;
      if (colorTheme) {
        setColorTheme(colorTheme);
      } else {
        const isDarkMode = Appearance.getColorScheme() === "dark";
        console.log("this is from the colorScheme", isDarkMode);
        setColorTheme(isDarkMode ? "dark" : "light");
      }
    })();

    return () => subscription.remove();
  }, [colorScheme]);
  return colorTheme;
};

export default useActiveTheme;

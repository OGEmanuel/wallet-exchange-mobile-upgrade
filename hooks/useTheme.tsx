import { STORAGE_KEYS } from "@/state/storagekeys";
import { colorThemeAtom } from "@/state/theme.atom";
import * as SecureStore from "expo-secure-store";
import { useAtom } from "jotai";
import React from "react";
import { Appearance } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

/**
 * Hook to get and manage the current active theme
 * Theme initialization is handled in _layout.tsx to avoid conflicts
 */
const useActiveTheme = () => {
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>("dark");

  // Load the theme mode on mount
  React.useEffect(() => {
    const loadThemeMode = async () => {
      const savedMode = await SecureStore.getItemAsync(STORAGE_KEYS.THEME_MODE);
      if (
        savedMode === "light" ||
        savedMode === "dark" ||
        savedMode === "system"
      ) {
        setThemeModeState(savedMode);
      } else {
        // Default to system if not set
        setThemeModeState("system");
      }
    };
    loadThemeMode();
  }, []);

  const toggleTheme = async () => {
    const newTheme = colorTheme === "dark" ? "light" : "dark";
    setColorTheme(newTheme);
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, newTheme);
    await SecureStore.setItemAsync(STORAGE_KEYS.THEME_MODE, newTheme);
    setThemeModeState(newTheme);
    // Mark as user-set so it won't follow system changes
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET, "true");
  };
  
  const setTheme = async (theme: "light" | "dark") => {
    setColorTheme(theme);
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, theme);
    await SecureStore.setItemAsync(STORAGE_KEYS.THEME_MODE, theme);
    setThemeModeState(theme);
    // Mark as user-set so it won't follow system changes
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET, 'true');
  };

  const setSystemTheme = async () => {
    // Remove the user-set flag to follow system theme again
    await SecureStore.deleteItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET);
    await SecureStore.setItemAsync(STORAGE_KEYS.THEME_MODE, "system");
    setThemeModeState("system");

    // Apply current system theme
    const systemTheme = Appearance.getColorScheme();
    const theme = systemTheme === "dark" ? "dark" : "light";
    setColorTheme(theme);
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, theme);
  };

  const resetToSystemTheme = async () => {
    await setSystemTheme();
  };

  return {
    colorTheme,
    themeMode,
    toggleTheme,
    setTheme,
    setSystemTheme,
    resetToSystemTheme,
  };
};

export default useActiveTheme;

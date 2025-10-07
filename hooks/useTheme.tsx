import { colorThemeAtom } from "@/state/theme.atom";
import { STORAGE_KEYS } from "@/state/storagekeys";
import { useAtom } from "jotai";
import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";

/**
 * Hook to get and manage the current active theme
 * Theme initialization is handled in _layout.tsx to avoid conflicts
 */
const useActiveTheme = () => {
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);
  
  const toggleTheme = async () => {
    const newTheme = colorTheme === "dark" ? "light" : "dark";
    setColorTheme(newTheme);
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, newTheme);
    // Mark as user-set so it won't follow system changes
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET, 'true');
  };
  
  const setTheme = async (theme: "light" | "dark") => {
    setColorTheme(theme);
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, theme);
    // Mark as user-set so it won't follow system changes
    await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET, 'true');
  };
  
  const resetToSystemTheme = async () => {
     // Remove the user-set flag to follow system theme again
    await SecureStore.deleteItemAsync(STORAGE_KEYS.COLOR_THEME_USER_SET);
     const systemTheme = Appearance.getColorScheme();
     const theme = systemTheme === "dark" ? "dark" : "light";
     setColorTheme(theme);
     await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, theme);
   };
  
  return {
     colorTheme,
     toggleTheme,
     setTheme,
     resetToSystemTheme,
   };
};

export default useActiveTheme;

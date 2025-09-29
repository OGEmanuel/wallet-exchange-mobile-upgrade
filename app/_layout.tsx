import BottomSheetManager from "@/components/bottomsheet/BottomSheetManager";
import { BottomSheetProvider } from "@/src/core/contexts/bottomsheet";
import { store } from "@/state";
import { STORAGE_KEYS } from "@/state/storagekeys";
import { colorThemeAtom } from "@/state/theme.atom";
import theme, { darkTheme } from "@/theme";
import { ThemeProvider } from "@shopify/restyle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import {
  Appearance,
  NativeEventSubscription,
  StatusBar,
  View,
  useColorScheme,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
        refetchOnMount: false,
      },
    },
  });
  SplashScreen.preventAutoHideAsync();
  const colorScheme = useColorScheme();
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);

  const [fontsLoaded, error] = useFonts({
    // Plus Jakarta Sans fonts
    PlusJakartaSans_Regular: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    PlusJakartaSans_Light: require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    PlusJakartaSans_Medium: require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    PlusJakartaSans_Bold: require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    PlusJakartaSans_ExtraBold: require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    PlusJakartaSans_SemiBold: require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),

    // New Science fonts
    NewScience_Regular: require("../assets/fonts/New_Science_Regular.otf"),
    NewScience_Light: require("../assets/fonts/New_Science_Light.otf"),
    NewScience_Medium: require("../assets/fonts/New_Science_Medium.otf"),
    NewScience_Bold: require("../assets/fonts/New_Science_Bold.otf"),
    NewScience_SemiBold: require("../assets/fonts/New_Science_SemiBold.otf"),
    NewScience_Thin: require("../assets/fonts/New_Science_Thin.otf"),
    NewScience_Bold_Extended: require("../assets/fonts/New_Science_Bold_Extended.otf"),
    NewScience_Light_Extended: require("../assets/fonts/New_Science_Light_Extended.otf"),
    NewScience_Medium_Extended: require("../assets/fonts/New_Science_Medium_Extended.otf"),
    NewScience_Regular_Extended: require("../assets/fonts/New_Science_Regular_Extended.otf"),
    NewScience_SemiBold_Extended: require("../assets/fonts/New_Science_SemiBold_Extended.otf"),
    NewScience_Thin_Extended: require("../assets/fonts/New_Science_Thin_Extended.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  React.useEffect(() => {
    let subscription: NativeEventSubscription;

    const initializeTheme = async () => {
      // Check if user has manually set a preference (we'll use a separate key for this)
      const userSetTheme = await SecureStore.getItemAsync(
        STORAGE_KEYS.COLOR_THEME_USER_SET
      );
      const savedTheme: "dark" | "light" | null =
        (await SecureStore.getItemAsync(STORAGE_KEYS.COLOR_THEME)) as
          | "dark"
          | "light"
          | null;

      if (userSetTheme === "true" && savedTheme) {
        // User has manually set a preference, use it
        setColorTheme(savedTheme);
      } else {
        // Follow system preference
        const systemTheme = Appearance.getColorScheme();
        const theme = systemTheme === "dark" ? "dark" : "light";
        setColorTheme(theme);
        // Save the current system preference but don't mark as user-set
        await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, theme);
      }

      // Always listen for system theme changes
      subscription = Appearance.addChangeListener(async ({ colorScheme }) => {
        const isUserSet = await SecureStore.getItemAsync(
          STORAGE_KEYS.COLOR_THEME_USER_SET
        );
        if (isUserSet !== "true") {
          // Only follow system changes if user hasn't manually set a preference
          const newTheme = colorScheme === "dark" ? "dark" : "light";
          setColorTheme(newTheme);
          await SecureStore.setItemAsync(STORAGE_KEYS.COLOR_THEME, newTheme);
        }
      });
    };

    initializeTheme();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []); // Remove colorScheme dependency to prevent unnecessary re-runs

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, position: "relative" }}>
        <GestureHandlerRootView>
          <Provider store={store}>
            <ThemeProvider theme={colorTheme === "dark" ? darkTheme : theme}>
              <QueryClientProvider client={queryClient}>
                <BottomSheetProvider>
                  <StatusBar
                    barStyle={
                      colorTheme === "dark" ? "light-content" : "dark-content"
                    }
                  />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ title: "Home" }} />
                  </Stack>
                  <BottomSheetManager />
                </BottomSheetProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </Provider>
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
  );
}

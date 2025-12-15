// Import polyfills for React Native
import { Buffer } from "buffer";
import "react-native-get-random-values";

import { AppInitializer } from "@/components/AppInitializer";
import { PinGuard } from "@/components/auth/PinGuard";
import BottomSheetManager from "@/components/bottomsheet/BottomSheetManager";
import LoadingModal from "@/components/Modals/LoadingModal";
import { InternetConnectionProvider } from "@/context/InternetConnectionContext";
import { ChainsProvider } from "@/src/core/chains/chains-context";
import { BottomSheetProvider } from "@/src/core/contexts/bottomsheet";
import { NetworkProvider } from "@/src/core/contexts/NetworkContext";
import { OnboardingProvider } from "@/src/core/contexts/onboarding";
import { TwoFactorAuthProvider } from "@/src/core/contexts/two-factor-auth/TwoFactorAuthContext";
import { SupportedCurrenciesProvider } from "@/src/core/supported-currencies/supported-currencies-context";
import { WalletProvider, useWallet } from "@/src/core/wallet/wallet-context";
import { WebSocketProvider } from "@/src/core/websocket/WebSocketProvider";
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
import React, { useEffect, useState } from "react";
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
import {
  AppBottomSheetManager,
  AppBottomSheetProvider,
  ExchangeOnboardingProvider,
} from "./V2/exchange/onboarding";

// Set Buffer as global for Node.js compatibility
global.Buffer = Buffer;

// Component to handle app-wide loading modal
const AppLoadingModal = () => {
  const {
    isAccountDeriving,
    isRetryingPendingWallets,
    isInitializing,
    isAuthenticating,
    isCreatingWallet,
  } = useWallet();

  const getLoadingMessage = () => {
    if (isRetryingPendingWallets) return "Loading Wallet";
    if (isInitializing) return "Initializing...";
    if (isAuthenticating) return "Authenticating...";
    if (isCreatingWallet) return "Creating Wallet...";
    return "Loading...";
  };

  return (
    <LoadingModal
      isVisible={isAccountDeriving}
      message={getLoadingMessage()}
      onClose={() => {}}
    />
  );
};

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

  // Prevent auto-hide and track initialization state
  SplashScreen.preventAutoHideAsync();
  const [isAppReady, setIsAppReady] = useState(false);
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

  // Hide splash screen when fonts are loaded and app is ready
  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded || error) {
          // Wait for app initialization
          if (isAppReady) {
            console.log("Hiding splash screen - all ready");
            await SplashScreen.hideAsync();
          }
        }
      } catch (e) {
        console.warn("Error hiding splash screen:", e);
        // Force hide splash screen even if there's an error
        try {
          await SplashScreen.hideAsync();
        } catch (hideError) {
          console.error("Failed to hide splash screen:", hideError);
        }
      }
    }

    prepare();
  }, [fontsLoaded, error, isAppReady]);

  // Additional safety net - force hide splash screen after 5 seconds
  useEffect(() => {
    const safetyTimeout = setTimeout(async () => {
      try {
        console.log("Safety timeout - forcing splash screen hide");
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error("Safety timeout failed to hide splash screen:", e);
      }
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Fallback timeout to ensure app doesn't get stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAppReady) {
        console.warn("App initialization timeout, forcing app ready state");
        setIsAppReady(true);
      }
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timeout);
  }, [isAppReady]);

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

  // Early return after all hooks are called
  if (!fontsLoaded && !error) {
    return null;
  }

  // Don't render anything until app is ready - this keeps splash screen visible
  if (!isAppReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, position: "relative" }}>
        <GestureHandlerRootView>
          <Provider store={store}>
            <ThemeProvider theme={colorTheme === "dark" ? darkTheme : theme}>
              <QueryClientProvider client={queryClient}>
                <InternetConnectionProvider>
                  <NetworkProvider>
                    <SupportedCurrenciesProvider>
                      <ChainsProvider>
                        <WalletProvider>
                          <AppInitializer>
                            <WebSocketProvider>
                              <ExchangeOnboardingProvider>
                                <AppBottomSheetProvider>
                                  <OnboardingProvider>
                                    <TwoFactorAuthProvider>
                                      <BottomSheetProvider>
                                        <StatusBar
                                          barStyle={
                                            colorTheme === "dark"
                                              ? "light-content"
                                              : "dark-content"
                                          }
                                        />
                                        <PinGuard />
                                        <Stack
                                          screenOptions={{ headerShown: false }}
                                        >
                                          <Stack.Screen
                                            name="index"
                                            options={{ title: "Home" }}
                                          />
                                          <Stack.Screen
                                            name="(modal)"
                                            options={{ presentation: "modal" }}
                                          />
                                        </Stack>
                                        <BottomSheetManager />
                                        <AppBottomSheetManager />
                                        <AppLoadingModal />
                                      </BottomSheetProvider>
                                    </TwoFactorAuthProvider>
                                  </OnboardingProvider>
                                </AppBottomSheetProvider>
                              </ExchangeOnboardingProvider>
                            </WebSocketProvider>
                          </AppInitializer>
                        </WalletProvider>
                      </ChainsProvider>
                    </SupportedCurrenciesProvider>
                  </NetworkProvider>
                </InternetConnectionProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </Provider>
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
  );
}

import { STORAGE_KEYS } from "@/state/storagekeys";
import * as SecureStore from "expo-secure-store";
import React from "react";

/**
 * Hook to manage app preferences like haptics and animations
 */
const usePreferences = () => {
  const [hapticsEnabled, setHapticsEnabledState] = React.useState(true);
  const [animationsEnabled, setAnimationsEnabledState] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load preferences on mount
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const haptics = await SecureStore.getItemAsync(
          STORAGE_KEYS.HAPTICS_ENABLED
        );
        const animations = await SecureStore.getItemAsync(
          STORAGE_KEYS.ANIMATIONS_ENABLED
        );

        // Default to true if not set
        setHapticsEnabledState(haptics === "false" ? false : true);
        setAnimationsEnabledState(animations === "false" ? false : true);
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const setHapticsEnabled = async (enabled: boolean) => {
    try {
      setHapticsEnabledState(enabled);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.HAPTICS_ENABLED,
        enabled ? "true" : "false"
      );
    } catch (error) {
      console.error("Error setting haptics enabled:", error);
    }
  };

  const setAnimationsEnabled = async (enabled: boolean) => {
    try {
      setAnimationsEnabledState(enabled);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.ANIMATIONS_ENABLED,
        enabled ? "true" : "false"
      );
    } catch (error) {
      console.error("Error setting animations enabled:", error);
    }
  };

  const toggleHaptics = async () => {
    await setHapticsEnabled(!hapticsEnabled);
  };

  const toggleAnimations = async () => {
    await setAnimationsEnabled(!animationsEnabled);
  };

  return {
    hapticsEnabled,
    animationsEnabled,
    isLoading,
    setHapticsEnabled,
    setAnimationsEnabled,
    toggleHaptics,
    toggleAnimations,
  };
};

export default usePreferences;

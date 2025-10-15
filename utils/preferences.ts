import { STORAGE_KEYS } from "@/state/storagekeys";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";

/**
 * Utility functions for checking and using app preferences
 */

/**
 * Check if haptics are enabled
 */
export const isHapticsEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEYS.HAPTICS_ENABLED);
    return value !== "false"; // Default to true if not set
  } catch (error) {
    console.error("Error checking haptics enabled:", error);
    return true; // Default to true on error
  }
};

/**
 * Check if animations are enabled
 */
export const isAnimationsEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(
      STORAGE_KEYS.ANIMATIONS_ENABLED
    );
    return value !== "false"; // Default to true if not set
  } catch (error) {
    console.error("Error checking animations enabled:", error);
    return true; // Default to true on error
  }
};

/**
 * Trigger haptic feedback if enabled
 * @param style - The haptic feedback style
 */
export const triggerHaptic = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): Promise<void> => {
  try {
    const enabled = await isHapticsEnabled();
    if (enabled) {
      await Haptics.impactAsync(style);
    }
  } catch (error) {
    console.error("Error triggering haptic:", error);
  }
};

/**
 * Trigger notification haptic if enabled
 * @param type - The notification type
 */
export const triggerNotificationHaptic = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType
    .Success
): Promise<void> => {
  try {
    const enabled = await isHapticsEnabled();
    if (enabled) {
      await Haptics.notificationAsync(type);
    }
  } catch (error) {
    console.error("Error triggering notification haptic:", error);
  }
};

/**
 * Trigger selection haptic if enabled
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  try {
    const enabled = await isHapticsEnabled();
    if (enabled) {
      await Haptics.selectionAsync();
    }
  } catch (error) {
    console.error("Error triggering selection haptic:", error);
  }
};

# App Preferences Usage Guide

This guide explains how to use the haptics and animations preferences system in the app.

## Overview

The app now supports user preferences for:
- **Haptics**: Enable/disable haptic feedback throughout the app
- **Animations**: Enable/disable animations (can be used to reduce motion)

## Storage Keys

Located in `/state/storagekeys.ts`:
```typescript
HAPTICS_ENABLED: "hapticsEnabled"      // "true" | "false"
ANIMATIONS_ENABLED: "animationsEnabled" // "true" | "false"
```

## Using the Hook

### In React Components

```typescript
import usePreferences from "@/hooks/usePreferences";

function MyComponent() {
  const {
    hapticsEnabled,
    animationsEnabled,
    isLoading,
    setHapticsEnabled,
    setAnimationsEnabled,
    toggleHaptics,
    toggleAnimations,
  } = usePreferences();

  // Check if haptics are enabled
  if (hapticsEnabled) {
    // Trigger haptic feedback
  }

  // Check if animations are enabled
  if (animationsEnabled) {
    // Run animation
  }

  return (
    <Switch 
      value={hapticsEnabled} 
      onValueChange={toggleHaptics} 
    />
  );
}
```

## Using Utility Functions

For non-React contexts or when you need async checks:

```typescript
import { 
  triggerHaptic, 
  triggerNotificationHaptic,
  triggerSelectionHaptic,
  isHapticsEnabled,
  isAnimationsEnabled 
} from "@/utils/preferences";
import * as Haptics from "expo-haptics";

// Trigger haptic with default medium impact
await triggerHaptic();

// Trigger haptic with specific style
await triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
await triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

// Trigger notification haptic
await triggerNotificationHaptic(Haptics.NotificationFeedbackType.Success);
await triggerNotificationHaptic(Haptics.NotificationFeedbackType.Error);
await triggerNotificationHaptic(Haptics.NotificationFeedbackType.Warning);

// Trigger selection haptic (for picker/selector changes)
await triggerSelectionHaptic();

// Check preferences manually
const hapticsOn = await isHapticsEnabled();
const animationsOn = await isAnimationsEnabled();
```

## Example: Updating CustomButton

To respect haptics preferences in the existing CustomButton:

```typescript
import { triggerHaptic } from "@/utils/preferences";
import * as Haptics from "expo-haptics";

const handlePress = async () => {
  if (isLoading || disabled) return;
  
  if (shouldVibrate) {
    await triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  }
  
  onPress();
};
```

## Example: Conditional Animations

```typescript
import { Animated } from "react-native";
import usePreferences from "@/hooks/usePreferences";

function AnimatedComponent() {
  const { animationsEnabled } = usePreferences();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    if (animationsEnabled) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Skip animation, set directly
      fadeAnim.setValue(1);
    }
  };

  return <Animated.View style={{ opacity: fadeAnim }}>...</Animated.View>;
}
```

## Default Behavior

- Both preferences default to **enabled** (true) if not set
- Preferences persist across app restarts using SecureStore
- All utility functions gracefully handle errors and default to enabled state

## Settings UI

Users can toggle these preferences in:
**Preferences → Appearance → Enable Haptics / Enable Animations**

The AppearanceBottomSheet component handles the UI and state management automatically.

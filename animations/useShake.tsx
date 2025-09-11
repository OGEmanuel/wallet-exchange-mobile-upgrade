// src/animations/useShake.ts
import { useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function useShake() {
  const offset = useSharedValue(0);

  const triggerShake = () => {
    offset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { offset, triggerShake };
}
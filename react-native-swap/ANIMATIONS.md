# Animation Documentation

This document describes all the animations used in the React Native Swap component and how they work.

## Overview

The component uses `react-native-reanimated` for performant animations. All animations run on the UI thread for smooth 60fps performance.

## Animations Breakdown

### 1. Swap Transition Animation

**Location:** `SellSection.tsx` and `ReceiveSection.tsx`

**Description:** When the user taps the swap button, the sell and receive sections animate and swap positions.

**Implementation:**

```typescript
const containerTranslateY = isSwapped ? 210 : 0; // Sell section moves down
const containerTranslateY = isSwapped ? -210 : 0; // Receive section moves up

<Animated.View
  style={{
    transform: [{ translateY: containerTranslateY }],
  }}
>
```

**Duration:** 300ms
**Easing:** Default (ease-in-out)

**How it works:**

- When `isSwapped` is `false`, sections are in normal position
- When `isSwapped` is `true`, sections swap positions vertically
- The `isTransitioning` state fades out labels during animation for clean visual effect

### 2. Dollar Value Pulse Animation

**Location:** `SellSection.tsx`

**Description:** The dollar value continuously pulses to draw attention.

**Implementation:**

```typescript
const scale = useSharedValue(1)

React.useEffect(() => {
  scale.value = withRepeat(
    withSequence(
      withTiming(1.1, { duration: 1000 }),
      withTiming(1, { duration: 1000 })
    ),
    -1,
    false
  )
}, [])

const animatedDollarStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}))
```

**Duration:** 2 seconds per cycle (1s grow, 1s shrink)
**Repeat:** Infinite
**Scale Range:** 1.0 to 1.1

### 3. Swap Button Shake Animation

**Location:** `SwapButton.tsx`

**Description:** The swap button shakes periodically to encourage user interaction.

**Implementation:**

```typescript
const translateY = useSharedValue(0)

useEffect(() => {
  const interval = setInterval(() => {
    translateY.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    )
  }, 10000)

  return () => clearInterval(interval)
}, [])
```

**Trigger:** Every 10 seconds
**Duration:** 400ms per shake
**Movement:** ±5 pixels vertically

### 4. Loading Pulse Animation

**Location:** `SwapButton.tsx`

**Description:** When fetching rates, the swap button pulses to indicate loading.

**Implementation:**

```typescript
const pulseScale = useSharedValue(1)

useEffect(() => {
  if (isLoading) {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    )
  } else {
    pulseScale.value = 1
  }
}, [isLoading])
```

**Duration:** 1 second per cycle
**Repeat:** While loading
**Scale Range:** 1.0 to 1.1

### 5. Fade In/Out Animation

**Location:** Multiple components

**Description:** Labels and static elements fade out during swap transition.

**Implementation:**

```typescript
<View
  style={[
    styles.labelContainer,
    { opacity: isTransitioning ? 0 : 1 },
  ]}
>
```

**Duration:** Instant (no animation, just opacity change)
**Purpose:** Prevents visual clutter during position swap

### 6. Initial Fade-In Animation

**Location:** `SellSection.tsx` and `ReceiveSection.tsx`

**Description:** Sections fade in when first rendered.

**Implementation:**

```typescript
<Animated.View
  entering={FadeIn.duration(300)}
  exiting={FadeOut.duration(200)}
>
```

Note: This uses Reanimated's entering/exiting animations (not currently implemented but can be added).

## Customizing Animations

### Change Animation Speed

To make animations faster or slower, modify the `duration` parameter:

```typescript
// Faster (200ms instead of 300ms)
withTiming(value, { duration: 200 })

// Slower (500ms instead of 300ms)
withTiming(value, { duration: 500 })
```

### Change Animation Easing

Add easing functions for different effects:

```typescript
import { Easing } from 'react-native-reanimated'

withTiming(value, {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom bezier
})
```

Common easing options:

- `Easing.linear` - Constant speed
- `Easing.ease` - Default ease-in-out
- `Easing.elastic()` - Bouncy effect
- `Easing.bounce` - Bounce at the end

### Disable Specific Animations

To disable an animation, simply remove the animation code or set it to a constant value:

```typescript
// Disable pulse animation
const scale = useSharedValue(1) // Keep at 1, don't animate

// Disable shake animation
// Comment out or remove the useEffect that triggers the shake
```

### Add New Animations

To add a new animation:

1. Create a shared value:

```typescript
const myValue = useSharedValue(0)
```

2. Set up the animation:

```typescript
useEffect(() => {
  myValue.value = withTiming(1, { duration: 300 })
}, [dependency])
```

3. Apply it to a style:

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: myValue.value,
  transform: [{ scale: myValue.value }],
}))
```

4. Use it in your component:

```typescript
<Animated.View style={animatedStyle}>
  {/* Your content */}
</Animated.View>
```

## Performance Considerations

### Why Reanimated?

- **UI Thread:** Animations run on UI thread, not JS thread
- **60 FPS:** Smooth animations even when JS thread is busy
- **Native Driver:** Uses native animation drivers when possible

### Best Practices

1. **Use `useSharedValue`** for animated values, not regular state
2. **Use `useAnimatedStyle`** to create animated styles
3. **Avoid `setState`** inside animation callbacks
4. **Minimize re-renders** by memoizing components when needed
5. **Use `withSpring`** for natural feeling animations
6. **Use `withTiming`** for precise control

### Debugging Animations

Enable debug mode in Reanimated:

```typescript
import { enableExperimentalWebImplementation } from 'react-native-reanimated'

// In development
if (__DEV__) {
  enableExperimentalWebImplementation(true)
}
```

## Animation Flow Diagram

```
User Action
    ↓
State Update (isSwapped, isTransitioning)
    ↓
Shared Value Changes
    ↓
useAnimatedStyle Recalculates
    ↓
UI Thread Updates View
    ↓
Smooth 60fps Animation
```

## Accessibility

Animations respect the "Reduce Motion" system setting. To implement:

```typescript
import { AccessibilityInfo } from 'react-native'

const [reduceMotion, setReduceMotion] = useState(false)

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
}, [])

// Then conditionally disable animations
if (!reduceMotion) {
  // Apply animation
}
```

## Testing Animations

To test animations:

1. **Visual Testing:** Run the app and trigger each animation
2. **Performance Testing:** Use React DevTools Profiler
3. **Unit Testing:** Mock Reanimated in tests

Example test mock:

```typescript
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})
```

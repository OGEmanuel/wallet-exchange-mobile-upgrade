# Zapper Sign Bottom Sheet Usage

This document explains how to programmatically trigger the Zapper Sign onboarding bottom sheet using the new hook-based approach.

## Overview

The Zapper Sign bottom sheet provides a complete onboarding flow including:
- Login to Zap
- Email verification
- Username entry
- Username success screen
- Identity verification

## Usage

### 1. Import the hook

```typescript
import { useZapperSignBottomSheet } from "@/hooks/useZapperSignBottomSheet";
```

### 2. Use the hook in your component

```typescript
function MyComponent() {
  const { showZapperSignBottomSheet } = useZapperSignBottomSheet();

  const handleShowOnboarding = () => {
    showZapperSignBottomSheet({
      onContinue: () => {
        // Navigate to dashboard after successful authentication
        router.push("/dashboard/home/wallet-home/swap");
      },
      onClose: () => {
        // Handle close action if needed
        console.log("Onboarding closed");
      },
    });
  };

  return (
    <Button onPress={handleShowOnboarding} title="Get Started" />
  );
}
```

## Benefits

1. **Programmatic Control**: Show the bottom sheet from anywhere in your app
2. **Centralized Management**: Uses the app's centralized bottom sheet system
3. **Automatic Cleanup**: No need to manage refs or state manually
4. **Consistent UX**: All bottom sheets follow the same pattern

## Example: Integration in Select Track

```typescript
import { useZapperSignBottomSheet } from "@/hooks/useZapperSignBottomSheet";

const SelectTrack = () => {
  const { showZapperSignBottomSheet } = useZapperSignBottomSheet();

  const handleZapperPress = () => {
    if (isUserLoggedIn) {
      // Already authenticated, navigate to dashboard
      router.push("/dashboard/home/wallet-home/home");
    } else {
      // Show onboarding flow
      showZapperSignBottomSheet({
        onContinue: () => {
          router.push("/dashboard/home/wallet-home/swap");
        },
      });
    }
  };

  return (
    <Card 
      title="Zapper"
      onPress={handleZapperPress}
    />
  );
};
```

## Component Structure

- **ZapperSignContent**: Contains the onboarding flow content (used internally)
- **useZapperSignBottomSheet**: Hook to programmatically show the bottom sheet
- **ZapperSiginBottomSheet**: Legacy component (kept for backward compatibility)

## Migration

If you're currently using the old `ZapperSiginBottomSheet` component with refs and state management:

**Before:**
```typescript
const [isVisible, setIsVisible] = useState(false);
const ref = useRef(null);

{isVisible && (
  <ZapperSiginBottomSheet
    ref={ref}
    onContinue={() => setIsVisible(false)}
  />
)}
```

**After:**
```typescript
const { showZapperSignBottomSheet } = useZapperSignBottomSheet();

showZapperSignBottomSheet({
  onContinue: () => {},
  onClose: () => {},
});
```


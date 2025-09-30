# Swap Screen Components

This directory contains the modularized components for the Swap screen, breaking down the original monolithic `SwapScreen.tsx` into reusable, maintainable components.

## Components

### TokenInputCard

A reusable component for token input fields (both sell and receive).

**Props:**

- `amount: string` - The token amount to display
- `tokenSymbol: string` - The token symbol (e.g., "BUSD", "BTC")
- `tokenImage: any` - The token image/icon
- `balance?: string` - The user's balance for this token
- `showBalance?: boolean` - Whether to show the balance section
- `showMaxButton?: boolean` - Whether to show the MAX button
- `onAmountChange?: (amount: string) => void` - Callback for amount changes
- `onTokenSelect?: () => void` - Callback for token selection
- `onMaxPress?: () => void` - Callback for MAX button press
- `animatedStyle?: any` - Animation styles
- `isReceive?: boolean` - Whether this is a receive input
- `usdValue?: string` - USD value to display (for receive inputs)

### SwapButton

An animated button for swapping between tokens.

**Props:**

- `onPress: () => void` - Callback for button press
- `animatedStyle?: any` - Animation styles
- `disabled?: boolean` - Whether the button is disabled

### SwapDetailsCard

A collapsible card showing swap details (provider, fees, rates, etc.).

**Props:**

- `provider?: string` - The exchange provider name
- `providerIcon?: any` - The provider icon
- `zapFee?: string` - The Zap fee amount
- `rate?: string` - The exchange rate
- `minimumReceived?: string` - The minimum amount to receive
- `onToggleDetails?: () => void` - Callback for toggling details
- `showLess?: boolean` - Whether to start in collapsed state

### CurrencySelector

A reusable component for selecting currencies/tokens.

**Props:**

- `tokenSymbol: string` - The token symbol
- `tokenImage: any` - The token image
- `onPress: () => void` - Callback for selection
- `animatedStyle?: any` - Animation styles
- `width?: number` - Button width (default: 107)
- `height?: number` - Button height (default: 36)
- `fontSize?: number` - Text font size (default: 12)

## Hooks

### useSwapAnimations

A custom hook that manages all animation logic for the swap screen.

**Returns:**

- `isAnimating: boolean` - Whether an animation is currently running
- `sellContainerStyle: any` - Animation styles for sell container
- `receiveContainerStyle: any` - Animation styles for receive container
- `swapButtonStyle: any` - Animation styles for swap button
- `currencyButtonStyle: any` - Animation styles for currency buttons
- `handleSwapPress: () => void` - Handler for swap button press
- `handleCurrencyPress: () => void` - Handler for currency button press
- `triggerShakeAnimation: (animatedValue: Animated.Value) => void` - Trigger shake animation

## Usage

```tsx
import { TokenInputCard, SwapButton, SwapDetailsCard } from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const SwapScreen = () => {
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  return (
    <PageWrapper>
      <TokenInputCard
        amount="0.009"
        tokenSymbol="BUSD"
        tokenImage={require("@/assets/images/btc.png")}
        balance="20BNB"
        animatedStyle={sellContainerStyle}
        isReceive={false}
      />

      <TokenInputCard
        amount="30,027,060.88"
        tokenSymbol="BUSD"
        tokenImage={require("@/assets/images/btc.png")}
        animatedStyle={receiveContainerStyle}
        isReceive={true}
        usdValue="$180"
      />

      <SwapButton
        onPress={handleSwapPress}
        animatedStyle={swapButtonStyle}
        disabled={isAnimating}
      />

      <SwapDetailsCard
        provider="Zap exchange"
        zapFee="$0.009"
        rate="1BNB = 500 USDC"
        minimumReceived="327,060.88 NGN"
      />
    </PageWrapper>
  );
};
```

## Benefits of Modularization

1. **Reusability**: Components can be reused in other parts of the app
2. **Maintainability**: Easier to debug and update individual components
3. **Testability**: Each component can be tested in isolation
4. **Readability**: The main screen is now much cleaner and easier to understand
5. **Separation of Concerns**: Animation logic is separated into a custom hook
6. **Type Safety**: Each component has proper TypeScript interfaces

## File Structure

```
components/
├── TokenInputCard.tsx      # Token input component
├── SwapButton.tsx          # Animated swap button
├── SwapDetailsCard.tsx     # Collapsible details card
├── CurrencySelector.tsx    # Currency selection component
├── index.ts               # Component exports
└── README.md              # This documentation

hooks/
└── useSwapAnimations.ts   # Animation logic hook
```

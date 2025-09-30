# Swap Module

This module provides a comprehensive swap functionality that integrates the exchange module's features into a clean, modular architecture.

## Architecture

The swap module follows a clean architecture pattern with the following layers:

### Presentation Layer (`/presentation/`)

- **Screens**: `SwapScreen.tsx` - Main swap interface
- **Hooks**: `useSwap.ts` - Custom hook for swap state management
- **State**: `swap-slice.ts` - Redux slice for state management
- **Components**: Reusable UI components (to be added as needed)

### Domain Layer (`/domain/`)

- **Repository**: `swap-repo.ts` - Abstract repository interface
- **Use Cases**: `swap-usecases.ts` - Business logic use cases
- **Entities**: Domain models and interfaces

### Data Layer (`/data/`)

- **Local**: Local data sources and implementations
- **Remote**: Remote API data sources and implementations
- **Repository Implementation**: Concrete repository implementations

## Features

### Integrated Exchange Functionality

- **Currency Management**: Support for both crypto and fiat currencies
- **Rate Fetching**: Real-time exchange rate updates
- **Amount Formatting**: Smart formatting based on currency type
- **Validation**: Comprehensive input validation
- **Error Handling**: User-friendly error messages

### State Management

- **Redux Integration**: Centralized state management
- **Real-time Updates**: Automatic state synchronization
- **Optimistic Updates**: Smooth user experience
- **Error Recovery**: Graceful error handling

### UI Components

- **Token Input Cards**: For selecting and entering amounts
- **Activity Tabs**: Switch between Exchange and Wallet modes
- **Swap Button**: Currency swapping functionality
- **Details Card**: Transaction details and fees
- **Validation**: Real-time form validation

## Usage

### Basic Implementation

```tsx
import { SwapScreen } from "@/src/modules/swap";

const MySwapPage = () => {
  return <SwapScreen />;
};
```

### Using the Hook

```tsx
import { useSwap } from "@/src/modules/swap";

const MyComponent = () => {
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    validateExchange,
  } = useSwap();

  // Use the hook methods and state
};
```

## State Structure

```typescript
interface SwapState {
  // Amount states
  baseAmount: number;
  targetAmount: number;

  // Currency states
  baseCurrency: SupportedCurrency | null;
  targetCurrency: SupportedCurrency | null;

  // UI states
  isReversed: boolean;
  baseInputIsDollar: boolean;
  activeTab: "EXCHANGE" | "WALLET";

  // Selection states
  selectedBank: Bank | null;
  selectedOption: string;

  // Data states
  currencies: SupportedCurrency[];
  marketRate: MarketRate | null;
  isRateLoading: boolean;

  // Error and loading states
  error: string | null;
  isLoading: boolean;
}
```

## Key Features

### 1. Currency Management

- Support for multiple currency types (crypto, fiat)
- Real-time currency data fetching
- Currency validation and formatting

### 2. Amount Handling

- Smart amount formatting based on currency type
- Real-time amount validation
- Maximum amount handling

### 3. Exchange Rate Integration

- Real-time rate fetching
- Rate validation and error handling
- Optimistic updates for better UX

### 4. Validation System

- Comprehensive input validation
- User-friendly error messages
- Real-time validation feedback

### 5. State Management

- Redux-based state management
- Optimistic updates
- Error recovery mechanisms

## Integration with Exchange Module

The swap module integrates the exchange module's functionality:

- **Currency Types**: Uses `SupportedCurrency` from exchange module
- **Rate Management**: Integrates rate fetching and caching
- **Validation**: Uses exchange validation logic
- **State Management**: Extends exchange state with swap-specific features

## Future Enhancements

- [ ] Token selection modals
- [ ] Balance integration
- [ ] Transaction history
- [ ] Advanced swap options
- [ ] Multi-step transaction flow
- [ ] Fee optimization
- [ ] Slippage protection

## Dependencies

- React
- Redux Toolkit
- React Redux
- TypeScript
- Custom UI components
- Exchange module integration

# React Native Swap Component - File Index

Complete list of all files in this package with descriptions.

## 📋 Quick Navigation

- [Getting Started](#getting-started)
- [Component Files](#component-files)
- [Core Files](#core-files)
- [Documentation](#documentation)
- [Configuration](#configuration)

---

## Getting Started

**Start here:**

1. Read `README.md` for overview and features
2. Follow `INTEGRATION_GUIDE.md` for step-by-step integration
3. Look at `App.example.tsx` for a complete working example
4. Reference `COMPONENT_OVERVIEW.md` for architecture details

---

## Component Files

### UI Components (`/components/`)

#### `CurrencySelector.tsx`

- **Type:** Modal Component
- **Purpose:** Allows users to search and select a currency
- **Features:**
  - Search functionality
  - List with currency images
  - Shows selected state
  - Dark mode support
- **Used by:** SwapScreen
- **Props:** `visible`, `onClose`, `currencies`, `selectedCurrency`, `onSelect`, `title`

#### `ErrorIndicator.tsx`

- **Type:** Display Component
- **Purpose:** Shows error messages with retry functionality
- **Features:**
  - Error message display
  - Retry button with loading state
  - Auto-hide on success
  - Dark mode support
- **Used by:** SwapScreen
- **Props:** `error`, `retry`, `retryText`, `isBackgroundRefresh`

#### `ReceiveSection.tsx`

- **Type:** Input Component
- **Purpose:** The "Receive/To" section of the swap interface
- **Features:**
  - Numeric input with formatting
  - Currency selector integration
  - Swap animation support
  - Loading shimmer effect
- **Used by:** SwapScreen
- **Props:** `isSwapped`, `isTransitioning`, `defaultReceiveValue`, `openSupportedCurrenciesModal`, `isLoading`, `onInputChange`, `receiveInputValue`

#### `SellSection.tsx`

- **Type:** Input Component
- **Purpose:** The "Sell/From" section of the swap interface
- **Features:**
  - Numeric input with formatting
  - Dollar value display with animation
  - Dollar/crypto mode toggle
  - Currency selector integration
  - Swap animation support
- **Used by:** SwapScreen
- **Props:** `isSwapped`, `swapMetaData`, `isTransitioning`, `triggerDollarCryptoSwap`, `defaultSellValue`, `openSupportedCurrenciesModal`, `isLoading`, `onInputChange`, `sellInputValue`

#### `SwapButton.tsx`

- **Type:** Interactive Component
- **Purpose:** Button that swaps the sell/receive positions
- **Features:**
  - Periodic shake animation
  - Loading pulse animation
  - Smooth press feedback
- **Used by:** SwapScreen
- **Props:** `onPress`, `isLoading`

#### `WithdrawalAddressInput.tsx`

- **Type:** Input Component
- **Purpose:** Input field for cryptocurrency withdrawal address
- **Features:**
  - Paste from clipboard
  - Error display
  - Conditional visibility (crypto only)
  - Dark mode support
- **Used by:** SwapScreen
- **Props:** `value`, `onChangeText`, `error`, `disabled`

---

## Core Files

### Screens (`/screens/`)

#### `SwapScreen.tsx`

- **Type:** Main Screen Component
- **Purpose:** Orchestrates all swap functionality
- **Features:**
  - Integrates all child components
  - Manages modal states
  - Handles currency selection
  - Coordinates with Redux
  - Mock data initialization
- **Props:** `defaultTokenSymbol`, `onSwapComplete`
- **Size:** ~250 lines

### Hooks (`/hooks/`)

#### `useSwapLogic.ts`

- **Type:** Custom Hook
- **Purpose:** Contains all business logic for swap operations
- **Exports:**
  - `swapMetaData` - Input values and dollar mode state
  - `isTransitioning` - Animation state
  - `isBackgroundRefresh` - Retry loading state
  - `handleSellInputChange` - Sell input handler
  - `handleReceiveInputChange` - Receive input handler
  - `handleSwap` - Currency swap handler
  - `triggerDollarCryptoSwap` - Toggle dollar mode
  - `retryFetchSwapRate` - Retry error handler
  - Plus all Redux state selectors
- **Size:** ~300 lines
- **Note:** Contains mock API call (replace with real API)

### State Management (`/state/`)

#### `swapSlice.ts`

- **Type:** Redux Slice
- **Purpose:** Manages global swap state
- **State:**
  - `supportedCurrencies` - List of available currencies
  - `sellCurrency` - Selected sell currency
  - `receiveCurrency` - Selected receive currency
  - `swapRate` - Current exchange rate
  - `isSwapped` - Position swap state
  - `fetchingSwapRate` - Loading state
  - `swapRateError` - Error messages
- **Actions:** 12 actions for state updates
- **Size:** ~70 lines

### Store (`/store/`)

#### `index.ts`

- **Type:** Redux Store Configuration
- **Purpose:** Configure and export Redux store
- **Exports:** `store`, `RootState`, `AppDispatch`
- **Note:** Can be integrated into existing store
- **Size:** ~30 lines

### Types (`/types/`)

#### `index.ts`

- **Type:** TypeScript Definitions
- **Purpose:** Shared type definitions
- **Types:**
  - `SupportedCurrencyModel` - Currency structure
  - `SwapRateModel` - Exchange rate structure
  - `FetchSwapRateRequestParams` - API request params
  - `SwapMetaData` - Component metadata
  - `SwapSectionProps` - Component props
- **Size:** ~40 lines

### Utilities (`/utils/`)

#### `formatUtils.ts`

- **Type:** Utility Functions
- **Purpose:** Number and currency formatting
- **Functions:**
  - `formatNumberWithCommas()` - Add commas to numbers
  - `ensureSingleDollarSign()` - Format dollar values
  - `getApproximateAmount()` - Format crypto/fiat amounts
  - `cleanNumericInput()` - Remove non-numeric chars
  - `isValidNumber()` - Validate numeric input
  - `setupTokenTicker()` - Get currency ticker
- **Size:** ~80 lines

---

## Documentation

### Main Documentation

#### `README.md`

- **Purpose:** Main documentation and overview
- **Contents:**
  - Features list
  - Installation instructions
  - Usage examples
  - Dependencies
  - Component structure
  - Customization guide
- **Read first:** Yes
- **Size:** ~200 lines

#### `COMPONENT_OVERVIEW.md`

- **Purpose:** Detailed architecture overview
- **Contents:**
  - Project structure
  - Features breakdown
  - Component descriptions
  - Data flow diagrams
  - Use cases
  - Platform support
  - Performance notes
  - Checklist for production
- **Read first:** After README
- **Size:** ~400 lines

#### `INTEGRATION_GUIDE.md`

- **Purpose:** Step-by-step integration instructions
- **Contents:**
  - Prerequisites
  - Redux integration (new & existing)
  - Type definitions update
  - Mock data replacement
  - API integration
  - Troubleshooting
  - Testing guide
- **Read first:** When ready to integrate
- **Size:** ~300 lines

### Technical Documentation

#### `ANIMATIONS.md`

- **Purpose:** Detailed animation documentation
- **Contents:**
  - All animations breakdown
  - Implementation details
  - Customization guide
  - Performance considerations
  - Accessibility notes
  - Testing animations
- **Read first:** If customizing animations
- **Size:** ~300 lines

#### `STATE_MANAGEMENT.md`

- **Purpose:** State architecture documentation
- **Contents:**
  - State architecture diagram
  - Redux state shape
  - Local state explanation
  - Data flow diagrams
  - Debouncing explanation
  - Testing state
  - Best practices
- **Read first:** If modifying state logic
- **Size:** ~400 lines

#### `API_INTEGRATION.md`

- **Purpose:** API integration guide
- **Contents:**
  - API client setup
  - Replace mock currencies
  - Replace mock swap rates
  - Create transaction endpoint
  - Error handling
  - Caching & retry logic
  - Complete examples
  - Testing
  - Checklist
- **Read first:** When connecting to backend
- **Size:** ~500 lines

---

## Configuration

#### `package.json`

- **Purpose:** Package configuration
- **Contents:** Dependencies list and metadata
- **Size:** ~20 lines

#### `tsconfig.json`

- **Purpose:** TypeScript configuration
- **Contents:** Compiler options for React Native
- **Size:** ~25 lines

---

## Examples

#### `App.example.tsx`

- **Purpose:** Complete working example
- **Contents:**
  - Redux Provider setup
  - SwapScreen usage
  - SafeAreaView wrapper
  - Dark mode handling
  - Callback example
- **Run it:** Can be used as a standalone app
- **Size:** ~40 lines

---

## File Statistics

### By Type

- **Components:** 7 files
- **Hooks:** 1 file
- **State:** 1 file
- **Store:** 1 file
- **Types:** 1 file
- **Utils:** 1 file
- **Documentation:** 6 files
- **Config:** 2 files
- **Examples:** 1 file

### Total Files: 21

### By Language

- **TypeScript (TSX):** 11 files
- **TypeScript (TS):** 4 files
- **Markdown:** 6 files
- **JSON:** 2 files

### Lines of Code (Approximate)

- **Components:** ~1,200 lines
- **Business Logic:** ~600 lines
- **Documentation:** ~2,200 lines
- **Total:** ~4,000 lines

---

## Import Map

Quick reference for imports:

```typescript
// Main screen
import SwapScreen from './react-native-swap/screens/SwapScreen'

// Redux
import { swapActions } from './react-native-swap/state/swapSlice'
import { store } from './react-native-swap/store'

// Types
import {
  SupportedCurrencyModel,
  SwapRateModel,
} from './react-native-swap/types'

// Utils
import { formatNumberWithCommas } from './react-native-swap/utils/formatUtils'

// Hook (if needed outside SwapScreen)
import { useSwapLogic } from './react-native-swap/hooks/useSwapLogic'
```

---

## Dependency Graph

```
SwapScreen
├── SellSection
│   └── uses: sellCurrency, swapMetaData, handleSellInputChange
├── ReceiveSection
│   └── uses: receiveCurrency, handleReceiveInputChange
├── SwapButton
│   └── uses: handleSwap, fetchingSwapRate
├── WithdrawalAddressInput
│   └── uses: withdrawalAddress, handleWithdrawalAddressChange
├── ErrorIndicator
│   └── uses: swapRateError, retryFetchSwapRate
└── CurrencySelector
    └── uses: supportedCurrencies, handleSelectCurrency

useSwapLogic
├── uses: Redux state (swap slice)
└── provides: All handlers and state

Redux Store
└── swap slice
    └── contains: All global state
```

---

## Where to Start?

### For Integration

1. `README.md` - Overview
2. `INTEGRATION_GUIDE.md` - Step-by-step
3. `App.example.tsx` - Working example
4. `API_INTEGRATION.md` - Connect to backend

### For Customization

1. `COMPONENT_OVERVIEW.md` - Architecture
2. Component files - UI changes
3. `ANIMATIONS.md` - Animation tweaks
4. `STATE_MANAGEMENT.md` - Logic changes

### For Understanding

1. `COMPONENT_OVERVIEW.md` - Big picture
2. `STATE_MANAGEMENT.md` - How it works
3. `SwapScreen.tsx` - See it in action
4. `useSwapLogic.ts` - Business logic

---

## Quick Reference

### Most Important Files (Top 5)

1. `SwapScreen.tsx` - Main component
2. `useSwapLogic.ts` - Business logic
3. `swapSlice.ts` - State management
4. `INTEGRATION_GUIDE.md` - How to integrate
5. `API_INTEGRATION.md` - Connect to API

### Files You'll Modify Most

1. `SwapScreen.tsx` - Add features
2. `useSwapLogic.ts` - Change logic
3. `SellSection.tsx` & `ReceiveSection.tsx` - UI tweaks
4. Component styles - Customize look

### Files You Rarely Touch

1. `formatUtils.ts` - Utility functions
2. `swapSlice.ts` - State structure
3. `types/index.ts` - Type definitions

---

## Version History

**v1.0.0** (October 2025)

- Initial release
- All 21 files created
- Complete documentation
- Working example included
- Mock data for testing
- Ready for integration

---

**Last Updated:** October 9, 2025
**Total Package Size:** ~4,000 lines of code + documentation
**Dependencies:** 5 (react-native-reanimated, gesture-handler, redux toolkit, lodash)
**Platform:** React Native 0.70+
**Language:** TypeScript 4.0+

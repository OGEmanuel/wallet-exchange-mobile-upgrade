# Debounced Rate Fetching

This implementation provides debounced rate fetching for the swap functionality, ensuring that rates are fetched efficiently when amounts or currencies change.

## Features

- **Debounced API calls**: Prevents excessive API calls by waiting for a configurable delay (default: 500ms) after the last change
- **Automatic rate fetching**: Triggers when base amount, target amount, or currencies change
- **Request cancellation**: Cancels previous requests when new ones are made to prevent race conditions
- **Error handling**: Properly handles and displays API errors
- **Loading states**: Shows loading indicators during rate fetching
- **Minimum amount threshold**: Only fetches rates when amount is above a minimum threshold (default: 0.01)

## Usage

The debounced rate fetching is automatically integrated into the `useSwap` hook. No additional setup is required.

### Configuration

You can customize the debounce behavior by modifying the parameters in `useSwap.tsx`:

```typescript
const { refetchRates } = useDebouncedRates({
  debounceDelay: 500, // Delay in milliseconds
  minAmount: 0.01, // Minimum amount to trigger rate fetch
})
```

### Manual Rate Fetching

If you need to fetch rates immediately (e.g., after currency selection), you can use the `refetchRates` function:

```typescript
const { refetchRates } = useSwap()

// Trigger immediate rate fetch
refetchRates()
```

## How It Works

1. **Amount Changes**: When the user types in the amount field, the debounced hook waits for the specified delay before fetching rates
2. **Currency Changes**: When currencies are changed, rates are fetched immediately (with a small 100ms delay to ensure state is updated)
3. **Request Management**: Previous requests are automatically cancelled when new ones are initiated
4. **Error Handling**: API errors are captured and displayed in the UI
5. **Loading States**: The `isRateLoading` state is managed automatically

## Error States

The implementation handles various error scenarios:

- **Network errors**: Displayed to the user with appropriate messaging
- **API errors**: Captured and shown in the rate display area
- **Request cancellation**: Silently handled without showing errors to the user

## Performance Benefits

- **Reduced API calls**: Debouncing prevents excessive requests during rapid typing
- **Better UX**: Users see loading states and error messages appropriately
- **Race condition prevention**: Request cancellation ensures only the latest request's result is used
- **Efficient updates**: Only fetches when necessary (above minimum amount threshold)

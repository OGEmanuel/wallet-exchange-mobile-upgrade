# V2 Onboarding Flow Implementation

This is a complete onboarding flow implementation for the V2 exchange module, following the React Native onboarding implementation guide.

## Structure

```
app/V2/exchange/onboarding/
├── types.ts                          # Onboarding enum and context types
├── ExchangeOnboardingContext.tsx      # React context for onboarding state
├── useExchangeOnboardingContext.ts   # Hook to access onboarding context
├── ExchangeOnboardingProvider.tsx    # Provider component that manages onboarding state
├── useExchangeOnboarding.tsx         # Main hook for using onboarding flow
├── utils.ts                          # Utility functions for verification checks
├── index.ts                          # Main exports
├── bottomsheet/                      # Bottom sheet implementation
│   ├── types.ts
│   ├── AppBottomSheetContext.tsx
│   ├── AppBottomSheetProvider.tsx
│   ├── BottomSheet.tsx
│   ├── AppBottomSheetManager.tsx
│   └── index.ts
└── steps/                            # Onboarding step components
    ├── SigninStep.tsx
    ├── AuthOtpStep.tsx
    ├── ReferralStep.tsx
    ├── AuthVerificationIntroStep.tsx
    ├── AuthPhoneNumberInputStep.tsx
    ├── AuthPhoneNumberOtpStep.tsx
    ├── AuthIdentityVerificationOverviewStep.tsx
    ├── AuthBvnVerificationInputStep.tsx
    ├── AuthBvnVerificationSuccessStep.tsx
    ├── AuthIdVerificationInputStep.tsx
    ├── AuthIdVerificationUploadStep.tsx
    ├── AuthVerificationSubmittedStep.tsx
    └── index.ts
```

## Usage

### 1. Wrap your app with providers

In your root layout or app component:

```tsx
import { Provider } from "react-redux";
import { ExchangeOnboardingProvider } from "@/app/V2/exchange/onboarding";
import { AppBottomSheetProvider, AppBottomSheetManager } from "@/app/V2/exchange/onboarding";

export default function App() {
  return (
    <Provider store={store}>
      <ExchangeOnboardingProvider>
        <AppBottomSheetProvider>
          {/* Your app content */}
          <AppBottomSheetManager />
        </AppBottomSheetProvider>
      </ExchangeOnboardingProvider>
    </Provider>
  );
}
```

### 2. Use the onboarding hook in your components

```tsx
import { useExchangeOnboarding } from "@/app/V2/exchange/onboarding";
import { TouchableOpacity, Text } from "react-native";

export const ProfileScreen = () => {
  const {
    handleOpenOnboardingBottomSheet,
    userIsFullyVerified,
    userSubmittedAllVerificationDocuments,
    currentOnboardingStep,
  } = useExchangeOnboarding();

  return (
    <View>
      {!userIsFullyVerified && (
        <TouchableOpacity onPress={handleOpenOnboardingBottomSheet}>
          <Text>Complete Verification</Text>
        </TouchableOpacity>
      )}
      
      <Text>Verification Status: {userIsFullyVerified ? "Complete" : "Incomplete"}</Text>
      <Text>Current Step: {currentOnboardingStep}</Text>
    </View>
  );
};
```

### 3. Update steps in your step components

Each step component can access the onboarding context to move to the next step:

```tsx
import { useExchangeOnboardingContext } from "@/app/V2/exchange/onboarding";
import { Onboarding } from "@/app/V2/exchange/onboarding";

export const SigninStep = () => {
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();

  const handleSignIn = async () => {
    // Perform sign in logic
    // After successful sign in, move to next step
    setCurrentOnboardingStep(Onboarding.AuthOtp);
  };

  return (
    <View>
      {/* Your sign in UI */}
      <Button onPress={handleSignIn} title="Sign In" />
    </View>
  );
};
```

## Onboarding Flow Steps

The onboarding flow consists of 12 sequential steps:

### Phase 1: Authentication
1. **Signin** - User signs in
2. **AuthOtp** - Email OTP verification
3. **Referral** - Username/referral code entry

### Phase 2: Phone Verification
4. **AuthVerificationIntro** - Introduction to phone verification
5. **AuthPhoneNumberInput** - Phone number input
6. **AuthPhoneNumberOtpVerification** - Phone OTP verification

### Phase 3: Identity Verification
7. **AuthIdentityVerificationOverview** - Overview of identity verification
8. **AuthBvnVerificationInput** - BVN input
9. **AuthBvnVerificationSuccess** - BVN verification success
10. **AuthIdVerificationInput** - ID type selection
11. **AuthIdVerificationUpload** - ID document upload
12. **AuthVerificationSubmitted** - Final success screen

## Features

- ✅ Automatic step determination based on user state
- ✅ Bottom sheet UI (non-dismissible during onboarding)
- ✅ Step transitions handled automatically
- ✅ Verification status tracking
- ✅ Integration with Redux user state
- ✅ Type-safe with TypeScript

## Notes

- The `ExchangeOnboardingProvider` automatically determines the initial step based on user data
- Bottom sheets are non-dismissible by default during onboarding
- Step components should update user metadata as they progress
- The bottom sheet automatically closes when the user reaches the final step and is fully verified


/**
 * Example usage of the V2 Onboarding Flow
 * 
 * This file demonstrates how to integrate and use the onboarding flow
 * in your application.
 */

import {
  AppBottomSheetManager,
  AppBottomSheetProvider,
  ExchangeOnboardingProvider,
  Onboarding,
  useExchangeOnboarding,
  useExchangeOnboardingContext,
} from "@/app/V2/exchange/onboarding";
import { store } from "@/state";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Provider } from "react-redux";

// Example: Root App Component with Providers
export const AppWithOnboarding: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider store={store}>
      <ExchangeOnboardingProvider>
        <AppBottomSheetProvider>
          {children}
          <AppBottomSheetManager />
        </AppBottomSheetProvider>
      </ExchangeOnboardingProvider>
    </Provider>
  );
};

// Example: Profile/Settings Screen using onboarding
export const ProfileScreenExample: React.FC = () => {
  const {
    handleOpenOnboardingBottomSheet,
    userIsFullyVerified,
    userSubmittedAllVerificationDocuments,
    currentOnboardingStep,
  } = useExchangeOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Verification Status:</Text>
        <Text
          style={[
            styles.value,
            userIsFullyVerified ? styles.complete : styles.incomplete,
          ]}
        >
          {userIsFullyVerified ? "Complete" : "Incomplete"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Documents Submitted:</Text>
        <Text style={styles.value}>
          {userSubmittedAllVerificationDocuments ? "Yes" : "No"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current Step:</Text>
        <Text style={styles.value}>{currentOnboardingStep}</Text>
      </View>

      {!userIsFullyVerified && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenOnboardingBottomSheet}
        >
          <Text style={styles.buttonText}>Complete Verification</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Example: Step Component that transitions to next step
export const ExampleStepComponent: React.FC = () => {
  const { currentOnboardingStep, setCurrentOnboardingStep } =
    useExchangeOnboardingContext();

  const handleNext = () => {
    // Example: Move to next step based on current step
    switch (currentOnboardingStep) {
      case Onboarding.Signin:
        setCurrentOnboardingStep(Onboarding.AuthOtp);
        break;
      case Onboarding.AuthOtp:
        setCurrentOnboardingStep(Onboarding.Referral);
        break;
      // ... handle other transitions
      default:
        break;
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Current Step: {currentOnboardingStep}</Text>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1f232d",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#fff",
  },
  complete: {
    color: "#4CAF50",
  },
  incomplete: {
    color: "#FF9800",
  },
  button: {
    backgroundColor: "#393181",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContainer: {
    padding: 20,
    minHeight: 200,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
});


import { AppRootState } from "@/state";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ExchangeOnboardingContext } from "./ExchangeOnboardingContext";
import { Onboarding } from "./types";
import {
  submittedAllVerificationDocuments,
  userHasSubmittedCreditTypeVerification
} from "./utils";

interface ExchangeOnboardingProviderProps {
  children: React.ReactNode;
}

export const ExchangeOnboardingProvider: React.FC<ExchangeOnboardingProviderProps> = ({ children }) => {
  const { user } = useSelector((state: AppRootState) => state.kyc);

  console.log("Logged in user", user);

  // Determine initial onboarding step based on user state
  const determineInitialStep = useCallback((): Onboarding => {
    if (!user) return Onboarding.Signin;

    const { emailVerified, username, phoneNumberVerified, metaData } = user;

    // Guest user without email should start at signin
    if (user.isGuest && !user?.email && !emailVerified) return Onboarding.Signin;

    // PHASE 1: Email verification and username setup
    if (!emailVerified && user.email) return Onboarding.AuthOtp;
    if (!username && emailVerified) return Onboarding.Referral;

    // PHASE 2: Phone verification
    const phoneSkipped = metaData?.userPhoneNumberData?.userskippedPhoneNumberOnboarding;
    const showPhoneIntro =
      username && emailVerified && !phoneNumberVerified && !phoneSkipped;
    const showPhoneInput =
      metaData?.userPhoneNumberData?.shownPhoneNumberOnboardingIntro &&
      !metaData?.userPhoneNumberData?.shownPhoneNumberInput &&
      !phoneNumberVerified &&
      !phoneSkipped;
    const showPhoneOtp =
      metaData?.userPhoneNumberData?.shownPhoneNumberInput &&
      !phoneNumberVerified &&
      !phoneSkipped;

    if (showPhoneIntro) {
      if (showPhoneInput) return Onboarding.AuthPhoneNumberInput;
      if (showPhoneOtp) return Onboarding.AuthPhoneNumberOtpVerification;
      return Onboarding.AuthVerificationIntro;
    }

    // PHASE 3 & 4: Identity verification
    const phoneVerifiedOrSkipped = phoneNumberVerified || phoneSkipped;
    const identityVerificationSubmitted =
      submittedAllVerificationDocuments(user) ||
      (user?.metaData?.manuallySetAllIdenityDocumentToSubmitted &&
        userHasSubmittedCreditTypeVerification(user));

    if (phoneVerifiedOrSkipped && !identityVerificationSubmitted) {
      const { shownIdentificationOverviewOnboardingIntro } = metaData || {};
      const bvnVerified =
        user.metaData?.bvnMarkedAsVerified ||
        user.metaData?.skippedBvnVerification ||
        user.verificationIds
          ?.filter((verificationId) => verificationId.documentClass === "Credit")
          .find((verificationId) => verificationId.status === "approved");

      if (shownIdentificationOverviewOnboardingIntro) {
        // BVN verification
        if (!bvnVerified) return Onboarding.AuthBvnVerificationInput;
        if (bvnVerified && !metaData?.authBvnVerificationSuccessShown) {
          return Onboarding.AuthBvnVerificationSuccess;
        }

        // ID verification
        if (!metaData?.idVerificationData?.shownAuthIdVerificationInput) {
          return Onboarding.AuthIdVerificationInput;
        }
        if (metaData?.idVerificationData?.shownAuthIdVerificationInput) {
          return Onboarding.AuthIdVerificationUpload;
        }
      }

      return Onboarding.AuthIdentityVerificationOverview;
    }

    // Verification submitted
    if (identityVerificationSubmitted) return Onboarding.AuthVerificationSubmitted;

    // Default fallback
    return Onboarding.Signin;
  }, [user]);

  const [currentOnboardingStep, setCurrentOnboardingStep] = useState<Onboarding>(
    determineInitialStep()
  );
  
  // Track if step was manually set to prevent auto-recalculation from overriding it
  const manuallySetStepRef = React.useRef<Onboarding | null>(null);

  // Update step when user data changes, but only if step wasn't manually set
  useEffect(() => {
    const calculatedStep = determineInitialStep();
    
    // If step was manually set and matches calculated step, clear the manual flag
    if (manuallySetStepRef.current === calculatedStep) {
      manuallySetStepRef.current = null;
      return;
    }
    
    // Only update if step wasn't manually set to a different value
    if (manuallySetStepRef.current === null) {
      setCurrentOnboardingStep(calculatedStep);
    }
  }, [determineInitialStep]);

  // Wrapper for setCurrentOnboardingStep that tracks manual changes
  const setCurrentOnboardingStepWithTracking = React.useCallback((step: Onboarding) => {
    manuallySetStepRef.current = step;
    setCurrentOnboardingStep(step);
  }, []);

  // Reset to initial state based on current user
  const resetOnboarding = useCallback((): void => {
    setCurrentOnboardingStep(determineInitialStep());
  }, [determineInitialStep]);

  return (
    <ExchangeOnboardingContext.Provider
      value={{
        currentOnboardingStep,
        setCurrentOnboardingStep: setCurrentOnboardingStepWithTracking,
        resetOnboarding,
      }}
    >
      {children}
    </ExchangeOnboardingContext.Provider>
  );
};


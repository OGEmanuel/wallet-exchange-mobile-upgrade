import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppRootState } from "@/state";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppBottomSheetContext } from "./bottomsheet";
import {
  AuthBvnVerificationInputStep,
  AuthBvnVerificationSuccessStep,
  AuthIdVerificationInputStep,
  AuthIdVerificationUploadStep,
  AuthIdentityVerificationOverviewStep,
  AuthOtpStep,
  AuthPhoneNumberInputStep,
  AuthPhoneNumberOtpStep,
  AuthVerificationIntroStep,
  AuthVerificationSubmittedStep,
  ReferralStep,
  SigninStep,
} from "./steps";
import { Onboarding } from "./types";
import { useExchangeOnboardingContext } from "./useExchangeOnboardingContext";
import {
  isUserFullyOnboarded,
  submittedAllVerificationDocuments,
} from "./utils";

export const useExchangeOnboarding = () => {
  const { currentOnboardingStep, setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { openBottomSheet, closeBottomSheet, setBottomSheetContent } =
    useAppBottomSheetContext();

  // Track the latest user data with a ref
  const userRef = useRef<UserModel | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Create mapping of onboarding steps to their components
  const stepComponentMap = useMemo(
    () => ({
      [Onboarding.Signin]: <SigninStep />,
      [Onboarding.AuthOtp]: <AuthOtpStep />,
      [Onboarding.Referral]: <ReferralStep />,
      [Onboarding.AuthVerificationIntro]: <AuthVerificationIntroStep />,
      [Onboarding.AuthPhoneNumberInput]: <AuthPhoneNumberInputStep />,
      [Onboarding.AuthPhoneNumberOtpVerification]: <AuthPhoneNumberOtpStep />,
      [Onboarding.AuthIdentityVerificationOverview]: (
        <AuthIdentityVerificationOverviewStep />
      ),
      [Onboarding.AuthBvnVerificationInput]: <AuthBvnVerificationInputStep />,
      [Onboarding.AuthBvnVerificationSuccess]: <AuthBvnVerificationSuccessStep />,
      [Onboarding.AuthIdVerificationInput]: <AuthIdVerificationInputStep />,
      [Onboarding.AuthIdVerificationUpload]: <AuthIdVerificationUploadStep />,
      [Onboarding.AuthVerificationSubmitted]: <AuthVerificationSubmittedStep />,
    }),
    []
  );

  // Track if user is currently onboarding and current bottom sheet ID
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentBottomSheetId, setCurrentBottomSheetId] = useState<number | null>(
    null
  );

  // Handle opening onboarding bottom sheet
  const handleOpenOnboardingBottomSheet = useCallback(() => {
    console.log("handleOpenOnboardingBottomSheet called", { currentOnboardingStep });
    const currentStepComponent = stepComponentMap[currentOnboardingStep];

    if (!currentStepComponent) {
      console.warn(`No component found for step: ${currentOnboardingStep}`);
      return;
    }

    console.log("Opening bottom sheet with step:", currentOnboardingStep);
    const bottomSheetId = openBottomSheet(currentStepComponent, {
      isDismissible: true,
      showCloseButton: true,
      snapPoints: ["50%", "90%"],
      onOpened: () => {
        console.log("Bottom sheet opened");
      },
      onClosed: () => {
        console.log("Bottom sheet closed");
        setIsOnboarding(false);
        setCurrentBottomSheetId(null);
      },
    });

    console.log("Bottom sheet ID:", bottomSheetId);
    setIsOnboarding(true);
    setCurrentBottomSheetId(bottomSheetId);
  }, [currentOnboardingStep, stepComponentMap, openBottomSheet]);

  // Update bottom sheet content when step changes
  useEffect(() => {
    if (isOnboarding && currentBottomSheetId !== null) {
      const newStepComponent = stepComponentMap[currentOnboardingStep];
      if (newStepComponent) {
        setBottomSheetContent(newStepComponent, currentBottomSheetId);
      }
    }
  }, [
    currentOnboardingStep,
    isOnboarding,
    currentBottomSheetId,
    stepComponentMap,
    setBottomSheetContent,
  ]);

  // Close bottom sheet when user is fully verified and on final step
  useEffect(() => {
    if (
      isOnboarding &&
      currentBottomSheetId !== null &&
      currentOnboardingStep === Onboarding.AuthVerificationSubmitted &&
      isUserFullyOnboarded(user)
    ) {
      // Small delay to show the success message
      const timer = setTimeout(() => {
        closeBottomSheet(currentBottomSheetId);
        setIsOnboarding(false);
        setCurrentBottomSheetId(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    isOnboarding,
    currentBottomSheetId,
    currentOnboardingStep,
    user,
    closeBottomSheet,
  ]);

  // Calculate verification status
  const userIsFullyVerified = useMemo(
    () => isUserFullyOnboarded(user),
    [user]
  );

  const userSubmittedAllVerificationDocuments = useMemo(
    () => submittedAllVerificationDocuments(user),
    [user]
  );

  return {
    handleOpenOnboardingBottomSheet,
    userIsFullyVerified,
    userSubmittedAllVerificationDocuments,
    currentOnboardingStep,
    setCurrentOnboardingStep,
  };
};


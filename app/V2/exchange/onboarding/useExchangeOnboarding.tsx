import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  userHasSubmittedCreditTypeVerification,
} from "./utils";

export const useExchangeOnboarding = () => {
  const onboardingContext = useExchangeOnboardingContext();
  const { currentOnboardingStep, setCurrentOnboardingStep, resetOnboarding } = onboardingContext;
  // const { user } = useSelector((state: AppRootState) => state.kyc);
  // const { user: kycUserData } = useSelector((state: AppRootState) => state.kyc);
  const { exchangeUserData } = useExchangeAuth();

  const { openBottomSheet, closeBottomSheet, setBottomSheetContent } =
    useAppBottomSheetContext();

    const kycUser = exchangeUserData;

  // Track the latest user data with a ref
  const userRef = useRef<UserModel | null>(kycUser);
  useEffect(() => {
    userRef.current = kycUser;
  }, [kycUser]);

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

  // Calculate the correct onboarding step based on current user state
  // This mirrors the logic in ExchangeOnboardingProvider to ensure consistency
  const calculateOnboardingStep = useCallback((user: UserModel | null): Onboarding => {
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
  }, []);

  // Handle opening onboarding bottom sheet
  const handleOpenOnboardingBottomSheet = useCallback(() => {
    console.log("User state:", { ...kycUser });
    
    // Calculate the correct step based on current user state
    // This ensures we always show the correct step even if user data was loaded after provider mount
    const calculatedStep = calculateOnboardingStep(kycUser);
    console.log("handleOpenOnboardingBottomSheet called", { 
      calculatedStep,
      currentOnboardingStep,
      user: kycUser 
    });
    
    // Update the step in context if it's different
    if (calculatedStep !== currentOnboardingStep) {
      console.log("Updating step from", currentOnboardingStep, "to", calculatedStep);
      setCurrentOnboardingStep(calculatedStep);
    }
    
    const currentStepComponent = stepComponentMap[calculatedStep];

    if (!currentStepComponent) {
      console.warn(`No component found for step: ${calculatedStep}`);
      return;
    }

    console.log("Opening bottom sheet with step:", calculatedStep);
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
        // Reset onboarding to start from the correct step next time
        resetOnboarding();
      },
    });

    console.log("Bottom sheet ID:", bottomSheetId);
    setIsOnboarding(true);
    setCurrentBottomSheetId(bottomSheetId);
  }, [kycUser, stepComponentMap, openBottomSheet, resetOnboarding, calculateOnboardingStep, currentOnboardingStep, setCurrentOnboardingStep]);

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
      isUserFullyOnboarded(kycUser)
    ) {
      // Small delay to show the success message
      const timer = setTimeout(() => {
        closeBottomSheet(currentBottomSheetId);
        setIsOnboarding(false);
        setCurrentBottomSheetId(null);
        // Reset onboarding to start from the correct step next time
        resetOnboarding();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    isOnboarding,
    currentBottomSheetId,
    currentOnboardingStep,
    kycUser,
    closeBottomSheet,
    resetOnboarding,
  ]);

  // Calculate verification status
  const userIsFullyVerified = useMemo(
    () => isUserFullyOnboarded(kycUser),
    [kycUser]
  );

  const userSubmittedAllVerificationDocuments = useMemo(
    () => submittedAllVerificationDocuments(kycUser),
    [kycUser]
  );

  return {
    handleOpenOnboardingBottomSheet,
    userIsFullyVerified,
    userSubmittedAllVerificationDocuments,
    currentOnboardingStep,
    setCurrentOnboardingStep,
  };
};


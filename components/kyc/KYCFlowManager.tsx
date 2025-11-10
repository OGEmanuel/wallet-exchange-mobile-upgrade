import { useOnboardingContext } from "@/src/core/contexts/onboarding";
import { Onboarding } from "@/src/core/contexts/onboarding/types";
import { AppRootState } from "@/state";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import IdentityVerification from "./IdentityVerification";
import PhoneNumber from "./PhoneNumber";
import PhoneVerification from "./PhoneVerification";

interface KYCFlowManagerProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function KYCFlowManager({
  onComplete,
  onBack,
}: KYCFlowManagerProps) {
  const { currentOnboardingStep, setCurrentOnboardingStep } = useOnboardingContext();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  // Ensure we show identity verification if opened directly (e.g., from Swap screen)
  useEffect(() => {
    const identityVerificationSteps = [
      Onboarding.AuthIdentityVerificationOverview,
      Onboarding.AuthBvnVerificationInput,
      Onboarding.AuthBvnVerificationSuccess,
      Onboarding.AuthIdVerificationInput,
      Onboarding.AuthIdVerificationUpload,
    ];
    
    // If current step is not an identity verification step, set it to overview
    if (!identityVerificationSteps.includes(currentOnboardingStep)) {
      setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
    }
  }, [currentOnboardingStep, setCurrentOnboardingStep]);

  // Extract phone number and country code from user state
  const phoneNumber = useMemo(() => {
    if (user?.phone) {
      // Format might be "+1234567890"
      return user.phone.replace(/^\+\d{1,4}/, "");
    }
    return "";
  }, [user?.phone]);

  const countryCode = useMemo(() => {
    if (user?.phone) {
      const match = user.phone.match(/^\+(\d{1,4})/);
      if (match) return `+${match[1]}`;
    }
    // Try to get from metadata
    const phoneCode = user?.metaData?.userPhoneNumberData?.countryData?.phoneCode;
    if (phoneCode) return phoneCode;
    return "";
  }, [user?.phone, user?.metaData?.userPhoneNumberData?.countryData?.phoneCode]);

  // Determine which component to show based on onboarding step
  const renderCurrentStep = useMemo(() => {
    switch (currentOnboardingStep) {
      case Onboarding.AuthPhoneNumberInput:
        return (
          <PhoneNumber
            onPhoneVerified={() => {
              // Step will be updated automatically by onboarding context when user metadata changes
            }}
            onSkip={() => {
              // Skip will be handled by PhoneNumber component via updateUser
            }}
            onBack={onBack}
          />
        );
      case Onboarding.AuthPhoneNumberOtpVerification:
        return (
          <PhoneVerification
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            onOTPVerified={() => {
              // Step will be updated automatically by onboarding context when user metadata changes
            }}
            onBack={() => {
              // Go back to phone input
              setCurrentOnboardingStep(Onboarding.AuthPhoneNumberInput);
            }}
            onSkip={() => {
              // Skip will be handled by PhoneVerification component via updateUser
            }}
          />
        );
      case Onboarding.AuthIdentityVerificationOverview:
      case Onboarding.AuthBvnVerificationInput:
      case Onboarding.AuthBvnVerificationSuccess:
      case Onboarding.AuthIdVerificationInput:
      case Onboarding.AuthIdVerificationUpload:
        return (
          <IdentityVerification
            onComplete={onComplete}
            onBack={onBack}
          />
        );
      default:
        // Fallback to Identity Verification if step doesn't match
        return (
          <IdentityVerification
            onComplete={onComplete}
            onBack={onBack}
          />
        );
    }
  }, [currentOnboardingStep, setCurrentOnboardingStep, phoneNumber, countryCode, onComplete, onBack]);

  return <View style={{ flex: 1 }}>{renderCurrentStep}</View>;
}

 
 
import { JSX, useCallback, useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// import { AppRootState } from "../../store/store";
// import { submittedAllVerificationDocuments, userHasSubmittedCreditTypeVerification } from "../../utils/app_utils_methods";

import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppRootState } from "@/state";
import { useSelector } from "react-redux";
import { OnboardingContext } from "./OnboardingContext";
import { Onboarding } from "./types";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

const userHasSubmittedCreditTypeVerification = (user?: UserModel | null): boolean => {
  return user?.verificationIds?.find((verificationId) => verificationId.documentClass === "Credit")?.status === "approved";
}

export const submittedAllVerificationDocuments = (user?: UserModel | null): boolean => {
  const listOfCountryRequiredDocumentClasses = user?.countryId?.requiredDocuments?.map((document) => document.documentClass);
  const listOfSubmisttedDocumentClasses = Array.from(new Set(user?.verificationIds?.filter((verificationId) => verificationId.status !== "rejected").map((verificationId) => verificationId.documentClass)));

  return listOfCountryRequiredDocumentClasses?.length === listOfSubmisttedDocumentClasses.length;
}

export const isUserFullyOnboarded = (user?: UserModel | null): boolean => {
  let userIsFullyVerified = false;

  if ((user?.verificationStatus?.totalApprovedDocuments && user.verificationStatus.totalRequiredDocuments)) {
    if (user.phoneNumberVerified && submittedAllVerificationDocuments(user)) {
      userIsFullyVerified = true;
    }
  }

  return userIsFullyVerified;
};

export const OnboardingProvider = ({ children }: OnboardingProviderProps): JSX.Element => {
  const { user } = useSelector((state: AppRootState) => state.kyc);

  // Determine initial onboarding step based on user state
  const determineInitialStep = useCallback((): Onboarding => {
    if (!user) return Onboarding.Signin;

    const {
      emailVerified,
      username,
      phoneNumberVerified,
      metaData,
    } = user;

    if (user.isGuest && !user?.email && !emailVerified) return Onboarding.Signin;

    // PHASE 1: Email verification and username setup
    if (!emailVerified && user.email) return Onboarding.AuthOtp;
    if (!username && emailVerified) return Onboarding.Referral;

    // PHASE 2: Phone verification
    const phoneSkipped = metaData?.userPhoneNumberData?.userskippedPhoneNumberOnboarding;
    const showPhoneIntro = username && emailVerified && !phoneNumberVerified && !phoneSkipped;
    const showPhoneInput = metaData?.userPhoneNumberData?.shownPhoneNumberOnboardingIntro &&
      !metaData?.userPhoneNumberData?.shownPhoneNumberInput &&
      !phoneNumberVerified &&
      !phoneSkipped;
    const showPhoneOtp = metaData?.userPhoneNumberData?.shownPhoneNumberInput &&
      !phoneNumberVerified &&
      !phoneSkipped;

    if (showPhoneIntro) {
      if (showPhoneInput) return Onboarding.AuthPhoneNumberInput;
      if (showPhoneOtp) return Onboarding.AuthPhoneNumberOtpVerification;
      return Onboarding.AuthVerificationIntro;
    }

    // PHASE 3 & 4: Identity verification
    const phoneVerifiedOrSkipped = phoneNumberVerified || phoneSkipped;
    const identityVerificationSubmitted = submittedAllVerificationDocuments(user) || (user?.metaData?.manuallySetAllIdenityDocumentToSubmitted && userHasSubmittedCreditTypeVerification(user));

    if (phoneVerifiedOrSkipped && !identityVerificationSubmitted) {
      const { shownIdentificationOverviewOnboardingIntro } = metaData || {};
      const bvnVerified = user.metaData?.bvnMarkedAsVerified
        ||
        user.metaData?.skippedBvnVerification
        ||
        // user?.verificationIds?.find((verificationId) => verificationId.documentClass === "Credit")?.status === "approved";
        (user.verificationIds?.filter(verificationId => verificationId.documentClass === "Credit").find(verificationId => verificationId.status === "approved"));

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
        if (metaData?.idVerificationData?.shownAuthIdVerificationInput) return Onboarding.AuthIdVerificationUpload;
      }

      return Onboarding.AuthIdentityVerificationOverview;
    }

    // Verification submitted
    if (identityVerificationSubmitted) return Onboarding.AuthVerificationSubmitted;

    // Default fallback
    return Onboarding.Signin;
  }, [user]);

  const [currentOnboardingStep, setCurrentOnboardingStep] = useState<Onboarding>(determineInitialStep());

  // Update step when user data changes
  useEffect(() => {
    setCurrentOnboardingStep(determineInitialStep());
  }, [determineInitialStep]);

  // Reset to initial state based on current user
  const resetOnboarding = useCallback((): void => {
    setCurrentOnboardingStep(determineInitialStep());
  }, [determineInitialStep]);

  return (
    <OnboardingContext.Provider
      value={{
        currentOnboardingStep,
        setCurrentOnboardingStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
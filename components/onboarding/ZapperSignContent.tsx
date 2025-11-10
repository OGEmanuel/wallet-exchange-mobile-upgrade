import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { Onboarding } from "@/src/core/contexts/onboarding/types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppRootState } from "@/state";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { Confetti, ConfettiMethods } from "react-native-fast-confetti";
import { useSelector } from "react-redux";
import IdentityVerification from "../kyc/IdentityVerification";
import PhoneNumber from "../kyc/PhoneNumber";
import PhoneVerification from "../kyc/PhoneVerification";
import EmailVerification from "./EmailVerification";
import EnterUsername from "./EnterUsername";
import LoginToZap from "./LoginToZap";
import UsernameSuccess from "./UsernameSuccess";
import VerifyYourIdentity from "./VerifyYourIdentity";

export interface ZapperSignContentProps {
  onContinue?: () => void;
  onClose?: () => void;
}

// Helper functions from OnboardingProvider
const userHasSubmittedCreditTypeVerification = (user?: UserModel | null): boolean => {
  return user?.verificationIds?.find((verificationId) => verificationId.documentClass === "Credit")?.status === "approved";
};

const submittedAllVerificationDocuments = (user?: UserModel | null): boolean => {
  const listOfCountryRequiredDocumentClasses = user?.countryId?.requiredDocuments?.map((document) => document.documentClass);
  const listOfSubmisttedDocumentClasses = Array.from(new Set(user?.verificationIds?.filter((verificationId) => verificationId.status !== "rejected").map((verificationId) => verificationId.documentClass)));
  return listOfCountryRequiredDocumentClasses?.length === listOfSubmisttedDocumentClasses.length;
};

export default function ZapperSignContent({
  onContinue,
  onClose,
}: ZapperSignContentProps) {
  const confettiRef = useRef<ConfettiMethods>(null);
  const { handleExchangeLogin } = useExchangeAuth();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState<Onboarding>(Onboarding.Signin);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    confettiRef.current?.pause();
  }, []);

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

  // Update step when user data changes
  useEffect(() => {
    setCurrentOnboardingStep(determineInitialStep());
  }, [determineInitialStep]);

  // Screen transition function
  const transitionToNextScreen = (nextStep: Onboarding) => {
    // Start from the right (positive translateX value)
    slideAnim.setValue(300);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setCurrentOnboardingStep(nextStep);
  };

  // Navigation handlers
  const handleLoginSuccess = (userEmail: string) => {
    setEmail(userEmail);
    transitionToNextScreen(Onboarding.AuthOtp);
  };

  const handleEmailVerificationSuccess = () => {
    transitionToNextScreen(Onboarding.Referral);
  };

  const handleUsernameSuccess = (userUsername: string) => {
    setUsername(userUsername);
    transitionToNextScreen(Onboarding.AuthVerificationIntro);
  };

  const handleUsernameSuccessComplete = () => {
    transitionToNextScreen(Onboarding.AuthPhoneNumberInput);
  };

  const handlePhoneVerified = () => {
    transitionToNextScreen(Onboarding.AuthIdentityVerificationOverview);
  };

  const handleIdentityVerificationComplete = () => {
    onContinue?.();
  };

  const handleResendEmail = async () => {
    if (email && !isResending) {
      setIsResending(true);
      try {
        const response = await handleExchangeLogin(email);
        if (response) {
          console.log("Resend email successful");
        } else {
          console.error("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Resend email error:", error);
      } finally {
        setIsResending(false);
      }
    }
  };

  // Render current screen based on onboarding step
  const renderCurrentScreen = () => {
    switch (currentOnboardingStep) {
      case Onboarding.Signin:
        return <LoginToZap onLoginSuccess={handleLoginSuccess} />;
      case Onboarding.AuthOtp:
        return (
          <EmailVerification
            email={email}
            onVerify={handleEmailVerificationSuccess}
            onResend={handleResendEmail}
            isLoading={isResending}
          />
        );
      case Onboarding.Referral:
        return <EnterUsername onUsernameSuccess={handleUsernameSuccess} />;
      case Onboarding.AuthVerificationIntro:
        return (
          <UsernameSuccess
            confettiRef={confettiRef}
            onComplete={handleUsernameSuccessComplete}
            username={username}
          />
        );
      case Onboarding.AuthPhoneNumberInput:
        return (
          <PhoneNumber
            onPhoneVerified={(phone, countryCode) => transitionToNextScreen(Onboarding.AuthPhoneNumberOtpVerification)}
            onSkip={handlePhoneVerified}
          />
        );
      case Onboarding.AuthPhoneNumberOtpVerification:
        return (
          <PhoneVerification
            phoneNumber={user?.phone || ""}
            countryCode={""}
            onOTPVerified={handlePhoneVerified}
            onBack={() => transitionToNextScreen(Onboarding.AuthPhoneNumberInput)}
          />
        );
      case Onboarding.AuthIdentityVerificationOverview:
      case Onboarding.AuthIdVerificationInput:
      case Onboarding.AuthIdVerificationUpload:
      case Onboarding.AuthBvnVerificationInput:
      case Onboarding.AuthBvnVerificationSuccess:
        return (
          <IdentityVerification
            onComplete={handleIdentityVerificationComplete}
            onBack={() => transitionToNextScreen(Onboarding.AuthPhoneNumberInput)}
          />
        );
      case Onboarding.AuthVerificationSubmitted:
        return <VerifyYourIdentity onContinue={handleIdentityVerificationComplete} />;
      default:
        return <LoginToZap onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <>
      <Confetti ref={confettiRef} />
      <View style={styles.handle} />
      <View style={styles.backContainer}></View>
      <Image
        source={require("@/assets/images/zapLogoDark.png")}
        style={{ height: 40, width: 120, alignSelf: "center", marginTop: 16 }}
        resizeMode="contain"
      />
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          flex: 1,
        }}
      >
        {renderCurrentScreen()}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    alignSelf: "center",
  },
  backContainer: {
    width: "100%",
    height: 40,
  },
});


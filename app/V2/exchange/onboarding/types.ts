export enum Onboarding {
  Signin = "Signin",
  AuthOtp = "AuthOtp",
  Referral = "Referral",
  AuthVerificationIntro = "AuthVerificationIntro",
  AuthPhoneNumberInput = "AuthPhoneNumberInput",
  AuthPhoneNumberOtpVerification = "AuthPhoneNumberOtpVerification",
  AuthIdentityVerificationOverview = "AuthIdentityVerificationOverview",
  AuthBvnVerificationInput = "AuthBvnVerificationInput",
  AuthBvnVerificationSuccess = "AuthBvnVerificationSuccess",
  AuthIdVerificationInput = "AuthIdVerificationInput",
  AuthIdVerificationUpload = "AuthIdVerificationUpload",
  AuthVerificationSubmitted = "AuthVerificationSubmitted",
}

export interface ExchangeOnboardingContextType {
  currentOnboardingStep: Onboarding;
  setCurrentOnboardingStep: (step: Onboarding) => void;
  resetOnboarding: () => void;
}


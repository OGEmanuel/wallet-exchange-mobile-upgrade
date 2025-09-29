import React, { useState } from "react";
import { View } from "react-native";
import IdentityVerification from "./IdentityVerification";
import PhoneNumber from "./PhoneNumber";
import PhoneVerification from "./PhoneVerification";

export type KYCStep = "phone_number" | "phone_otp" | "identity_verification";

interface KYCFlowManagerProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function KYCFlowManager({
  onComplete,
  onBack,
}: KYCFlowManagerProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>("phone_number");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");

  const handlePhoneVerified = (phone: string, code: string) => {
    setPhoneNumber(phone);
    setCountryCode(code);
    setCurrentStep("phone_otp");
  };

  const handleSkip = () => {
    setCurrentStep("identity_verification");
  };

  const handleOTPVerified = () => {
    setCurrentStep("identity_verification");
  };

  const handleIdentityVerificationComplete = () => {
    onComplete?.();
  };

  const handleBack = () => {
    switch (currentStep) {
      case "phone_otp":
        setCurrentStep("phone_number");
        break;
      case "identity_verification":
        setCurrentStep("phone_otp");
        break;
      default:
        onBack?.();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "phone_number":
        return (
          <PhoneNumber
            onPhoneVerified={handlePhoneVerified}
            onSkip={handleSkip}
            onBack={onBack}
          />
        );
      case "phone_otp":
        return (
          <PhoneVerification
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            onOTPVerified={handleOTPVerified}
            onBack={handleBack}
          />
        );
      case "identity_verification":
        return (
          <IdentityVerification
            onComplete={handleIdentityVerificationComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return <View style={{ flex: 1 }}>{renderCurrentStep()}</View>;
}

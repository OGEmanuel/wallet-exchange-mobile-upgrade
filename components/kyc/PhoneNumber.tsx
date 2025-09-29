import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CustomButton, CustomText } from "../general";
import CountryPhoneInput from "./CountryPhoneInput";
import CountrySelect from "./CountrySelect";
import PhoneVerification from "./PhoneVerification";

interface PhoneNumberProps {
  onPhoneVerified?: (phone: string, countryCode: string) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export default function PhoneNumber({
  onPhoneVerified,
  onSkip,
  onBack,
}: PhoneNumberProps) {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const theme = useTheme<Theme>();

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    // Basic validation - at least 7 digits
    const cleanPhone = phone.replace(/\D/g, "");
    setIsValid(cleanPhone.length >= 7 && cleanPhone.length <= 15);
  };

  const handleVerify = () => {
    if (isValid && phoneNumber && selectedCountry) {
      setShowOTP(true);
    }
  };

  const handleOTPVerified = () => {
    setVerified(true);
    setShowOTP(false);
    onPhoneVerified?.(phoneNumber, selectedCountry?.alpha2 || "");
  };

  const handleContinue = () => {
    if (selectedCountry && phoneNumber && isValid) {
      // Send OTP and show OTP verification screen
      setShowOTP(true);
    }
  };

  if (showOTP) {
    return (
      <PhoneVerification
        phoneNumber={phoneNumber}
        countryCode={selectedCountry?.phoneCode || ""}
        onOTPVerified={handleOTPVerified}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        Choose country
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Select a country to start your ID verification.
      </CustomText>
      <View style={styles.inputContainer}>
        <CountrySelect
          value={selectedCountry}
          onSelect={handleCountrySelect}
          placeholder="Select country"
          showFlag={true}
          showPhoneCode={true}
        />

        <CountryPhoneInput
          verified={verified}
          onOtpSent={(data) => {
            setPhoneNumber(data.phone);
            setVerified(true);
          }}
          phoneDets={{
            phone: phoneNumber,
            countryCode: selectedCountry?.alpha2 || "",
          }}
          onValidate={(isValid) => {
            setIsValid(isValid);
          }}
          selectedCountry={selectedCountry}
          onPhoneChange={handlePhoneChange}
          showVerifyButton={true}
        />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonsRow}>
          <CustomButton
            text="Skip"
            onPress={() => onSkip?.()}
            width="48%"
            height={56}
            borderRadius={56}
            bgColor={theme.colors.secondaryBackgroundColor}
            color={theme.colors.bodyTextColor}
            variant="bodySubheader"
            fontSize={16}
          />
          <CustomButton
            text="Continue"
            onPress={handleContinue}
            width="48%"
            height={56}
            borderRadius={56}
            bgColor={
              selectedCountry && phoneNumber && isValid
                ? theme.colors.primaryColor
                : theme.colors.borderColor
            }
            color={theme.colors.white}
            variant="bodySubheader"
            fontSize={16}
            disabled={!selectedCountry || !phoneNumber || !isValid}
            disabledColor={theme.colors.borderColor}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  subtitle: {
    marginBottom: 24,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  inputContainer: {
    flex: 1,
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});

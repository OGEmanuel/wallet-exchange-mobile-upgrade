import { CountryData } from "@/src/core/utils/countryData";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSelector } from "react-redux";
import { CustomButton, CustomText } from "../general";
import CountryPhoneInput from "./CountryPhoneInput";
import CountrySelect from "./CountrySelect";

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
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { updateUser, authPhoneNumber } = useKyc();
  
  // Initialize from user state if available
  const initialCountry = user?.metaData?.userPhoneNumberData?.countryData;
  const [selectedCountry, setSelectedCountry] = useState<
    CountryData | undefined
  >(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const theme = useTheme<Theme>();
  const [verifyPhoneNumberLoading, setVerifyPhoneNumberLoading] =
    useState(false);

  // Load phone number from user state if available
  useEffect(() => {
    if (user?.phone && !phoneNumber) {
      // Extract phone number and country code from user.phone if it exists
      // Format might be "+1234567890" or similar
      setPhoneNumber(user.phone.replace(/^\+\d{1,4}/, "")); // Remove country code prefix
    }
  }, [user?.phone, phoneNumber]);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    // Basic validation - at least 7 digits
    const cleanPhone = phone.replace(/\D/g, "");
    setIsValid(cleanPhone.length >= 7 && cleanPhone.length <= 15);
  };

  const handleContinue = async () => {
    if (selectedCountry && phoneNumber && isValid) {
      setVerifyPhoneNumberLoading(true);

      try {
        await authPhoneNumber({
          phone: phoneNumber,
          countryCode: selectedCountry?.phoneCode.replaceAll("+", "") || null,
          isWhatsApp: false,
        });

        // Update user metadata to indicate phone input has been shown
        // This will trigger the onboarding context to move to OTP step
        updateUser({
          ...user,
          metaData: {
            ...user?.metaData,
            userPhoneNumberData: {
              ...user?.metaData?.userPhoneNumberData,
              countryData: selectedCountry,
              shownPhoneNumberOnboardingIntro: true,
              shownPhoneNumberInput: true,
            },
          },
        });

        onPhoneVerified?.(phoneNumber, selectedCountry?.phoneCode.replaceAll("+", "") || "");
      } catch (error) {
        console.error("Failed to send phone verification:", error);
      } finally {
        setVerifyPhoneNumberLoading(false);
      }
    }
  };

  const handleSkip = () => {
    // Update user metadata to indicate phone verification was skipped
    updateUser({
      ...user,
      metaData: {
        ...user?.metaData,
        userPhoneNumberData: {
          ...user?.metaData?.userPhoneNumberData,
          userskippedPhoneNumberOnboarding: true,
          shownPhoneNumberOnboardingIntro: true,
        },
      },
    });

    onSkip?.();
  };

  return (
    <>
      <KeyboardAwareScrollView style={{ flex: 1 }}>
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
              onSelect={(value) => {
                if (!Array.isArray(value)) handleCountrySelect(value);
              }}
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
                countryCode: selectedCountry?.phoneCode || "",
              }}
              onValidate={(isValid) => {
                setIsValid(isValid);
              }}
              selectedCountry={selectedCountry}
              onPhoneChange={handlePhoneChange}
              showVerifyButton={true}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonsRow}>
          <CustomButton
            text="Skip"
            onPress={handleSkip}
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
            isLoading={verifyPhoneNumberLoading}
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
    </>
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
    // flex: 1,
    // gridTemplateColumns: "1fr 1fr",
    gap: 8,
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
    bottom: 100,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});

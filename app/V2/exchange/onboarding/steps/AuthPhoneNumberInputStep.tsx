import { AppInput } from "@/app/V2/components/ui/Input";
import countryData, {
  CountryData,
  getCountryFlagUrl,
} from "@/src/core/utils/countryData";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AppButton, AppSelect } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthPhoneNumberInputStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { authPhoneNumber, updateUser, fetchUserById } = useKyc();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions = countryData.map((country) => ({
    label: `${country.label} ${country.phoneCode}`,
    value: country.value,
    prefix: (
      <Image
        source={{ uri: getCountryFlagUrl(country.value) }}
        style={{ width: 24, height: 16, marginRight: 8 }}
        resizeMode="contain"
      />
    ),
  }));

  const handleCountrySelect = (value: string) => {
    const country = countryData.find((c) => c.value === value);
    setSelectedCountry(country || null);
    setPhoneError("");
  };

  const validatePhone = (phone: string): boolean => {
    if (!selectedCountry) return false;
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (touched && selectedCountry) {
      setPhoneError(validatePhone(text) ? "" : "Invalid phone number");
    }
  };

  const handleContinue = async () => {
    setTouched(true);
    if (!selectedCountry) {
      setPhoneError("Please select a country");
      return;
    }
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setPhoneError("Invalid phone number");
      return;
    }

    setIsLoading(true);
    setPhoneError("");
    try {
      const countryCode = selectedCountry.phoneCode.replace("+", "");
      const response = await authPhoneNumber({
        phone: phoneNumber.trim(),
        countryCode: countryCode,
        isWhatsApp: false,
      });

      if (response?.success) {
        // Update user metadata to indicate phone input has been shown
        // Store phone number in user object for OTP verification
        const fullPhoneNumber = `${
          selectedCountry.phoneCode
        }${phoneNumber.trim()}`;
        updateUser({
          ...user,
          phone: fullPhoneNumber,
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

        // Fetch updated user data
        await fetchUserById(user);
        setCurrentOnboardingStep(Onboarding.AuthPhoneNumberOtpVerification);
      } else {
        setPhoneError(
          response?.message || "Failed to send OTP. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Auth phone number error:", error);
      setPhoneError(error?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
            Verify Phone Number
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.placeholderTextColor },
            ]}
          >
            Enter your country code and phone number.
          </Text>

          <View style={styles.phoneRow}>
            <View style={styles.countrySelector}>
              <AppSelect
                options={countryOptions}
                value={selectedCountry?.value}
                onChange={handleCountrySelect}
                placeholder="Country"
                searchable={true}
                label="Country"
              />
            </View>

            <View style={styles.phoneInput}>
              <AppInput
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                onBlur={() => setTouched(true)}
                placeholder={selectedCountry?.inputFormat || "Phone number"}
                type="tel"
                prefix={
                  selectedCountry ? (
                    <Text
                      style={[
                        styles.countryCode,
                        { color: theme.colors.bodyTextColor },
                      ]}
                    >
                      {selectedCountry.phoneCode}
                    </Text>
                  ) : undefined
                }
                error={phoneError}
                touched={touched}
                disabled={!selectedCountry}
              />
            </View>
          </View>
        </View>

        <View>
          <AppButton
            title="Continue"
            onPress={handleContinue}
            isLoading={isLoading}
            disabled={!selectedCountry || !phoneNumber.trim() || isLoading}
            variant="primary"
            size="lg"
            style={styles.button}
          />

          <AppButton
            title="Skip"
            onPress={handleSkip}
            variant="text"
            size="md"
            style={styles.skipButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  contentContainer: {
    padding: 24,
    justifyContent: "space-between",
    flex: 1,
    height: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "NewScience_SemiBold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "PlusJakartaSans_Regular",
  },
  phoneRow: {
    flexDirection: "row",
    alignContent: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  countrySelector: {
    width: 120,
  },
  phoneInput: {
    flex: 1,
    alignSelf: "flex-end",
  },
  countryCode: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Medium",
  },
  input: {
    marginBottom: 0,
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  skipButton: {
    width: "100%",
  },
});

export default AuthPhoneNumberInputStep;

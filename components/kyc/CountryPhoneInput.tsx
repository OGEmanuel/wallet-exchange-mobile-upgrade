import icons from "@/assets/icons";
import { CountryData } from "@/src/core/utils/countryData";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { CustomText } from "../general";

interface CountryPhoneInputProps {
  verified: boolean;
  onOtpSent: (data: { phone: string; countryCode: string }) => void;
  phoneDets: { phone: string; countryCode: string };
  onValidate?: (isValid: boolean) => void;
  onVerify?: () => void;
  showVerifyButton?: boolean;
  selectedCountry?: CountryData;
  onPhoneChange?: (phone: string) => void;
}

// Simple phone validation function
const isValidPhoneNumber = (phone: string, countryCode: string): boolean => {
  // Basic validation - at least 7 digits
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

export default function CountryPhoneInput({
  verified,
  onOtpSent,
  phoneDets,
  onValidate,
  onVerify,
  showVerifyButton = false,
  selectedCountry,
  onPhoneChange,
}: CountryPhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(phoneDets?.phone || "");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedCountry, setLocalSelectedCountry] = useState();

  const { colors } = useTheme<Theme>();

  // // Debug logging
  // React.useEffect(() => {
  //   console.log("CountryPhoneInput selectedCountry:", selectedCountry);
  // }, [selectedCountry]);

  // Helper function to get flag URL safely
  const getFlagUrl = (country: any) => {
    if (!country) return null;

    if (country.flagUrl) return country.flagUrl;

    if (country.alpha2) {
      return `https://flagcdn.com/w40/${country.alpha2.toLowerCase()}.png`;
    }

    if (country.value) {
      return `https://flagcdn.com/w40/${country.value.toLowerCase()}.png`;
    }

    return `https://flagcdn.com/w40/us.png`;
  };

  const validatePhoneNumber = useCallback(
    (value: string) => {
      const currentCountry = selectedCountry || localSelectedCountry;
      const countryCode = currentCountry?.phoneCode;

      if (!countryCode) {
        setIsValid(null);
        setError("Please select a country first");
        onValidate?.(false);
        return;
      }

      if (!value) {
        setIsValid(null);
        setError("Phone number is required");
        onValidate?.(false);
        return;
      }

      try {
        const valid = isValidPhoneNumber(value, countryCode);
        setIsValid(valid);
        setError(
          valid
            ? null
            : `Invalid phone number for ${
                currentCountry?.phoneCode ||
                currentCountry.label ||
                "selected country"
              }`
        );
        onValidate?.(valid);
      } catch (err) {
        setIsValid(false);
        setError("Invalid phone number format");
        onValidate?.(false);
      }
    },
    [selectedCountry, localSelectedCountry, onValidate]
  );

  const onChangePhone = useCallback(
    (value: string) => {
      if (isValidated) return;
      setPhone(value);
      onPhoneChange?.(value);

      // Validate phone number
      const currentCountry = selectedCountry || localSelectedCountry;
      const countryCode = currentCountry?.phoneCode || currentCountry?.value;
      if (countryCode) {
        const valid = isValidPhoneNumber(value, countryCode);
        setIsValid(valid);
        onValidate?.(valid);
      }
    },
    [isValidated, selectedCountry, onPhoneChange, onValidate]
  );

  const handleSendOTP = async () => {
    const currentCountry = selectedCountry || localSelectedCountry;
    const countryCode = currentCountry?.phoneCode || currentCountry?.value;

    if (!countryCode) {
      setError("Please select a country");
      return;
    }

    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    const valid = isValidPhoneNumber(phone, countryCode);
    setIsValid(valid);

    if (!valid) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock OTP sending - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsValidated(true);
      onOtpSent?.({ phone, countryCode: countryCode });
    } catch (error: any) {
      console.log(error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCountryList = useCallback(() => {
    if (isValidated) return;
    setOpen((prev) => !prev);
    setSearchTerm(""); // reset search when opening
  }, [isValidated]);

  const handleCountrySelect = useCallback(
    (country: typeof localSelectedCountry) => {
      if (isValidated) return;
      setLocalSelectedCountry(country);
      setOpen(false);
      if (!phone) return;
      validatePhoneNumber(phone);
    },
    [phone, validatePhoneNumber, isValidated]
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View
          // onPress={toggleCountryList}
          // disabled={true}
          style={[
            styles.countrySelector,
            { 
              backgroundColor: colors.secondaryBackgroundColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <CustomText style={styles.countryCode}>
            {selectedCountry?.phoneCode}
          </CustomText>
          {/* <View style={styles.flagContainer}>
            <Image
              source={{
                uri: getFlagUrl(selectedCountry || localSelectedCountry),
              }}
              style={{ width: "100%", height: "100%" }}
              // resizeMode="contain"
            />
          </View> */}
          {/* <View style={styles.dropdownIcon}>
            <ThemedArrowUpIcon
              style={{ width: 24, height: 24, tintColor: colors.bodyTextColor }}
            />
          </View> */}
        </View>

        <View
          style={[
            styles.phoneInputContainer,
            { backgroundColor: colors.secondaryBackgroundColor },
          ]}
        >
          <TextInput
            style={[styles.phoneInput, { color: colors.bodyTextColor }]}
            keyboardType="phone-pad"
            placeholder={
              selectedCountry || localSelectedCountry
                ? "Phone number"
                : "Select a country first"
            }
            value={phone}
            placeholderTextColor={colors.placeholderTextColor}
            onChangeText={onChangePhone}
            editable={!verified && !!(selectedCountry || localSelectedCountry)}
          />

          {verified && (
            <Image
              source={icons.checkFill}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
          )}

          {isLoading && !isValid && (
            <ActivityIndicator size="small" color={colors.primaryColor} />
          )}
        </View>
      </View>

      {open && (
        <View
          style={[
            styles.countryList,
            { backgroundColor: colors.secondaryBackgroundColor },
          ]}
        >
          {/* 🔍 Search Bar */}
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search country"
            placeholderTextColor={colors.placeholderTextColor}
            style={[
              styles.searchInput,
              {
                color: colors.bodyTextColor,
                borderBottomColor: colors.borderColor,
              },
            ]}
          />
        </View>
      )}

      {!!error && (
        <CustomText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </CustomText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  countryCode: {
    fontFamily: "PlusJakartaSans_Medium",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  countrySelector: {
    width: 80,
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  flagContainer: {
    width: 24,
    height: 24,
    flex: 1,
  },
  dropdownIcon: {
    width: 24,
    height: 24,
  },
  dropdownText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  phoneInputContainer: {
    flex: 1,
    borderRadius: 8,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  countryFlagContainer: {
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneInput: {
    height: 48,
    flex: 1,
    fontFamily: "PlusJakartaSans_Regular",
    fontSize: 14,
  },
  verifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  verifyText: {
    fontFamily: "PlusJakartaSans_Medium",
    fontSize: 14,
  },
  checkIcon: {
    fontSize: 16,
    color: "#35B592",
    fontWeight: "bold",
  },
  countryList: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
    maxHeight: 250,
    paddingHorizontal: 16,
    position: "absolute",
    top: 58,
    zIndex: 10,
  },
  searchInput: {
    height: 40,
    borderBottomWidth: 1,
    marginBottom: 8,
    fontFamily: "PlusJakartaSans_Regular",
    fontSize: 14,
  },
  countryItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  countryName: {
    fontFamily: "PlusJakartaSans_Medium",
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    position: "absolute",
    top: 50,
    fontFamily: "PlusJakartaSans_Regular",
    fontSize: 14,
  },
});

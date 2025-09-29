import { ThemedArrowUpIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { CustomText } from "../general";

interface CountryPhoneInputProps {
  verified: boolean;
  onOtpSent: (data: { phone: string; countryCode: string }) => void;
  phoneDets: { phone: string; countryCode: string };
  onValidate?: (isValid: boolean) => void;
}

// Mock data for countries
const mockCountries = [
  {
    alpha2: "US",
    name: "United States",
    flagUrl: "https://flagcdn.com/w40/us.png",
  },
  { alpha2: "NG", name: "Nigeria", flagUrl: "https://flagcdn.com/w40/ng.png" },
  {
    alpha2: "GB",
    name: "United Kingdom",
    flagUrl: "https://flagcdn.com/w40/gb.png",
  },
  { alpha2: "CA", name: "Canada", flagUrl: "https://flagcdn.com/w40/ca.png" },
];

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
}: CountryPhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(phoneDets?.phone || "");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(mockCountries[0]);

  const { colors } = useTheme<Theme>();

  const validatePhoneNumber = useCallback(
    (value: string) => {
      if (!selectedCountry?.alpha2) {
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
        const valid = isValidPhoneNumber(value, selectedCountry.alpha2);
        setIsValid(valid);
        setError(
          valid ? null : `Invalid phone number for ${selectedCountry.name}`
        );
        onValidate?.(valid);
      } catch (err) {
        setIsValid(false);
        setError("Invalid phone number format");
        onValidate?.(false);
      }
    },
    [selectedCountry, onValidate]
  );

  const onChangePhone = useCallback(
    (value: string) => {
      if (isValidated) return;
      setPhone(value);
    },
    [isValidated]
  );

  const handleSendOTP = async () => {
    if (!selectedCountry?.alpha2) {
      setError("Please select a country");
      return;
    }

    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    const valid = isValidPhoneNumber(phone, selectedCountry.alpha2);
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
      onOtpSent?.({ phone, countryCode: selectedCountry.alpha2 });
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
    (country: typeof selectedCountry) => {
      if (isValidated) return;
      setSelectedCountry(country);
      setOpen(false);
      if (!phone) return;
      validatePhoneNumber(phone);
    },
    [phone, validatePhoneNumber, isValidated]
  );

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!mockCountries?.length) return mockCountries;
    if (!searchTerm.trim()) return mockCountries;
    return mockCountries?.filter((c) =>
      c?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Pressable
          onPress={toggleCountryList}
          disabled={verified}
          style={[
            styles.countrySelector,
            { backgroundColor: colors.secondaryBackgroundColor },
          ]}
        >
          <View style={styles.flagContainer}>
            <SvgUri
              width={24}
              height={24}
              uri={selectedCountry?.flagUrl || ""}
            />
          </View>
          <View style={styles.dropdownIcon}>
            <ThemedArrowUpIcon
              style={{ width: 24, height: 24, tintColor: colors.bodyTextColor }}
            />
          </View>
        </Pressable>

        <View
          style={[
            styles.phoneInputContainer,
            { backgroundColor: colors.secondaryBackgroundColor },
          ]}
        >
          <TextInput
            style={[styles.phoneInput, { color: colors.bodyTextColor }]}
            keyboardType="phone-pad"
            placeholder="Phone number"
            value={phone}
            placeholderTextColor={colors.placeholderTextColor}
            onChangeText={onChangePhone}
            editable={!verified}
          />

          {isLoading && (
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

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.alpha2}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleCountrySelect(item)}
                style={styles.countryItem}
              >
                <CustomText
                  style={[styles.countryName, { color: colors.bodyTextColor }]}
                >
                  {item.name}
                </CustomText>
              </Pressable>
            )}
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
  phoneInput: {
    height: 48,
    flex: 1,
    fontFamily: "PlusJakartaSans_Regular",
    fontSize: 14,
  },
  verifyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
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

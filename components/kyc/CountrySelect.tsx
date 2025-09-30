import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useMemo } from "react";
import { Image } from "react-native";
import countryData, {
  CountryData,
  getCountryFlagUrl,
} from "../../src/core/utils/countryData";
import Select, { SelectProps, SelectRef } from "../Select";

export interface CountrySelectProps
  extends Omit<SelectProps<CountryData>, "options" | "error"> {
  showPhoneCode?: boolean;
  showFlag?: boolean;
  preferredCountries?: string[]; // Array of country codes to show at the top
  excludeCountries?: string[]; // Array of country codes to exclude
  label?: string;
  error?: string | null;
  touched?: boolean;
  onBlur?: () => void;
  selectedCountry?: CountryData | null;
  onCountrySelect?: (country: CountryData) => void;
}

export interface CountrySelectRef extends SelectRef<CountryData> {
  // Additional methods can be added here if needed
}

const CountrySelectComponent = (
  {
    showPhoneCode = true,
    showFlag = true,
    preferredCountries = [],
    excludeCountries = [],
    placeholder = "Select country...",
    searchable = true,
    value,
    label,
    error,
    touched = false,
    onBlur,
    selectedCountry,
    onCountrySelect,
    onSelect,
    ...props
  }: CountrySelectProps,
  ref: React.ForwardedRef<CountrySelectRef>
) => {
  const { colors } = useTheme<Theme>();
  const isDark = colors.mainBackgroundColor === "#000000"; // Simple dark mode detection

  const countryOptions = useMemo(() => {
    let filteredCountries = countryData;
    // let filteredCountries = allCountries.filter(
    //   country => !excludeCountries.includes(country.value)
    // );

    // Sort countries: preferred first, then alphabetically
    const preferred = filteredCountries.filter((country) =>
      preferredCountries.includes(country.value)
    );
    const others = filteredCountries.filter(
      (country) => !preferredCountries.includes(country.value)
    );

    const sortedCountries = [...preferred, ...others];

    const options = sortedCountries.map((country) => ({
      label: country.label,
      value: country,
      //   prefix: showFlag ? (
      //     <Image
      //       source={{ uri: getCountryFlagUrl(country.value) }}
      //       style={{ width: 24, height: 16, marginRight: 8 }}
      //       resizeMode="contain"
      //     />
      //   ) : undefined,
      // suffix: showPhoneCode ? (
      //   <Text
      //     style={{
      //       fontSize: 14,
      //       fontWeight: "500",
      //       color: isDark ? "#D1D5DB" : "#6B7280",
      //     }}
      //   >
      //     {country.phoneCode}
      //   </Text>
      // ) : undefined,
    }));
    return options;
  }, [showPhoneCode, showFlag, preferredCountries, isDark]);

  // Get the selected country flag for the prefix
  const selectedCountryFlag = useMemo(() => {
    if (!value || !showFlag) return undefined;

    const selectedCountry = Array.isArray(value) ? value[0] : value;
    if (!selectedCountry) return undefined;

    return (
      <Image
        source={{ uri: getCountryFlagUrl(selectedCountry.value) }}
        style={{ width: 20, height: 14, marginRight: 8 }}
        resizeMode="contain"
      />
    );
  }, [value, showFlag]);

  // Determine if field has error and should show error styling
  const hasError = error && touched;

  const handleSelect = (selectedValue: CountryData | CountryData[]) => {
    if (onSelect) {
      onSelect(selectedValue);
    }
    if (onCountrySelect && !Array.isArray(selectedValue)) {
      onCountrySelect(selectedValue);
    }
  };

  return (
    <Select
      ref={ref}
      options={countryOptions}
      placeholder={placeholder}
      searchable={searchable}
      maxHeight={SCREEN_HEIGHT * 0.55}
      prefix={selectedCountryFlag}
      value={value}
      label={label}
      error={hasError ? error : undefined}
      touched={touched}
      onSelect={(value) => {
        handleSelect(value);
      }}
      {...props}
    />
  );
};

const CountrySelect = forwardRef(
  CountrySelectComponent
) as React.ForwardRefExoticComponent<
  CountrySelectProps & React.RefAttributes<CountrySelectRef>
> & {
  displayName?: string;
};

CountrySelect.displayName = "CountrySelect";

export default CountrySelect;

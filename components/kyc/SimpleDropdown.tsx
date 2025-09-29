import icons from "@/assets/icons";
import { ThemedChevronDownIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { CustomText } from "../general";

interface SimpleDropdownProps {
  label: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onSelect: (value: string) => void;
}

export default function SimpleDropdown({
  label,
  placeholder,
  options,
  value,
  onSelect,
}: SimpleDropdownProps) {
  const theme = useTheme<Theme>();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <CustomText
        style={[styles.label, { color: theme.colors.placeholderTextColor }]}
      >
        {label}
      </CustomText>

      <Pressable
        style={[
          styles.dropdown,
          {
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderColor: isOpen
              ? theme.colors.primaryColor
              : theme.colors.borderColor,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <CustomText
          style={[
            styles.selectedText,
            {
              color: selectedOption
                ? theme.colors.bodyTextColor
                : theme.colors.placeholderTextColor,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </CustomText>

        <CustomText
          style={[styles.arrow, { color: theme.colors.bodyTextColor }]}
        >
          <ThemedChevronDownIcon
            style={isOpen ? { transform: [{ rotate: "180deg" }] } : {}}
            lightModeColor={theme.colors.bodyTextColor}
            darkModeColor={theme.colors.bodyTextColor}
          />
        </CustomText>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.optionsContainer,
            { backgroundColor: theme.colors.secondaryBackgroundColor },
          ]}
        >
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor:
                    option.value === value
                      ? theme.colors.primaryColor + "20"
                      : "transparent",
                },
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <CustomText
                style={[
                  styles.optionText,
                  { color: theme.colors.bodyTextColor },
                ]}
              >
                {option.label}
              </CustomText>
              {option.value === value && (
                <Image
                  source={icons.checkFill}
                  style={{ width: 20, height: 20 }}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedText: {
    fontSize: 14,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  optionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    zIndex: 1000,
    marginTop: 4,
    maxHeight: 200,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

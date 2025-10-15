import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { CustomText } from "./general";

export interface SelectProps<T> {
  options: {
    label: string;
    value: T;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
  }[];
  value?: T | T[] | null;
  selectedLabel?: string;
  onSelect?: (value: T | T[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxHeight?: number;
  prefix?: React.ReactNode;
  label?: string;
  error?: string;
  touched?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}

export interface SelectRef<T> {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const SelectComponent = <T,>(
  {
    options = [],
    value,
    selectedLabel,
    onSelect,
    placeholder = "Select...",
    searchable = false,
    maxHeight = SCREEN_HEIGHT * 0.4,
    prefix,
    label,
    error,
    touched = false,
    multiple = false,
    disabled = false,
    ...props
  }: SelectProps<T>,
  ref: React.ForwardedRef<SelectRef<T>>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { colors } = useTheme<Theme>();

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return options.filter((option) => value.includes(option.value));
    }
    return options.find((option) => option.value === value);
  }, [value, options]);

  const handleSelect = (option: (typeof options)[0]) => {
    if (disabled) return;

    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(option.value)
        ? currentValue.filter((v) => v !== option.value)
        : [...currentValue, option.value];
      onSelect?.(newValue);
    } else {
      onSelect?.(option.value);
      setIsOpen(false);
    }
  };

  const isSelected = (option: (typeof options)[0]) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(option.value);
    }
    return value === option.value;
  };

  const hasError = error && touched;

  return (
    <View style={styles.container}>
      {label && (
        <CustomText style={[styles.label, { color: colors.bodyTextColor }]}>
          {label}
        </CustomText>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(!isOpen)}
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.secondaryBackgroundColor,
            borderColor: hasError ? colors.error : colors.borderColor,
          },
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.selectContent}>
          {prefix && <View style={styles.prefix}>{prefix}</View>}

          {/* {
            selectedOption &&
            <CustomText
              style={[styles.selectedText, { color: colors.bodyTextColor }]}
            >
              {selectedLabel}
            </CustomText>
          } */}

          {selectedOption || selectedLabel ? (
            <View style={styles.selectedContent}>
              {Array.isArray(selectedOption) ? (
                <CustomText
                  style={[styles.selectedText, { color: colors.bodyTextColor }]}
                >
                  {selectedOption.length} selected
                </CustomText>
              ) : (
                <>
                  {selectedOption?.prefix && (
                    <View style={styles.optionPrefix}>
                      {selectedOption.prefix}
                    </View>
                  )}
                  <CustomText
                    style={[
                      styles.selectedText,
                      { color: colors.bodyTextColor },
                    ]}
                  >
                    {selectedOption?.label || selectedLabel}
                  </CustomText>
                  {selectedOption?.suffix && (
                    <View style={styles.optionSuffix}>
                      {selectedOption.suffix}
                    </View>
                  )}
                </>
              )}
            </View>
          ) : (
            <CustomText
              style={[
                styles.placeholder,
                { color: colors.placeholderTextColor },
              ]}
            >
              {placeholder}
            </CustomText>
          )}
        </View>

        <CustomText style={[styles.arrow, { color: colors.bodyTextColor }]}>
          {isOpen ? "▲" : "▼"}
        </CustomText>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.secondaryBackgroundColor, maxHeight },
          ]}
        >
          {searchable && (
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.bodyTextColor,
                  borderBottomColor: colors.borderColor,
                },
              ]}
              placeholder="Search..."
              placeholderTextColor={colors.placeholderTextColor}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          )}

          <FlatList
            data={filteredOptions}
            nestedScrollEnabled
            keyExtractor={(item, index) => `${item.label}-${index}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={[
                  styles.option,
                  isSelected(item) && {
                    backgroundColor: colors.primaryColor + "20",
                  },
                ]}
              >
                <View style={styles.optionContent}>
                  {item.prefix && (
                    <View style={styles.optionPrefix}>{item.prefix}</View>
                  )}
                  <CustomText
                    style={[styles.optionText, { color: colors.bodyTextColor }]}
                  >
                    {item.label}
                  </CustomText>
                  {item.suffix && (
                    <View style={styles.optionSuffix}>{item.suffix}</View>
                  )}
                </View>
                {isSelected(item) && (
                  <CustomText
                    style={[styles.checkmark, { color: colors.primaryColor }]}
                  >
                    ✓
                  </CustomText>
                )}
              </Pressable>
            )}
          />
        </View>
      )}

      {hasError && (
        <CustomText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </CustomText>
      )}
    </View>
  );
};

const Select = forwardRef(SelectComponent) as <T>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<SelectRef<T>> }
) => React.ReactElement;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  selectContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    marginRight: 8,
  },
  selectedContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    zIndex: 1000,
    marginTop: 4,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  optionPrefix: {
    marginRight: 8,
  },
  optionSuffix: {
    marginLeft: 8,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Select;

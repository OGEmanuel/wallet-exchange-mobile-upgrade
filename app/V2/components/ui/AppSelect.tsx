import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface SelectOption<T = string> {
  label: string;
  value: T;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface AppSelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  label?: string;
  getOptionValue?: (option: SelectOption<T>) => string; // For comparison when T is an object
  getOptionLabel?: (option: SelectOption<T>) => string; // For display when T is an object
}

export const AppSelect = <T = string,>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  isLoading = false,
  disabled = false,
  prefix,
  label,
  getOptionValue = (opt) => String(opt.value),
  getOptionLabel = (opt) => opt.label,
}: AppSelectProps<T>): React.ReactElement => {
  const theme = useTheme<Theme>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to compare values (works for both primitives and objects)
  const isValueEqual = (a: T | undefined, b: T): boolean => {
    if (a === undefined) return false;
    if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
      // For objects, compare by _id if available, otherwise use JSON comparison
      if ("_id" in a && "_id" in b) {
        return (a as any)._id === (b as any)._id;
      }
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
  };

  const selectedOption = options.find((opt) => isValueEqual(value, opt.value));
  const filteredOptions = searchable
    ? options.filter((opt) =>
        getOptionLabel(opt).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Helper to extract a unique key for FlatList
  const getUniqueKey = (item: SelectOption<T>, index: number): string => {
    const value = item.value;
    // If value is an object with _id, use that
    if (typeof value === "object" && value !== null && "_id" in value) {
      return String((value as any)._id);
    }
    // If value is a primitive, use it directly
    if (typeof value !== "object" && value !== null && value !== undefined) {
      return String(value);
    }
    // Fallback to index with a prefix to ensure uniqueness
    return `option-${index}`;
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.bodyTextColor,
              marginBottom: 8,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[
          styles.selectButton,
          {
            backgroundColor: disabled
              ? theme.colors.secondaryBackgroundColor
              : theme.colors.mainBackgroundColor,
            borderColor: theme.colors.borderColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {selectedOption ? (
          <View style={styles.selectedContent}>
            {/* Show prefix prop first (for selected value), then option prefix (for dropdown items) */}
            {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
            {!prefix && selectedOption.prefix && (
              <View style={styles.prefixContainer}>{selectedOption.prefix}</View>
            )}
            <Text
              style={[
                styles.selectedText,
                { color: theme.colors.bodyTextColor },
              ]}
            >
              {getOptionLabel(selectedOption)}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.placeholderTextColor },
            ]}
          >
            {placeholder}
          </Text>
        )}
        <Text style={[styles.arrow, { color: theme.colors.bodyTextColor }]}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.mainBackgroundColor },
            ]}
          >
            {searchable && (
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.colors.secondaryBackgroundColor,
                      color: theme.colors.bodyTextColor,
                      borderColor: theme.colors.borderColor,
                    },
                  ]}
                  placeholder="Search..."
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={{ color: theme.colors.bodyTextColor }}>
                  Loading...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) => getUniqueKey(item, index)}
                renderItem={({ item }) => {
                  const isSelected = isValueEqual(value, item.value);
                  return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      {
                          backgroundColor: isSelected
                            ? theme.colors.primaryColor + "20"
                            : "transparent",
                      },
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.optionContent}>
                      {item.prefix && (
                        <View style={styles.optionPrefix}>{item.prefix}</View>
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          {
                              color: isSelected
                                ? theme.colors.primaryColor
                                : theme.colors.bodyTextColor,
                              fontWeight: isSelected ? "600" : "400",
                          },
                        ]}
                      >
                          {getOptionLabel(item)}
                      </Text>
                    </View>
                    {item.suffix && (
                      <View style={styles.optionSuffix}>{item.suffix}</View>
                    )}
                      {isSelected && (
                      <Text
                        style={[
                          styles.checkmark,
                          { color: theme.colors.primaryColor },
                        ]}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={{ color: theme.colors.bodyTextColor }}>
                      No options found
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Medium",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  prefixContainer: {
    marginRight: 8,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionPrefix: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    flex: 1,
  },
  optionSuffix: {
    marginLeft: 12,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
});


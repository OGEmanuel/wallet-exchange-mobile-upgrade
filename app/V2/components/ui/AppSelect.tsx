import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
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

  // Helper to generate a comparable key for a raw value
  const getValueKey = (val?: T) =>
    getOptionValue({ label: "", value: val as T } as SelectOption<T>);

  const selectedOption = options.find(
    (opt) => getOptionValue(opt) === getValueKey(value)
  );
  const filteredOptions = searchable
    ? options.filter((opt) =>
        getOptionLabel(opt).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Helper to extract a unique key for FlatList
  const getUniqueKey = (item: SelectOption<T>, index: number): string => {
    // Prefer custom getOptionValue if provided
    try {
      const optionKey = getOptionValue(item);
      if (optionKey) return optionKey;
    } catch (e) {
      // ignore and fallback
    }

    const value = item.value as any;
    // If value is an object with _id, use that
    if (value && typeof value === "object" && (value as any)._id) {
      return String((value as any)._id);
    }

    // If value is a primitive, use it directly
    if (value !== null && value !== undefined && typeof value !== "object") {
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
      <Pressable
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
            {selectedOption.prefix && <View>{selectedOption.prefix}</View>}
            {prefix && <View>{prefix}</View>}
            <Text
              style={[
                styles.selectedText,
                { color: theme.colors.bodyTextColor },
              ]}
            >
              {selectedOption.label.split("+")[0].trim().slice(0, 4)}
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
      </Pressable>

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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          getOptionValue(item) === getValueKey(value)
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
                            color:
                              getOptionValue(item) === getValueKey(value)
                                ? theme.colors.primaryColor
                                : theme.colors.bodyTextColor,
                            fontWeight:
                              getOptionValue(item) === getValueKey(value)
                                ? "600"
                                : "400",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {item.suffix && (
                      <View style={styles.optionSuffix}>{item.suffix}</View>
                    )}
                    {getOptionValue(item) === getValueKey(value) && (
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
                )}
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
  selectedText: {
    fontSize: 14,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
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

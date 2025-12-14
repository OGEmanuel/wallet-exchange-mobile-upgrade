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

export interface SelectOption {
  label: string;
  value: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  label?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  isLoading = false,
  disabled = false,
  prefix,
  label,
}) => {
  const theme = useTheme<Theme>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
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
            {selectedOption.prefix && (
              <View style={styles.prefixContainer}>{selectedOption.prefix}</View>
            )}
            {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
            <Text
              style={[
                styles.selectedText,
                { color: theme.colors.bodyTextColor },
              ]}
            >
              {selectedOption.label}
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
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          item.value === value
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
                              item.value === value
                                ? theme.colors.primaryColor
                                : theme.colors.bodyTextColor,
                            fontWeight:
                              item.value === value ? "600" : "400",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {item.suffix && (
                      <View style={styles.optionSuffix}>{item.suffix}</View>
                    )}
                    {item.value === value && (
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


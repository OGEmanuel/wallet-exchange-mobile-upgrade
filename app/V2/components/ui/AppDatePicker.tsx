import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface AppDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
}

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  error,
  touched = false,
  maxDate,
  minDate,
  label,
}) => {
  const theme = useTheme<Theme>();
  const [showPicker, setShowPicker] = useState(false);
  const [internalDate, setInternalDate] = useState(value || new Date());

  const showError = error && touched;

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      setInternalDate(selectedDate);
      onChange(selectedDate);
    }
  };

  const borderColor = showError
    ? theme.colors.error
    : theme.colors.borderColor;

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
        style={[
          styles.pickerButton,
          {
            borderColor,
            borderWidth: 1,
            backgroundColor: theme.colors.mainBackgroundColor,
          },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            styles.pickerText,
            {
              color: value
                ? theme.colors.bodyTextColor
                : theme.colors.placeholderTextColor,
            },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={[styles.calendarIcon, { color: theme.colors.bodyTextColor }]}>
          📅
        </Text>
      </TouchableOpacity>
      {showError && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      {showPicker && (
        <>
          {Platform.OS === "ios" && (
            <View
              style={[
                styles.iosPickerContainer,
                { backgroundColor: theme.colors.mainBackgroundColor },
              ]}
            >
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text
                    style={[
                      styles.iosPickerButton,
                      { color: theme.colors.primaryColor },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onChange(internalDate);
                    setShowPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.iosPickerButton,
                      { color: theme.colors.primaryColor },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={internalDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={maxDate}
                minimumDate={minDate}
              />
            </View>
          )}
          {Platform.OS === "android" && (
            <DateTimePicker
              value={internalDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
            />
          )}
        </>
      )}
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
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    flex: 1,
  },
  calendarIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
    marginTop: 4,
  },
  iosPickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  iosPickerButton: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_SemiBold",
  },
});


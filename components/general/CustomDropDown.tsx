import { View, Text, DimensionValue } from "react-native";
import React from "react";
import Box from "./Box";
import { SelectList } from "react-native-dropdown-select-list";
import { ChevronDown } from "lucide-react-native";
import { color, useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";

interface IProps {
  data: { value: string; label: string }[];
  onChange: (value: string) => void;
  height?: DimensionValue;
  placeholder?: string;
}

const CustomDropDown = ({
  data,
  onChange,
  height = 50,
  placeholder = "",
}: IProps) => {
  const theme = useTheme<Theme>();
  return (
    <Box width="100%" height={height}>
      <SelectList
        data={data}
        arrowicon={() => (
          <ChevronDown size={20} color={theme.colors.bodyTextColor} />
        )}
        setSelected={(value: string) => onChange(value)}
        save="value"
        search={false}
        placeholder={placeholder}
        boxStyles={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderWidth: 0,
          height: 50,
        }}
        inputStyles={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderWidth: 0,
          color: theme.colors.bodyTextColor,
        }}
        dropdownStyles={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderWidth: 0,
          zIndex: 10,
          minHeight: 150,
        }}
        dropdownTextStyles={{
          color: theme.colors.bodyTextColor,
        }}
      />
    </Box>
  );
};

export default CustomDropDown;

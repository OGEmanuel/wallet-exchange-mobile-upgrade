import { DimensionValue, TextInputProps } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import React from "react";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  height?: DimensionValue;
  width?: DimensionValue;
  textColor?: string;
}

export default function CustomTextareaWithoutForm(
  props: Props & TextInputProps
) {
  const { label, value, onChange, textColor } = props;
  const [focused, setFocused] = React.useState(false);
  const { height = 100, width = "100%" } = props;
  const theme = useTheme<Theme>();
  return (
    <Box width={"100%"}>
      <CustomText variant={"body"} marginBottom={"s"}>
        {label}
      </CustomText>
      <TextInput
        {...(props as any)}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        style={[
          {
            borderWidth: 1.5,
            borderRadius: 8,
            borderColor: focused
              ? theme.colors.primaryColor
              : theme.colors.borderColor,
            backgroundColor: theme.colors.secondaryBackgroundColor,
            height,
            width,
            paddingHorizontal: 20,
            paddingVertical: 15,
            fontFamily: "PlusJakartaSans_Medium",
            color: textColor ?? "white",
          },
          props.style,
        ]}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={props.keyboardType}
      />
    </Box>
  );
}

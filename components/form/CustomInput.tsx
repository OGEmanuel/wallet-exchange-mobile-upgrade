import {
  TextInputProps,
  TextInput,
  StyleSheet,
  Alert,
  ViewStyle,
} from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import React from "react";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomText from "@/components/general/CustomText";
import { Ionicons, Feather } from "@expo/vector-icons";
import Box from "../general/Box";

interface IProps {
  required?: boolean;
  name: string;
  placeholder: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  label?: string;
  showLabel?: boolean;
  removeSpecialCharater?: boolean;
  removeSpaces?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const CustomTextInput = (props: IProps & TextInputProps) => {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(true);
  const theme = useTheme<Theme>();

  // form context
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Box style={{ ...props.containerStyle }}>
      {props.showLabel ||
        (props.showLabel === undefined && (
          <Box flexDirection="row">
            <CustomText
              variant="body"
              fontSize={14}
              color="black"
              marginBottom="s"
            >
              {props.label || props.placeholder}
            </CustomText>
            {props.required && (
              <CustomText style={{ color: "red" }}>*</CustomText>
            )}
          </Box>
        ))}
      <Controller
        control={control}
        rules={{
          required: props.required || false,
        }}
        name={props.name}
        render={({ field: { onChange, value } }) => {
          const handleInputChange = (text: string) => {
            // Remove special characters using a regular expression
            const filteredText = text.replace(/[^\w\s]/gi, "");

            //remove all spaces
            const newText = props.removeSpaces
              ? filteredText.replace(/\s/g, "_")
              : filteredText;
            onChange(newText);
          };
          return (
            <Box
              style={[
                Style.parent,
                {
                  borderColor:
                    focused && !errors[props.name]
                      ? theme.colors.primaryColor
                      : errors[props.name]
                        ? theme.colors.error
                        : theme.colors.borderColor,
                },
              ]}
            >
              <Box
                style={{
                  flex: 1,
                  justifyContent: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                }}
              >
                {/* {focused && <Text variant='xs'>{props.placeholder || props.name}</Text>} */}
                {props.prefix && props.prefix}
                <TextInput
                  {...props}
                  placeholderTextColor={theme.colors.bodyTextColor}
                  cursorColor={theme.colors.bodyTextColor}
                  placeholder={!focused ? props.placeholder || props.name : ""}
                  value={value}
                  onChangeText={(e) => {
                    props.removeSpecialCharater
                      ? handleInputChange(e)
                      : onChange(e);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  secureTextEntry={props.isPassword ? showPassword : false}
                  style={{
                    color: theme.colors.bodyTextColor,
                    fontFamily: "PlusJakartaSans_Regular",
                  }}
                />
              </Box>
              
              {props.suffix && props.suffix}

              {props.isPassword && (
                <Feather
                  onPress={() => setShowPassword((prev) => !prev)}
                  name={showPassword ? "eye" : "eye-off"}
                  size={23}
                  color={theme.colors.bodyTextColor}
                />
              )}
            </Box>
          );
        }}
      />
      {errors[props.name] && (
        <CustomText
          variant="xs"
          fontSize={14}
          fontFamily={"GeoramaRegular"}
          style={{ color: "red" }}
        >
          {errors[props.name]?.message as any}
        </CustomText>
      )}
    </Box>
  );
};

const Style = StyleSheet.create({
  parent: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    fontFamily: "PlusJakartaSans_Regular",
  },
  textInput: {
    width: "100%",
    marginBottom: 10,
  },
});

// export CustomTextInput

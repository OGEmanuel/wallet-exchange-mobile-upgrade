import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Eye, EyeOff } from "lucide-react-native";
import React, { JSX, useEffect, useRef } from "react";
import { TextInputProps, ViewStyle } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isPassword?: boolean;
  iconRight?: JSX.Element;
  iconLeft?: JSX.Element;
  color?: string;
  noBorder?: boolean;
  boxStyle?: ViewStyle;
  borderOnFocus?: boolean;
  borderColorOnFocus?: string;
  // placeholderTextColor?: string;
}

export default function CustomInputWithoutForm(
  props: Props & Omit<TextInputProps, "onChange">
) {
  const { label, value, onChange, style, noBorder = true, autoFocus, ...rest } = props;
  const [focused, setFocused] = React.useState(false);
  const [borderOnFocus, setBorderOnFocus] = React.useState(
    props.borderOnFocus ?? true
  );
  const [showPassword, setShowPassword] = React.useState(() => {
    if (props.isPassword) {
      return false;
    } else {
      return true;
    }
  });
  const inputRef = useRef<TextInput>(null);

  const theme = useTheme<Theme>();

  // Handle autoFocus with a delay to prevent keyboard from popping up on app start
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Add a longer delay to ensure the component is fully visible and user is ready
      // This prevents the keyboard from popping up unexpectedly on app start
      // Only focus if the component is actually visible (not on initial app load)
      const focusTimer = setTimeout(() => {
        // Double-check that the input still exists and component is mounted
        if (inputRef.current) {
          inputRef.current?.focus();
        }
      }, 1000); // Increased delay to 1 second for bottom sheets
      
      return () => clearTimeout(focusTimer);
    }
  }, [autoFocus]);
  return (
    <Box width={"100%"}>
      {label && (
        <CustomText variant={"body"} marginBottom={"s"}>
          {label}
        </CustomText>
      )}
      <Box
        style={[
          {
            borderWidth: props.noBorder
              ? focused && borderOnFocus
                ? 1.5
                : 0
              : 0,
            borderRadius: 8,
            borderColor:
              focused && borderOnFocus
                ? props.borderColorOnFocus ?? theme.colors.primaryColor
                : theme.colors.borderColor,
            backgroundColor: theme.colors.secondaryBackgroundColor,
            height: 50,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          },
          props?.boxStyle,
        ]}
      >
        {props?.iconLeft && props.iconLeft}
        <TextInput
          ref={inputRef}
          {...(rest as any)}
          autoFocus={false}
          style={[
            {
              flex: 1,
              color: props.color ?? "white",
              fontSize: 14,
              textTransform: "none",
              fontFamily: "PlusJakartaSans_Regular",
            },
            style,
          ]}
          value={value}
          onChange={(e) => onChange(e.nativeEvent.text)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={props.keyboardType}
          secureTextEntry={showPassword ? false : true}
          autoCapitalize="none"
          placeholderTextColor={theme.colors.placeholderTextColor}
        />
        {props.iconRight && props.iconRight}
        {props.isPassword && (
          <>
            {showPassword ? (
              <EyeOff
                onPress={() => setShowPassword(false)}
                color={theme.colors.bodyTextColor}
              />
            ) : (
              <Eye
                onPress={() => setShowPassword(true)}
                color={theme.colors.bodyTextColor}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

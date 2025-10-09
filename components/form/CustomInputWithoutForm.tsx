import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Eye, EyeOff } from "lucide-react-native";
import React, { JSX } from "react";
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
  // placeholderTextColor?: string;
}

export default function CustomInputWithoutForm(
  props: Props & Omit<TextInputProps, "onChange">
) {
  const { label, value, onChange, style, noBorder = true, ...rest } = props;
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(() => {
    if (props.isPassword) {
      return false;
    } else {
      return true;
    }
  });

  const theme = useTheme<Theme>();
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
            borderWidth: !noBorder ? 1.5 : 0,
            borderRadius: 8,
            borderColor: focused
              ? theme.colors.primaryColor
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
          {...(rest as any)}
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

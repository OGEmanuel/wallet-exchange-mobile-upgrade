import icons from "@/assets/icons";
import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
}

const SwapWithdrawalInput: React.FC<Props> = ({
  value,
  onChangeText,
  error,
  disabled = false,
}) => {
  const theme = useTheme<Theme>();

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      onChangeText(text);
    }
  };

  return (
    <Box mt="m">
      <CustomText variant="body" fontSize={12} color="bodyTextColor" mb="s">
        Withdrawal Address (Required for crypto)
      </CustomText>
      <Box
        backgroundColor="modalBackgroundColor"
        borderRadius={8}
        p="s"
        height={48}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        borderWidth={error ? 1 : 0}
        borderColor={error ? "error" : "borderColor"}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter wallet address"
          placeholderTextColor={theme.colors.placeholderTextColor}
          editable={!disabled}
          style={[
            styles.input,
            {
              color: theme.colors.bodyTextColor,
              fontFamily: "PlusJakartaSans_Regular",
            },
          ]}
        />
        <TouchableOpacity
          onPress={handlePaste}
          style={[
            styles.pasteButton,
            { borderColor: theme.colors.borderColor },
          ]}
        >
          <Image
            source={icons.copy}
            tintColor={theme.colors.bodyTextColor}
            style={styles.pasteIcon}
          />
        </TouchableOpacity>
      </Box>
      {error && (
        <CustomText variant="body" fontSize={12} color="error" mt="s">
          {error}
        </CustomText>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  pasteButton: {
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  pasteIcon: {
    width: 12,
    height: 12,
  },
});

export default SwapWithdrawalInput;


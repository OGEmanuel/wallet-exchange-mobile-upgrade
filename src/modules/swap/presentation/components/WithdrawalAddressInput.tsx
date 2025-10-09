import icons from "@/assets/icons";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
}

const WithdrawalAddressInput: React.FC<Props> = ({
  value,
  onChangeText,
  error,
  disabled = false,
}) => {
  const theme = useTheme<Theme>();

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      onChangeText(text);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.bodyTextColor },
        ]}
      >
        Withdrawal Address
      </Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surfaceContainer },
          error && { borderColor: theme.colors.error, borderWidth: 1 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter withdrawal address"
          placeholderTextColor={theme.colors.placeholderTextColor}
          style={[
            styles.input,
            { color: theme.colors.bodyTextColor },
          ]}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={handlePaste}
          style={[
            styles.pasteButton,
            { borderColor: theme.colors.borderColor },
          ]}
          disabled={disabled}
        >
          <Image
            source={icons.copy}
            tintColor={theme.colors.bodyTextColor}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text
          style={[
            styles.errorText,
            { color: theme.colors.error },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "PlusJakartaSans_Regular",
  },
  inputContainer: {
    borderRadius: 8,
    padding: 8,
    height: 48,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  pasteButton: {
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  icon: {
    width: 12,
    height: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_Regular",
  },
});

export default WithdrawalAddressInput;


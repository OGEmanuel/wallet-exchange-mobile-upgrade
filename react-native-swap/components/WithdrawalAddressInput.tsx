import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Clipboard,
  Alert,
} from 'react-native';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        onChangeText(text);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isDark && styles.inputContainerDark,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Receiving Address"
          placeholderTextColor={isDark ? '#6D7076' : '#A7A7AF'}
          editable={!disabled}
          style={[
            styles.input,
            isDark && styles.inputDark,
            disabled && styles.inputDisabled,
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={handlePaste}
          style={[styles.pasteButton, isDark && styles.pasteButtonDark]}
          disabled={disabled}
        >
          <Text style={styles.pasteIcon}>📋</Text>
        </TouchableOpacity>
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerDark: {
    backgroundColor: '#2F333D',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 12,
  },
  inputDark: {
    color: '#fff',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  pasteButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  pasteButtonDark: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
  },
  pasteIcon: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
});

export default WithdrawalAddressInput;


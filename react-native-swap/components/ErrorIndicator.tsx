import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';

interface Props {
  error?: string | null;
  retry?: () => void;
  retryText?: string;
  isBackgroundRefresh?: boolean;
}

const ErrorIndicator: React.FC<Props> = ({
  error,
  retry,
  retryText = 'Retry',
  isBackgroundRefresh = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!error) return null;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          {error}
        </Text>
      </View>
      {retry && (
        <TouchableOpacity
          onPress={retry}
          style={[styles.retryButton, isDark && styles.retryButtonDark]}
          disabled={isBackgroundRefresh}
        >
          {isBackgroundRefresh ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.retryText}>{retryText}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#7F1D1D',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
  },
  errorTextDark: {
    color: '#FEE2E2',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  retryButtonDark: {
    backgroundColor: '#B91C1C',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorIndicator;


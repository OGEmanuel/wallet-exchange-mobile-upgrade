import React from 'react';
import { Text, View } from 'react-native';

// Re-export the original content
export * from './http-error-handler';

// Default export for Expo Router
export default function HttpErrorHandlerWrapper() {
  return (
    <View>
      <Text>HttpErrorHandler - Utility Component</Text>
    </View>
  );
} 
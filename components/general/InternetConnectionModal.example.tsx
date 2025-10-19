// Example usage of InternetConnectionModal
import React from 'react';
import { View } from 'react-native';
import InternetConnectionModal from './InternetConnectionModal';

// Or use the context hook:
import { useInternetConnection } from '@/hooks/useInternetConnection';

export function InternetConnectionModalExample() {
  const [showModal, setShowModal] = React.useState(false);

  const handleRetry = () => {
    console.log('Retrying connection...');
    // Add your retry logic here
    setShowModal(false);
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      
      <InternetConnectionModal
        visible={showModal}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

export function InternetConnectionExample() {
  const { isConnected, showModal, setShowModal, retryConnection } = useInternetConnection();

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      {/* The modal will automatically show/hide based on internet connection */}
    </View>
  );
}

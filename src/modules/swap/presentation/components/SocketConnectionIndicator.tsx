import { CustomText } from '@/components/general';
import { ENVIRONMENTS } from '@/configs/environments';
import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
import { ExchangeSocketLibrary } from '@zap/blockchain-sdk';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';


function ExchangeSocketConnectionIndicator() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const socketLib = new ExchangeSocketLibrary();
  const baseURL = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://test-backend-2.zap.africa";

  const sdk = zapSDKService.getSDK();


  useEffect(() => {
    // Listen to statusUpdate event
    const handleStatusUpdate = (data: any) => {
      console.log('Status update:', data);
      setStatusUpdates((prev: any[]) => [...prev, data]);
    };

    const handleConnected = () => {
      console.log('Connected From Socket Connection Indicator');
      setStatus('Connected');
    };

    const handleDisconnected = () => {
      console.log('Disconnected From Socket Connection Indicator');
      setStatus('Disconnected');
    };

    const setupSocket: () => Promise<void> = async () => {
      const tokens = await sdk.exchangeAuth.getTokens();

      // Connect to socket
      socketLib.connect(baseURL, tokens?.token);

      socketLib.on('statusUpdate', handleStatusUpdate);
      socketLib.on('orderStatus', handleStatusUpdate);
      socketLib.on('connected', handleConnected);
      socketLib.on('disconnected', handleDisconnected);
    };

    setupSocket();

    // Cleanup
    return () => {
      socketLib.off('statusUpdate', handleStatusUpdate);
      socketLib.off('orderStatus', handleStatusUpdate);
      socketLib.off('connected', handleConnected);
      socketLib.off('disconnected', handleDisconnected);
      socketLib.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <CustomText>Socket Status: {status}</CustomText>
      <CustomText>Updates:</CustomText>
      {statusUpdates.map((update: any, index: number) => (
        <CustomText key={index}>{JSON.stringify(update)}</CustomText>
      ))}
    </View>  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default ExchangeSocketConnectionIndicator;
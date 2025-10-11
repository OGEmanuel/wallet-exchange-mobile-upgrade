/**
 * Zap SDK Configuration
 * 
 * Centralized configuration for the Zap Blockchain SDK
 */

import { ZapSDK } from '@zap/blockchain-sdk';
import Constants from 'expo-constants';

export interface SDKConfig {
  baseURL: string;
  environment: 'production' | 'staging' | 'local';
  platform: 'react-native';
  enableLogging: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export const getSDKConfig = (): SDKConfig => {
  const isDev = __DEV__;
  let isLocal = Constants.expoConfig?.extra?.environment === 'local';

  console.log(isDev, isLocal, "----------------isDev and isLocal----------------");
  
  if (isLocal) {
    return {
      baseURL: 'http://localhost:3005',
      environment: 'local',
      platform: 'react-native',
      enableLogging: true,
      timeout: 30000,
      retryAttempts: 3,
    };
  }
  
  if (isDev) {
    return {
      baseURL: 'https://test-backend-2.zap.africa',
      environment: 'staging',
      platform: 'react-native',
      enableLogging: true,
      timeout: 30000,
      retryAttempts: 3,
    };
  }
  
  return {
    baseURL: 'https://test-backend-2.zap.africa',
    environment: 'production',
    platform: 'react-native',
    enableLogging: false,
    timeout: 30000,
    retryAttempts: 3,
  };
};

export const createSDKInstance = (): ZapSDK => {
  const config = getSDKConfig();
  return new ZapSDK(config);
};

export default getSDKConfig;

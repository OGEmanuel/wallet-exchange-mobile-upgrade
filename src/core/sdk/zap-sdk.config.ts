/**
 * Zap SDK Configuration
 * 
 * Centralized configuration for the Zap Blockchain SDK
 */

import { ZapSDK } from '@zap/blockchain-sdk';

export interface SDKConfig {
  baseURL: string;
  environment: 'production' | 'staging' | 'local';
  platform: 'react-native';
  enableLogging: boolean;
  timeout?: number;
  retryAttempts?: number;
}

const stagingBaseURL = 'https://zap-server-v2-bz6g.onrender.com';
const productionBaseURL = 'https://api.zap.africa';
const developmentBaseURL = 'https://test-backend-2.zap.africa';
const localBaseURL = 'http://localhost:3005';

export const getSDKConfig = (): SDKConfig => {
  const isDev = __DEV__;
  // let isLocal = Constants.expoConfig?.extra?.environment === 'local';
  let isLocal = false;
  
  if (isLocal) {
    return {
      baseURL: localBaseURL,
      environment: 'local',
      platform: 'react-native',
      enableLogging: true,
      timeout: 30000,
      retryAttempts: 3,
    };
  }
  
  if (isDev) {
    return {
      baseURL: developmentBaseURL,
      environment: 'local',
      platform: 'react-native',
      enableLogging: true,
      timeout: 30000,
      retryAttempts: 3,
    };
  }
  
  return {
    baseURL: stagingBaseURL,
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

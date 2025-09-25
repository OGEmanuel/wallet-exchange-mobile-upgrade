// // utils/network.utils.ts
// import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// export const checkNetworkConnection = async (): Promise<boolean> => {
//   try {
//     const netInfoState = await NetInfo.fetch();
//     return netInfoState.isConnected ?? false;
//   } catch (error) {
//     console.error('Network check error:', error);
//     return false;
//   }
// };

// export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
//   return NetInfo.addEventListener((state: NetInfoState) => {
//     callback(state.isConnected ?? false);
//   });
// };

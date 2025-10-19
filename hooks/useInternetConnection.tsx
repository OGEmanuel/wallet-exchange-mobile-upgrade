import { useInternetConnection as useInternetConnectionContext } from '@/context/InternetConnectionContext';

export function useInternetConnection() {
  return useInternetConnectionContext();
}

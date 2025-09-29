import { createContext, useContext } from 'react';
import { BottomSheetContextType } from './types';

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheetContext must be used within a BottomSheetProvider');
  }
  return context;
};

export { BottomSheetContext };

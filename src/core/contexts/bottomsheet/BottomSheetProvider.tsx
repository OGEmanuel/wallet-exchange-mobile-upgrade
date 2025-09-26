import React, { useCallback, useMemo, useState } from 'react';
import { BottomSheetContext } from './BottomSheetContext';
import { BottomSheetContextType, BottomSheetItem } from './types';

interface BottomSheetProviderProps {
  children: React.ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({ children }) => {
  const [bottomSheets, setBottomSheets] = useState<BottomSheetItem[]>([]);

  const openBottomSheet = useCallback((item: Omit<BottomSheetItem, 'id'>): string => {
    const id = `bottomsheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBottomSheet: BottomSheetItem = {
      ...item,
      id,
    };
    
    setBottomSheets(prev => [...prev, newBottomSheet]);
    return id;
  }, []);

  const closeBottomSheet = useCallback((id: string) => {
    setBottomSheets(prev => {
      const item = prev.find(sheet => sheet.id === id);
      if (item?.onClose) {
        item.onClose();
      }
      return prev.filter(sheet => sheet.id !== id);
    });
  }, []);

  const closeAllBottomSheets = useCallback(() => {
    setBottomSheets(prev => {
      prev.forEach(sheet => {
        if (sheet.onClose) {
          sheet.onClose();
        }
      });
      return [];
    });
  }, []);

  const getBottomSheets = useCallback(() => bottomSheets, [bottomSheets]);

  const contextValue: BottomSheetContextType = useMemo(() => ({
    openBottomSheet,
    closeBottomSheet,
    closeAllBottomSheets,
    getBottomSheets,
  }), [openBottomSheet, closeBottomSheet, closeAllBottomSheets, getBottomSheets]);

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}
    </BottomSheetContext.Provider>
  );
};

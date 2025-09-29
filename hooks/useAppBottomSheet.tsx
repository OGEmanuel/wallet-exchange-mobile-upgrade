import { useBottomSheetContext } from '@/src/core/contexts/bottomsheet';
import { BottomSheetItem } from '@/src/core/contexts/bottomsheet/types';
import { useCallback } from 'react';

export const useAppBottomSheet = () => {
  const { openBottomSheet, closeBottomSheet, closeAllBottomSheets, getBottomSheets } = useBottomSheetContext();

  const showBottomSheet = useCallback((item: Omit<BottomSheetItem, 'id'>) => {
    return openBottomSheet(item);
  }, [openBottomSheet]);

  const hideBottomSheet = useCallback((id: string) => {
    closeBottomSheet(id);
  }, [closeBottomSheet]);

  const hideAllBottomSheets = useCallback(() => {
    closeAllBottomSheets();
  }, [closeAllBottomSheets]);

  const getActiveBottomSheets = useCallback(() => {
    return getBottomSheets();
  }, [getBottomSheets]);

  return {
    showBottomSheet,
    hideBottomSheet,
    hideAllBottomSheets,
    getActiveBottomSheets,
  };
};

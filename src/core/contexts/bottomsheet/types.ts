import { ReactNode } from 'react';

export interface BottomSheetItem {
  id: string;
  component: ReactNode;
  props?: {
    snapPoints?: string[];
    enablePanDownToClose?: boolean;
    showGradientHandle?: boolean;
    gradientColors?: string[];
    backgroundColor?: string;
    title?: string;
    subtitle?: string;
  };
  onClose?: () => void;
}

export interface BottomSheetContextType {
  openBottomSheet: (item: Omit<BottomSheetItem, 'id'>) => string;
  closeBottomSheet: (id: string) => void;
  closeAllBottomSheets: () => void;
  getBottomSheets: () => BottomSheetItem[];
}

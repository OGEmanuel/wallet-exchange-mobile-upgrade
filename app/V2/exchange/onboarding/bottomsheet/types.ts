import { ReactNode } from "react";

export interface AppBottomSheetOptions {
  isDismissible?: boolean;
  showCloseButton?: boolean;
  snapPoints?: string[];
  onOpened?: () => void;
  onClosed?: () => void;
}

export interface AppBottomSheetItem {
  id: number;
  content: ReactNode;
  options?: AppBottomSheetOptions;
}

export interface AppBottomSheetContextType {
  openBottomSheet: (content: ReactNode, options?: AppBottomSheetOptions) => number;
  closeBottomSheet: (id?: number) => void;
  setBottomSheetContent: (content: ReactNode, id?: number) => void;
  closeAllBottomSheets: () => void;
  getBottomSheets: () => AppBottomSheetItem[];
  isOpen: boolean;
}


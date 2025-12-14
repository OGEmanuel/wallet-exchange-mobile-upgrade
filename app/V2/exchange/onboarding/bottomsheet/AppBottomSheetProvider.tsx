import React, { useCallback, useMemo, useState } from "react";
import { AppBottomSheetContext } from "./AppBottomSheetContext";
import {
  AppBottomSheetContextType,
  AppBottomSheetItem,
  AppBottomSheetOptions,
} from "./types";

interface AppBottomSheetProviderProps {
  children: React.ReactNode;
}

export const AppBottomSheetProvider: React.FC<AppBottomSheetProviderProps> = ({ children }) => {
  const [bottomSheets, setBottomSheets] = useState<AppBottomSheetItem[]>([]);

  const openBottomSheet = useCallback(
    (content: React.ReactNode, options?: AppBottomSheetOptions): number => {
      const id = Date.now() + Math.random();
      const newBottomSheet: AppBottomSheetItem = {
        id,
        content,
        options,
      };

      setBottomSheets((prev) => [...prev, newBottomSheet]);

      // Call onOpened callback if provided
      if (options?.onOpened) {
        setTimeout(() => {
          options.onOpened?.();
        }, 100);
      }

      return id;
    },
    []
  );

  const closeBottomSheet = useCallback((id?: number) => {
    setBottomSheets((prev) => {
      const sheetToClose = id
        ? prev.find((sheet) => sheet.id === id)
        : prev[prev.length - 1]; // Close topmost if no id provided

      if (sheetToClose?.options?.onClosed) {
        sheetToClose.options.onClosed();
      }

      return id ? prev.filter((sheet) => sheet.id !== id) : prev.slice(0, -1);
    });
  }, []);

  const setBottomSheetContent = useCallback(
    (content: React.ReactNode, id?: number) => {
      setBottomSheets((prev) => {
        if (id) {
          return prev.map((sheet) =>
            sheet.id === id ? { ...sheet, content } : sheet
          );
        }
        // Update topmost sheet if no id provided
        if (prev.length > 0) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content,
          };
          return updated;
        }
        return prev;
      });
    },
    []
  );

  const closeAllBottomSheets = useCallback(() => {
    setBottomSheets((prev) => {
      prev.forEach((sheet) => {
        if (sheet.options?.onClosed) {
          sheet.options.onClosed();
        }
      });
      return [];
    });
  }, []);

  const isOpen = bottomSheets.length > 0;

  const getBottomSheets = useCallback(() => bottomSheets, [bottomSheets]);

  const contextValue: AppBottomSheetContextType = useMemo(
    () => ({
      openBottomSheet,
      closeBottomSheet,
      setBottomSheetContent,
      closeAllBottomSheets,
      getBottomSheets,
      isOpen,
    }),
    [openBottomSheet, closeBottomSheet, setBottomSheetContent, closeAllBottomSheets, getBottomSheets, isOpen]
  );

  return (
    <AppBottomSheetContext.Provider value={contextValue}>
      {children}
    </AppBottomSheetContext.Provider>
  );
};


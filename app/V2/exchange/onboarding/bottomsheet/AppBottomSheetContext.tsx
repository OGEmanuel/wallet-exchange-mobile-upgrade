import { createContext, useContext } from "react";
import { AppBottomSheetContextType } from "./types";

const AppBottomSheetContext = createContext<AppBottomSheetContextType | undefined>(undefined);

export const useAppBottomSheetContext = () => {
  const context = useContext(AppBottomSheetContext);
  if (!context) {
    throw new Error("useAppBottomSheetContext must be used within an AppBottomSheetProvider");
  }
  return context;
};

export { AppBottomSheetContext };


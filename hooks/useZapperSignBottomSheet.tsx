import ZapperSignContent from "@/components/onboarding/ZapperSignContent";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useCallback } from "react";

export interface UseZapperSignBottomSheetOptions {
  onContinue?: () => void;
  onClose?: () => void;
}

export const useZapperSignBottomSheet = () => {
  const { showBottomSheet } = useAppBottomSheet();
  const { colors } = useTheme<Theme>();

  const showZapperSignBottomSheet = useCallback(
    (options?: UseZapperSignBottomSheetOptions) => {
      return showBottomSheet({
        component: (
          <ZapperSignContent
            onContinue={() => {
              options?.onContinue?.();
            }}
            onClose={() => {
              options?.onClose?.();
            }}
          />
        ),
        props: {
          snapPoints: ["90%"],
          enablePanDownToClose: true,
          showGradientHandle: true,
          gradientColors: [
            colors.primaryColor,
            colors.mainBackgroundColor,
            colors.mainBackgroundColor,
          ],
        },
        onClose: options?.onClose,
      });
    },
    [showBottomSheet, colors]
  );

  return {
    showZapperSignBottomSheet,
  };
};


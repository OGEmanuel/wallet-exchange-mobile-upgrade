import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import Box from "../general/Box";
import TokenSelector from "./TokenSelector";

interface TokenSelectorBottomSheetProps {
  mode: "send" | "receive" | "swap";
  onTokenSelect?: (token: ProcessedAsset | any) => void;
  onClose?: () => void;
}

const TokenSelectorBottomSheet = forwardRef<
  BottomSheet,
  TokenSelectorBottomSheetProps
>(({ mode, onTokenSelect, onClose }, ref) => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  const handleTokenSelect = useCallback(
    (token: ProcessedAsset | any) => {
      if (onTokenSelect) {
        onTokenSelect(token);
      }

      // Handle based on mode
      if (mode === "send" || mode === "swap") {
        // For send/swap mode, just call onTokenSelect - parent will handle closing
        (ref as React.RefObject<BottomSheet>).current?.close();
      } else {
        // For receive, switch to QR code stage within the same bottom sheet
        dispatch(setStage("qrcode"));
      }
    },
    [mode, onTokenSelect, dispatch, ref]
  );

  const handleModalClose = useCallback(() => {
    // Reset stage when modal closes
    dispatch(setStage("token"));
    // Call the onClose prop if provided
    if (onClose) {
      onClose();
    }
  }, [dispatch, onClose]);

  // Handle when bottom sheet opens - ensure it's properly reset
  const handleSheetOpen = useCallback(() => {
    // Reset stage when sheet opens to ensure clean state
    dispatch(setStage("token"));
  }, [dispatch]);

  // Reset stage to token when component mounts
  useEffect(() => {
    dispatch(setStage("token"));
  }, [dispatch]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%", "80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={handleModalClose}
      onChange={(index) => {
        if (index >= 0) {
          handleSheetOpen();
        }
      }}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      enableOverDrag={false}
      enableHandlePanningGesture={true}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 30,
          paddingBottom: 100, // Add bottom padding for tab bar
        }}
      >
        <TokenSelector
          mode={mode}
          onTokenSelect={handleTokenSelect}
          shouldAutoOpenChainSelector={false}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

TokenSelectorBottomSheet.displayName = "TokenSelectorBottomSheet";

export default TokenSelectorBottomSheet;

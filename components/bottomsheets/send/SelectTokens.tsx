import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { selectStage, setStage } from "@/state/reducers/sendPage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { forwardRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "../../general/Box";
import Addresses from "./Addresses";
import Chains from "./Chains";
import Tokens from "./Tokens";

const SelectTokenBottomSheet = forwardRef<BottomSheet, object>((props, ref) => {
  const stage = useSelector(selectStage);
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();
  
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

  const handleTokenSelect = useCallback((token: ProcessedAsset) => {
    // Close the bottom sheet and navigate to send screen with selected token
    (ref as any)?.current?.close();
    router.push(`/dashboard/home/send-token?tokenId=${token.id}`);
  }, [ref]);

  const handleModalClose = useCallback(() => {
    // Reset stage to token when modal closes
    dispatch(setStage("token"));
  }, [dispatch]);

  // Reset stage to token when component mounts
  useEffect(() => {
    dispatch(setStage("token"));
  }, [dispatch]);

  const renderComponent = React.useCallback(() => {
    switch (stage) {
      case "token":
        return <Tokens onTokenSelect={handleTokenSelect} />;
      case "chains":
        return <Chains />;
      case "addresses":
        return <Addresses />;
    }
  }, [stage, handleTokenSelect]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%", "90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={handleModalClose}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
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
        }}
      >
        {renderComponent()}
      </BottomSheetView>
    </BottomSheet>
  );
});

SelectTokenBottomSheet.displayName = 'SelectTokenBottomSheet';

export default SelectTokenBottomSheet;

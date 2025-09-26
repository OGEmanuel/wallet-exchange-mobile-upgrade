import { selectStage } from "@/state/reducers/sendPage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Box from "../../general/Box";
import Addresses from "./Addresses";
import Chains from "./Chains";
import Tokens from "./Tokens";

const SelectTokenBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const stage = useSelector(selectStage);
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

  const renderComponent = React.useCallback(() => {
    switch (stage) {
      case "token":
        return <Tokens />;
      case "chains":
        return <Chains />;
      case "addresses":
        return <Addresses />;
    }
  }, [stage]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%", "90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
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

export default SelectTokenBottomSheet;

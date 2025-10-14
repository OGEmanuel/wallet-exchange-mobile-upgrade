import { selectBuyStage } from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Box from "../../general/Box";
import Buy from "./Buy";
import BuyWith from "./BuyWith";
import Chains from "./Chains";
import Confirmed from "./Confirmed";
import Confirming from "./Confirming";
import Tokens from "./Tokens";
import TransferDetails from "./transferDetails";

const SelectBuyTokens = forwardRef<BottomSheet, {}>((props, ref) => {
  const stage = useSelector(selectBuyStage);
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
      case "crypto_select":
        return <Tokens />;
      case "currency_select":
        return <BuyWith />;
      case "transfer_details":
        return <TransferDetails />;
      case "buy":
        return <Buy />;
      case "confirming":
        return <Confirming />;
      case "confirmed":
        return <Confirmed />;
      case "chains":
        return <Chains />;
    }
  }, [stage]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["100%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      enableOverDrag={false}
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
          paddingHorizontal: 0,
          paddingTop: 30,
        }}
      >
        {renderComponent()}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default SelectBuyTokens;

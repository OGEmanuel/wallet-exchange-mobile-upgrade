import { setSellStage, setSellToken } from "@/src/modules/sell/presentation/state/sell-slice";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { useDispatch } from "react-redux";
import TokenSelector from "../../TokenSelector";

const SelectTokenStep = () => {
  const dispatch = useDispatch();

  const handleTokenSelect = (token: any) => {
    dispatch(setSellToken(token));
    dispatch(setSellStage("select-currency"));
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <TokenSelector
        mode="sell" // Use "sell" mode to get supported currencies and show correct title
        onTokenSelect={handleTokenSelect}
      />
    </BottomSheetView>
  );
};

export default SelectTokenStep;

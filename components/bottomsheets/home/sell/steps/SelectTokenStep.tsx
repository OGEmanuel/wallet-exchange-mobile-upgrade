import { SellFlowProps } from "@/types/sell.types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import Tokens from "../Tokens";

const SelectTokenStep: React.FC<SellFlowProps> = ({
  onNext,
  setSelectedToken,
}) => {
  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <Tokens
        onTokenSelect={(token: any) => {
          setSelectedToken(token);
          onNext("select-currency");
        }}
      />
    </BottomSheetView>
  );
};

export default SelectTokenStep;

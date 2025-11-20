import { setBuyStage, setBuyToken } from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { useDispatch } from "react-redux";
import TokenSelector from "../../TokenSelector";

interface SelectTokenStepProps {
  chainBottomSheetRef?: React.RefObject<BottomSheetMethods | null>;
  onChainSelectCallbackRef?: React.MutableRefObject<((chainSymbol: string) => void) | null>;
  shouldAutoOpenChainSelector?: boolean;
}

const SelectTokenStep: React.FC<SelectTokenStepProps> = ({ chainBottomSheetRef, onChainSelectCallbackRef, shouldAutoOpenChainSelector = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();

  const handleTokenSelect = (token: any) => {
    dispatch(setBuyToken(token));
    dispatch(setBuyStage("currency_select"));
  };

  return (
    <BottomSheetView
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.mainBackgroundColor,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
      }}
    >
      <TokenSelector
        mode="buy"
        onTokenSelect={handleTokenSelect}
        chainBottomSheetRef={chainBottomSheetRef}
        onChainSelectCallbackRef={onChainSelectCallbackRef}
        shouldAutoOpenChainSelector={shouldAutoOpenChainSelector}
      />
    </BottomSheetView>
  );
};

export default SelectTokenStep;


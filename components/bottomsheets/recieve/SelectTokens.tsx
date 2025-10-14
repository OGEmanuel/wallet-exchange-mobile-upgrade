import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { useChains } from "@/src/core/chains/chains-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { selectStage, setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "../../general/Box";
import ImportTokenModal from "../../Modals/ImportTokenModal";
import ReceiveQRCode from "./ReceiveQRCode";
import ReceiveTokens from "./ReceiveTokens";
import ShowQRcode from "./ShowQRcode";

const SelectUserTokens = forwardRef<BottomSheet, object>((props, ref) => {
  const stage = useSelector(selectStage);
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const [selectedToken, setSelectedToken] = useState<ProcessedAsset | null>(null);
  const { mainUserWalletGroup } = useWallet();
  const { walletChains } = useChains();
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

  const handleTokenSelect = (token: ProcessedAsset) => {
    setSelectedToken(token);
    // Navigate to QR code stage
    // This would need to be handled by the reducer
  };

  const handleBack = useCallback(() => {
    setSelectedToken(null);
    dispatch(setStage("token"));
  }, [dispatch]);

  // Reset state when modal closes
  const handleModalClose = useCallback(() => {
    setSelectedToken(null);
    dispatch(setStage("token"));
  }, [dispatch]);

  const handleImportToken = useCallback((tokenData: {
    chain: string;
    contractAddress: string;
    symbol: string;
    decimals: string;
    tokenAddress: string;
  }) => {
    console.log("Import token data:", tokenData);
    // Handle token import success
    dispatch(setStage("token"));
  }, [dispatch]);

  const renderComponent = React.useCallback(() => {
    switch (stage) {
      case "token":
        return <ReceiveTokens onTokenSelect={handleTokenSelect} />;
      case "qrcode":
        return selectedToken ? (
          <ReceiveQRCode selectedToken={selectedToken} onBack={handleBack} />
        ) : (
          <ShowQRcode />
        );
      case "import":
        return (
          <ImportTokenModal 
            visible={true} 
            onClose={() => dispatch(setStage("token"))}
            onImportToken={handleImportToken}
            allChains={walletChains}
            mainUserWalletGroup={mainUserWalletGroup}
          />
        );
    }
  }, [stage, selectedToken, handleBack, dispatch, handleImportToken, mainUserWalletGroup, walletChains]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      enableOverDrag={false}
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
          paddingBottom: 100, // Add bottom padding for tab bar
        }}
      >
        {renderComponent()}
      </BottomSheetView>
    </BottomSheet>
  );
});

SelectUserTokens.displayName = 'SelectUserTokens';

export default SelectUserTokens;

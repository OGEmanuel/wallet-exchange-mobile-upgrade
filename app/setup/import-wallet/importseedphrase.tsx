import React from "react";
import Box from "@/components/general/Box";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  setCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import RecoveryPhrasePage from "@/views/importwallet/importseedphrasepages/recoveryphrasepage";
import CreatePasswordPage from "@/views/importwallet/importseedphrasepages/createpasswordpage";
import PasscodePage from "@/views/importwallet/importseedphrasepages/passcodepage";
import NameYourWallet from "@/views/general/NameYourWallet";
import WalletImportSuccessful from "@/components/Modals/WalletImportSuccessfulModal";
import Success from "@/views/importwallet/importseedphrasepages/success";

const ImportSeedPhrase = () => {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const currentStep = useSelector(selectCurrentPage);
  const dispatch = useDispatch();

  const renderPage = React.useCallback(() => {
    console.log("currentStep", currentStep);
    switch (currentStep) {
      case 1: {
        return <RecoveryPhrasePage />;
      }
      case 2: {
        return (
          // GET THE WALLET NAME FROM THE REDUX STORE
          <NameYourWallet
            onBackPress={() => dispatch(setCurrentPage(1))}
            title="Choose a nice name for your wallet"
            onContinuePress={() => {
              dispatch(setCurrentPage(3));
            }}
          />
        );
      }
      case 3: {
        return (
          <Success
            onContinue={() => {
              dispatch(setCurrentPage(4));
            }}
          />
        );
      }
      case 4: {
        return <PasscodePage />;
      }
      case 5: {
        return <CreatePasswordPage />;
      }
      default: {
        return <RecoveryPhrasePage />;
      }
    }
  }, [currentStep]);

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor" pt="2xl">
      <WalletImportSuccessful
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => dispatch(setCurrentPage(3))}
      />
      {renderPage()}
    </Box>
  );
};

export default ImportSeedPhrase;

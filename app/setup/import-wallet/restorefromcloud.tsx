import { View, Text } from "react-native";
import React from "react";
import Box from "@/components/general/Box";
import { useDispatch, useSelector } from "react-redux";
import {
  resetCurrentPage,
  selectCurrentPage,
  setCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import RestorePassword from "@/views/importwallet/backuprestore/restorePassword";
import Backup from "@/views/importwallet/backuprestore/backup";
import NameYourWallet from "@/views/general/NameYourWallet";
import { router } from "expo-router";
import WalletImportSuccessful from "@/components/Modals/WalletImportSuccessfulModal";
import Success from "@/views/importwallet/backuprestore/success";

const RestoreFromCloud = () => {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();

  const handlePage = () => {
    switch (currentPage) {
      case 1:
        return <Backup />;
      case 2:
        return <RestorePassword />;
      case 3:
        return (
          // GET THE WALLET NAME FROM THE REDUX STORE
          <Box pt="xl" flex={1}>
            <NameYourWallet
              onBackPress={() => dispatch(setCurrentPage(2))}
              title="Choose a nice name for your wallet"
              onContinuePress={() => {
                dispatch(setCurrentPage(4));
              }}
            />
          </Box>
        );
      case 4:
        return (
          <Success
            onContinue={() => {
              router.push("/dashboard/home/wallet-home");
              dispatch(resetCurrentPage());
            }}
          />
        );
    }
  };
  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      {handlePage()}
    </Box>
  );
};

export default RestoreFromCloud;

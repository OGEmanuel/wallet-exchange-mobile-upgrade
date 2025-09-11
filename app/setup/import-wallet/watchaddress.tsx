import React from "react";
import Box from "@/components/general/Box";
import { useDispatch, useSelector } from "react-redux";
import {
  resetCurrentPage,
  selectCurrentPage,
  setCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import WatchWallet from "@/views/importwallet/watchWallet/WatchWallet";
import NameYourWallet from "@/views/general/NameYourWallet";
import { router } from "expo-router";
import Success from "@/views/importwallet/watchWallet/success";

const WatchAddress = () => {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const currentStep = useSelector(selectCurrentPage);
  const dispatch = useDispatch();

  const handlePage = () => {
    switch (currentStep) {
      case 1: {
        return <WatchWallet />;
      }
      case 2: {
        return (
          // GET THE WALLET NAME FROM THE REDUX STORE
          <NameYourWallet
            onBackPress={() => {
              dispatch(setCurrentPage(1));
            }}
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
              router.push("/dashboard/home/wallet-home");
              dispatch(resetCurrentPage());
            }}
          />
        );
      }
      default: {
        return <WatchWallet />;
      }
    }
  };
  return (
    <Box flex={1} backgroundColor="mainBackgroundColor" pt="l">
      {handlePage()}
    </Box>
  );
};

export default WatchAddress;

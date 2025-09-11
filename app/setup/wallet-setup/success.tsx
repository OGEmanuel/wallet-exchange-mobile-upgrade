import React from "react";
import WalletImportSuccessfullyPage from "@/components/general/WalletImportedSuccessfully";
import { router } from "expo-router";

const success = () => {
  const onContinue = () => {
    router.push("/dashboard/home/wallet-home/home");
  };
  return <WalletImportSuccessfullyPage onContinue={onContinue} />;
};

export default success;

import React from "react";
import WalletImportSuccessfullyPage from "@/components/general/WalletImportedSuccessfully";

const success = ({ onContinue }: { onContinue: () => void }) => {
  return <WalletImportSuccessfullyPage onContinue={onContinue} />;
};

export default success;

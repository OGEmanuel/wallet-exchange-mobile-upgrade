// components/wallet/WalletEmptyScreen.tsx

import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import ImportWalletModal from "../Modals/ImportWalletModal";

const WalletEmptyScreen = () => {
  const theme = useTheme<Theme>();
  const [showImportWalletModal, setShowImportWalletModal] = useState(false);
  const navigateToWalletCreate = () => {
    router.push("/setup");
  };

  const navigateToWalletImport = () => {
    setShowImportWalletModal(true);
  };

  return (
    <PageWrapper>
      <ImportWalletModal
        isOpen={showImportWalletModal}
        onClose={() => setShowImportWalletModal(false)}
      />
      <Text>Wallet Empty</Text>
    </PageWrapper>
  );
};

export default WalletEmptyScreen;

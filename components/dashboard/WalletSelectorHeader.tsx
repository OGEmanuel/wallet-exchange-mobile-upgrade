import WalletSelectorBottomSheet from "@/components/bottomsheets/WalletSelectorBottomSheet";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { IUserWalletGroup } from "@/types/main";
import { IWalletGroup } from "@zap/blockchain-sdk";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable } from "react-native";
import Identicon from "../general/Identicon";

interface WalletSelectorHeaderProps {
  currentUserWalletGroup: IUserWalletGroup | null;
}

const WalletSelectorHeader: React.FC<WalletSelectorHeaderProps> = ({
  currentUserWalletGroup,
}) => {
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<IWalletGroup | null>(
    null
  );

  const { switchWallet } = useWallet();

  const handlePress = () => {
    setShowWalletSelector(true);
  };

  const handleDeleteWallet = (wallet: IWalletGroup) => {
    setWalletToDelete(wallet);
  };

  const handleCancelDelete = () => {
    setWalletToDelete(null);
  };

  const handleSelectWallet = async (
    selectedUserWalletGroup: IUserWalletGroup
  ) => {
    // Don't close if selecting the same wallet
    if (
      selectedUserWalletGroup._id === currentUserWalletGroup?._id ||
      !currentUserWalletGroup
    ) {
      setShowWalletSelector(false);
      return;
    }

    try {
      // Close modal first to prevent flickering
      setShowWalletSelector(false);

      // Switch to the selected wallet (this may take a moment)
      await switchWallet(selectedUserWalletGroup._id, undefined, true);
    } catch (error) {
      console.error("Failed to switch wallet:", error);
      Alert.alert("Error", "Failed to switch wallet. Please try again.");
    }
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed ? 0.5 : 1,
        })}
        onPress={handlePress}
      >
        <Box
          width={24}
          height={24}
          borderRadius={4}
          marginRight="s"
          overflow="hidden"
          flexDirection="row"
        >
          <Identicon
            value={currentUserWalletGroup?.name || "Wallet"}
            size={24}
          />
        </Box>
        <CustomText variant="body" fontSize={16} color="white">
          {currentUserWalletGroup?.name || "Wallet"}
        </CustomText>
        <ChevronDown size={16} color="white" style={{ marginLeft: 4 }} />
        <WalletSelectorBottomSheet
          visible={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          selectedWalletGroupId={currentUserWalletGroup?._id}
          handleCancelDelete={handleCancelDelete}
          walletToDelete={walletToDelete}
          onWalletSelect={handleSelectWallet}
          onDeleteWallet={handleDeleteWallet}
        />
      </Pressable>
    </>
  );
};

export default WalletSelectorHeader;

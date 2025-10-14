import WalletSelectorBottomSheet, { WalletSelectorBottomSheetRef } from "@/components/bottomsheets/WalletSelectorBottomSheet";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronDown } from "lucide-react-native";
import React, { useRef } from "react";
import { Pressable } from "react-native";

interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: string;
  icon: string;
}

interface WalletSelectorHeaderProps {
  currentWallet?: Wallet;
  onWalletChange?: (wallet: Wallet) => void;
}

const WalletSelectorHeader: React.FC<WalletSelectorHeaderProps> = ({
  currentWallet,
  onWalletChange,
}) => {
  const theme = useTheme<Theme>();
  const walletSelectorRef = useRef<WalletSelectorBottomSheetRef>(null);

  const handleWalletSelect = (wallet: Wallet) => {
    onWalletChange?.(wallet);
  };

  const handlePress = () => {
    walletSelectorRef.current?.open();
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          paddingHorizontal="m"
          paddingVertical="s"
        >
          {/* Wallet Icon */}
          <Box
            width={32}
            height={32}
            borderRadius={16}
            backgroundColor="borderColor"
            marginRight="s"
            justifyContent="center"
            alignItems="center"
          >
            <CustomText fontSize={14}>
              {currentWallet?.icon || "💳"}
            </CustomText>
          </Box>

          {/* Wallet Info */}
          <Box flex={1}>
            <CustomText variant="bodyBold" fontSize={16} color="headerTextColor">
              {currentWallet?.name || "Select Wallet"}
            </CustomText>
            <CustomText variant="body" fontSize={12} color="disabledTextColor">
              {currentWallet?.address || "Choose a wallet"}
            </CustomText>
          </Box>

          {/* Arrow Down */}
          <ChevronDown 
            size={20} 
            color={theme.colors.disabledTextColor} 
          />
        </Box>
      </Pressable>

      {/* Wallet Selector Bottom Sheet */}
      <WalletSelectorBottomSheet
        ref={walletSelectorRef}
        onWalletSelect={handleWalletSelect}
      />
    </>
  );
};

export default WalletSelectorHeader;

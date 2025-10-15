import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import ZapLoader from "@/components/general/ZapLoader";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import AddressesStorage from "@/src/core/storage/addresses-storage";
import { formatNumber } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Copy, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SvgUri } from "react-native-svg";
import { useDispatch } from "react-redux";

interface ReceiveQRCodeProps {
  selectedToken: ProcessedAsset;
  onBack: () => void;
}

const ReceiveQRCode: React.FC<ReceiveQRCodeProps> = ({
  selectedToken,
  onBack,
}) => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { mainUserWalletGroup } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getWalletAddress = async () => {
      try {
        setIsLoading(true);
        if (!mainUserWalletGroup?._id) {
          setWalletAddress("No wallet selected");
          return;
        }

        // Get address for the specific chain from stored addresses
        const storedAddress = await AddressesStorage.getAddressForChain(
          mainUserWalletGroup._id,
          Number(selectedToken.chainId)
        );

        if (storedAddress?.address) {
          setWalletAddress(storedAddress.address);
        } else {
          setWalletAddress("Address not available for this chain");
        }
      } catch (error) {
        console.error(
          "❌ ReceiveQRCode - Error getting wallet address:",
          error
        );
        setWalletAddress("Error retrieving address");
      } finally {
        setIsLoading(false);
      }
    };

    getWalletAddress();
  }, [selectedToken, mainUserWalletGroup]);

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress);
      Alert.alert("Copied", "Address copied to clipboard");
    } catch (error) {
      console.error("Error copying address:", error);
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleBack = () => {
    dispatch(setStage("token"));
    onBack();
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ZapLoader size={80} showText={true} text="Loading address..." />
      </Box>
    );
  }

  return (
    <Box flex={1}>
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb="l"
      >
        <Pressable onPress={handleBack}>
          <X size={24} color={theme.colors.headerTextColor} />
        </Pressable>
        <CustomText variant="header" fontSize={18} color="headerTextColor">
          Receive {selectedToken.symbol}
        </CustomText>
        <Box width={24} />
      </Box>

      {/* Token Info */}
      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor="secondaryBackgroundColor"
        padding="m"
        borderRadius={12}
      >
        <Box width={40} height={40} marginRight="m">
          {selectedToken.image ? (
            <Box
              width={40}
              height={40}
              borderRadius={20}
              overflow="hidden"
              backgroundColor="secondaryBackgroundColor"
              justifyContent="center"
              alignItems="center"
            >
              <SvgUri
                uri={selectedToken.image}
                width={35}
                height={35}
                onError={() => {
                  console.log(
                    "Failed to load token image:",
                    selectedToken.image
                  );
                }}
                style={{
                  borderRadius: 20,
                }}
              />
            </Box>
          ) : (
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="primaryColor"
              justifyContent="center"
              alignItems="center"
            >
              <CustomText color="white" fontSize={16} fontWeight="bold">
                {selectedToken.symbol.charAt(0)}
              </CustomText>
            </Box>
          )}
        </Box>

        <Box
          flex={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomText variant="body" fontSize={16} color="headerTextColor">
            {selectedToken.chainName}
          </CustomText>
          <CustomText variant="body" fontSize={14} color="disabledTextColor">
            {formatNumber(selectedToken.balance, 6)} {selectedToken.symbol}
          </CustomText>
        </Box>
      </Box>

      {/* QR Code Section */}
      <Box flex={1} alignItems="center" justifyContent="center">
        <CustomText
          variant="body"
          fontSize={16}
          color="headerTextColor"
          textAlign="center"
          marginBottom="l"
        >
          Scan QR code to receive {selectedToken.symbol}
        </CustomText>

        <Box
          padding="l"
          backgroundColor="white"
          borderRadius={16}
          marginBottom="l"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
          elevation={4}
        >
          <QRCode
            value={walletAddress}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </Box>

        {/* Address Display */}
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          padding="m"
          borderRadius={12}
          marginBottom="l"
          maxWidth="90%"
        >
          <Box flex={1}>
            <CustomText
              variant="body"
              fontSize={12}
              color="disabledTextColor"
              marginBottom="s"
            >
              {selectedToken.chainName} Address
            </CustomText>
            <CustomText
              variant="body"
              fontSize={14}
              color="headerTextColor"
              numberOfLines={2}
            >
              {walletAddress}
            </CustomText>
          </Box>

          <Pressable onPress={handleCopyAddress} style={{ marginLeft: 12 }}>
            <Copy size={20} color={theme.colors.primaryColor} />
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
};

export default ReceiveQRCode;

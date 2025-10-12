import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Chain } from "@/src/core/chains/chains-context";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { ChevronDown, MoreHorizontal, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";

interface ImportTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onImportToken: (tokenData: {
    chain: string;
    contractAddress: string;
    symbol: string;
    decimals: string;
    tokenAddress: string;
  }) => void;
  allChains: Chain[];
  mainUserWalletGroup: any;
}

const ImportTokenModal: React.FC<ImportTokenModalProps> = ({
  visible,
  onClose,
  onImportToken,
  allChains,
  mainUserWalletGroup,
}) => {
  const theme = useTheme<Theme>();
  const [selectedChain, setSelectedChain] = useState(allChains[0]);
  const [selectedChainImage, setSelectedChainImage] = useState(
    allChains[0].nativeCurrencyId.logo
  );
  const [contractAddress, setContractAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [contractAddressError, setContractAddressError] = useState("");
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] = useState(false);
  const chainBottomSheetRef = useRef<BottomSheet>(null);

  const validateContractAddress = (address: string): boolean => {
    // Basic Ethereum address validation (42 characters, starts with 0x)
    if (!address || address.length !== 42) {
      return false;
    }
    if (!address.startsWith("0x")) {
      return false;
    }
    // Check if it's a valid hex string
    const hexPattern = /^0x[a-fA-F0-9]{40}$/;
    return hexPattern.test(address);
  };

  const fetchTokenDetails = async (
    contractAddress: string,
    chainId: string
  ) => {
    try {
      setIsLoadingTokenDetails(true);
      const sdk = zapSDKService.getSDK();

      if (!sdk || !sdk.tokens) {
        throw new Error("SDK not available");
      }

      // Call SDK to get token details
      const tokenDetails = await sdk.tokens.getTokenDetails({
        chainId: chainId,
        tokenAddress: contractAddress,
      });

      console.log("Token details:", tokenDetails);

      if (tokenDetails && tokenDetails.data) {
        setTokenSymbol(tokenDetails.data.symbol || "");
        setTokenDecimals(tokenDetails.data.decimals || "");
        const extractedTokenAddress = tokenDetails.data.tokenAddress || tokenDetails.data.address || contractAddress;
        setTokenAddress(extractedTokenAddress);
        console.log("Token details fetched:", tokenDetails.data);
        console.log("Extracted tokenAddress:", extractedTokenAddress);
      }
    } catch (error) {
      console.error("Failed to fetch token details:", error);
      setContractAddressError("Failed to fetch token details");
    } finally {
      setIsLoadingTokenDetails(false);
    }
  };

  const handleContractAddressChange = (text: string) => {
    setContractAddress(text);
    setTokenSymbol("");
    setTokenDecimals("");
    setTokenAddress("");

    if (text.trim() && !validateContractAddress(text.trim())) {
      setContractAddressError("Invalid contract address format");
    } else if (text.trim() && validateContractAddress(text.trim())) {
      setContractAddressError("");
      // Fetch token details when valid address is entered
      fetchTokenDetails(text.trim(), selectedChain._id.toString());
    } else {
      setContractAddressError("");
    }
  };

  const handleContinue = async () => {
    if (!contractAddress.trim()) {
      Alert.alert("Error", "Please enter a contract address");
      return;
    }
    if (!validateContractAddress(contractAddress.trim())) {
      setContractAddressError("Invalid contract address format");
      return;
    }
    if (!tokenSymbol.trim()) {
      Alert.alert("Error", "Please enter a token symbol");
      return;
    }
    if (!tokenDecimals.trim()) {
      Alert.alert("Error", "Please enter token decimals");
      return;
    }

    try {
      setIsLoadingTokenDetails(true);
      const sdk = zapSDKService.getSDK();
      
      if (!sdk || !sdk.tokens) {
        throw new Error("SDK not available");
      }

      // Import the token using SDK
      const importResult = await sdk.tokens.addToken({
        chainId: selectedChain._id.toString(),
        tokenAddress: tokenAddress || contractAddress.trim(),
        userWalletGroupId: mainUserWalletGroup._id,
      });

      console.log("Token import result:", importResult);
      
      if (importResult && importResult.data) {
        // Call the import token callback directly
        onImportToken({
          chain: selectedChain.name,
          contractAddress: contractAddress.trim(),
          symbol: tokenSymbol.trim(),
          decimals: tokenDecimals.trim(),
          tokenAddress: tokenAddress || contractAddress.trim(),
        });
      }
    } catch (error) {
      console.error("Failed to import token:", error);
      Alert.alert("Error", "Failed to import token. Please try again.");
    } finally {
      setIsLoadingTokenDetails(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent && clipboardContent.trim()) {
        handleContractAddressChange(clipboardContent.trim());
        console.log("Pasted contract address:", clipboardContent.trim());
      } else {
        Alert.alert("Clipboard Empty", "No content found in clipboard");
      }
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      Alert.alert("Error", "Failed to paste from clipboard");
    }
  };

  const handleChainSelect = (chainSymbol: string) => {
    const chain = allChains.find((c) => c.symbol === chainSymbol);
    if (chain) {
      setSelectedChain(chain);
      setSelectedChainImage(chain.nativeCurrencyId.logo);

      // If we have a valid contract address, fetch token details for the new chain
      if (
        contractAddress.trim() &&
        validateContractAddress(contractAddress.trim())
      ) {
        fetchTokenDetails(contractAddress.trim(), chain._id.toString());
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      backdropColor={"rgba(0, 0, 0, 0)"}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <Box
            backgroundColor="mainBackgroundColor"
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            paddingTop="s"
            paddingBottom="xl"
            paddingHorizontal="m"
            maxHeight="90%"
          >
            {/* Draggable Handle */}
            <Box
              width={40}
              height={4}
              backgroundColor="borderColor"
              borderRadius={2}
              alignSelf="center"
              marginBottom="l"
            />

            {/* Header */}
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="xl"
            >
              <Pressable onPress={onClose}>
                <X size={24} color={theme.colors.headerTextColor} />
              </Pressable>
              <CustomText
                variant="bodyBold"
                fontSize={18}
                color="headerTextColor"
              >
                Import custom token
              </CustomText>
              <View style={{ width: 24 }} />
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Chain Selection */}
              <Box marginBottom="l">
                <Pressable
                  onPress={() => chainBottomSheetRef.current?.snapToIndex(0)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.secondaryBackgroundColor,
                    borderRadius: 12,
                    padding: 16,
                    borderColor: theme.colors.borderColor,
                  })}
                >
                  <SvgUri
                    uri={selectedChainImage}
                    width={24}
                    height={24}
                    style={{ marginRight: 12 }}
                  />
                  <CustomText
                    variant="body"
                    fontSize={16}
                    color="headerTextColor"
                    flex={1}
                  >
                    {selectedChain.name}
                  </CustomText>
                  <ChevronDown
                    size={20}
                    color={theme.colors.disabledTextColor}
                  />
                </Pressable>
              </Box>

              {/* Contract Address */}
              <Box marginBottom="l">
                <Box
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={12}
                  borderWidth={contractAddressError ? 1 : 0}
                  borderColor={contractAddressError ? "error" : "borderColor"}
                  paddingHorizontal="m"
                >
                  <TextInput
                    placeholder="Contract Address"
                    placeholderTextColor={theme.colors.disabledTextColor}
                    value={contractAddress}
                    onChangeText={handleContractAddressChange}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: theme.colors.headerTextColor,
                      paddingVertical: 16,
                    }}
                  />
                  <Pressable
                    onPress={handlePaste}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 1,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    })}
                  >
                    <CustomText variant="body" fontSize={14} color="white">
                      Paste
                    </CustomText>
                  </Pressable>
                </Box>
                {contractAddressError && (
                  <CustomText
                    variant="light"
                    fontSize={12}
                    color="error"
                    marginTop="s"
                    marginLeft="s"
                  >
                    {contractAddressError}
                  </CustomText>
                )}
              </Box>

              {/* Token Symbol */}
              <Box marginBottom="l">
                <Box
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={12}
                  borderColor="borderColor"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                >
                  <TextInput
                    placeholder={
                      isLoadingTokenDetails ? "Loading..." : "Token symbol"
                    }
                    placeholderTextColor={theme.colors.disabledTextColor}
                    value={tokenSymbol}
                    editable={false}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: theme.colors.headerTextColor,
                      paddingVertical: 16,
                    }}
                  />
                  {isLoadingTokenDetails && (
                    <Box
                      width={20}
                      height={20}
                      borderRadius={10}
                      backgroundColor="primaryColor"
                      justifyContent="center"
                      alignItems="center"
                      marginRight="s"
                    >
                      <CustomText
                        variant="bodyBold"
                        fontSize={10}
                        color="white"
                      >
                        <MoreHorizontal size={10} color="white" />
                      </CustomText>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Token Decimals */}
              <Box marginBottom="xl">
                <Box
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={12}
                  borderColor="borderColor"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                >
                  <TextInput
                    placeholder={
                      isLoadingTokenDetails ? "Loading..." : "Token decimal"
                    }
                    placeholderTextColor={theme.colors.disabledTextColor}
                    value={tokenDecimals}
                    editable={false}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: theme.colors.headerTextColor,
                      paddingVertical: 16,
                    }}
                  />
                  {isLoadingTokenDetails && (
                    <Box
                      width={20}
                      height={20}
                      borderRadius={10}
                      backgroundColor="primaryColor"
                      justifyContent="center"
                      alignItems="center"
                      marginRight="s"
                    >
                      <MoreHorizontal size={10} color="white" />
                    </Box>
                  )}
                </Box>
              </Box>

               {/* Continue Button */}
               <CustomButton
                 onPress={handleContinue}
                 text={isLoadingTokenDetails ? "Importing..." : "Continue"}
                 width="100%"
                 height={56}
                 fontSize={16}
                 bgColor={theme.colors.primaryColor}
                 color="white"
                 borderRadius={30}
                 disabled={isLoadingTokenDetails}
               />

              {/* Bottom Home Indicator */}
              <Box
                width={40}
                height={4}
                backgroundColor="borderColor"
                borderRadius={2}
                alignSelf="center"
                marginTop="l"
              />
            </ScrollView>
          </Box>
        </KeyboardAvoidingView>

         {/* Chain Selection Bottom Sheet */}
         <SelectChainBottomSheet
           ref={chainBottomSheetRef}
           onChainSelect={(chainSymbol) => {
             handleChainSelect(chainSymbol);
             chainBottomSheetRef.current?.close();
           }}
         />

       </View>
     </Modal>
   );
 };

export default ImportTokenModal;

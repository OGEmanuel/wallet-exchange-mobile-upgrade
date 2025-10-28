import { ThemedScanIcon } from "@/assets/svg/wallet-icons-components";
import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { useAddressBookSDK } from "@/hooks/useAddressBookSDK";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { addressValidation } from "@/services/formValidations";
import { useChains } from "@/src/core/chains/chains-context";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { getStringAsync } from "expo-clipboard";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useRef } from "react";
import { Pressable } from "react-native";
import { useSelector } from "react-redux";

const Addresses = () => {
  // states
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [selectedChainSymbol, setSelectedChainSymbol] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const theme = useTheme<Theme>();
  const { walletChains, getChainBySymbol, isLoading: chainsLoading } = useChains();
  const { createAddressBook } = useAddressBookSDK();
  const user = useSelector(selectUser);
  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const chainBottomSheetRef = useRef<BottomSheet>(null);

  // Get selected chain object
  const selectedChain = selectedChainSymbol ? getChainBySymbol(selectedChainSymbol) : null;


  // Set default chain when chains are loaded
  React.useEffect(() => {
    console.log("Chains loaded:", walletChains.length, "Selected chain:", selectedChainSymbol);
    if (walletChains.length > 0 && !selectedChainSymbol) {
      // Default to Ethereum if available, otherwise first chain
      const defaultChain = walletChains.find(chain => chain.symbol === "ETH") || walletChains[0];
      console.log("Setting default chain:", defaultChain.symbol);
      setSelectedChainSymbol(defaultChain.symbol);
    }
  }, [walletChains, selectedChainSymbol]);

  // Note: Authentication check is handled in handleSubmit to allow UI interaction

  const handlePaste = async () => {
    const str = await getStringAsync();
    if (str) {
      setAddress(str);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Add exchange address - Auth check:", {
        isExchangeAuthenticated,
        exchangeUserData: exchangeUserData?._id
      });

      // Check if user is exchange authenticated
      if (!isExchangeAuthenticated || !exchangeUserData?._id) {
        alert("Please log in to your exchange account to save addresses. You will be redirected to the address book.");
        router.back();
        return;
      }

      setLoading(true);
      const validation = addressValidation.parse({ name, address });
      
      const response = await createAddressBook('exchange', {
        name,
        address,
        chainId: selectedChain?.chainId?.toString() || '',
      });
      
      console.log("Exchange address created successfully:", response);
      setLoading(false);
      // Navigate back after successful creation
      router.back();
    } catch (error) {
      console.log("Add exchange address error:", error);
      alert("Failed to add exchange address. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmitWalletAddressBook = async () => {
    try {
      console.log("Add wallet address - Auth check:", {
        kycUser: user?._id
      });

      // Check if user is wallet authenticated
      if (!user?._id) {
        alert("Please log in to your wallet account to save addresses. You will be redirected to the address book.");
        router.back();
        return;
      }

      setLoading(true);
      const validation = addressValidation.parse({ name, address });
      
      const response = await createAddressBook('wallet', {
        name,
        address,
        chainId: selectedChain?.chainId?.toString() || '',
      });
      
      console.log("Wallet address created successfully:", response);
      setLoading(false);
      // Navigate back after successful creation
      router.back();
    } catch (error) {
      console.log("Add wallet address error:", error);
      alert("Failed to add wallet address. Please try again.");
      setLoading(false);
    }
  };
  
  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <AppBar
          paddingHorizontal={0}
          height={20}
          title={<CustomText variant="bodySubheader">Add Address</CustomText>}
          leading={
            <ChevronLeft
              size={25}
              color={theme.colors.bodyTextColor}
              onPress={() => router.back()}
            />
          }
        />
        <Box height={40} />
        <Box flex={1}>
          <CustomInputWithoutForm
            placeholder="Choose Name"
            value={name}
            onChange={(e) => {
              console.log("🔍 Name input changed:", e);
              setName(e);
            }}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
          />
          {/* <CustomInputWithoutForm
            placeholder="Select chain"
            value=""
            onChange={() => {}}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={<ChevronDown color={theme.colors.bodyTextColor} />}
          /> */}
          <Pressable
            style={{
              width: "100%",
              height: 52,
              borderRadius: 8,
              backgroundColor: theme.colors.secondaryBackgroundColor,
              paddingHorizontal: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
            onPress={() => {
              console.log("🔍 Chain selector pressed!");
              console.log("Chains available:", walletChains.length);
              console.log("Chains loading:", chainsLoading);
              console.log("Bottom sheet ref:", chainBottomSheetRef.current);
              
              if (chainBottomSheetRef.current) {
                console.log("🚀 Opening bottom sheet...");
                try {
                  chainBottomSheetRef.current.snapToIndex(0);
                  console.log("✅ Bottom sheet opened successfully");
                } catch (error) {
                  console.error("❌ Error opening bottom sheet:", error);
                }
              } else {
                console.error("❌ Bottom sheet ref is null!");
              }
            }}
            disabled={chainsLoading || walletChains.length === 0}
          >
            <CustomText>
              {chainsLoading 
                ? "Loading chains..." 
                : selectedChain
                  ? selectedChain.name
                  : walletChains.length > 0 
                    ? "Select chain"
                    : "No chains available"}
            </CustomText>
            <CustomText fontSize={10} color="disabledTextColor">
              Debug: {chainsLoading ? "Loading" : "Loaded"} | {walletChains.length} chains
            </CustomText>
            <ChevronDown 
              color={chainsLoading || walletChains.length === 0 
                ? theme.colors.disabledTextColor 
                : theme.colors.bodyTextColor} 
            />
          </Pressable>

          <CustomInputWithoutForm
            placeholder="Enter address, domain or identity"
            value={address}
            onChange={(e) => {
              console.log("🔍 Address input changed:", e);
              setAddress(e);
            }}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={
              <CustomText onPress={() => {
                console.log("🔍 Paste button pressed");
                handlePaste();
              }}>Paste</CustomText>
            }
          />
          <Box
            flexDirection="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <ThemedScanIcon
              darkModeColor={theme.colors.tabBarActiveColor}
              lightModeColor={theme.colors.tabBarActiveColor}
            />
            <CustomText color="tabBarActiveColor" ml="s" fontSize={12}>
              Scan QR Code
            </CustomText>
          </Box>
        </Box>
        <CustomButton
          width={"100%"}
          borderRadius={50}
          text="Add address"
          isLoading={loading || chainsLoading}
          disabled={loading || chainsLoading || !selectedChain}
          disabledColor={theme.colors.disabledTextColor}
          onPress={() => {
            console.log("🔍 Submit button pressed");
            // Use appropriate handler based on authentication
            if (isExchangeAuthenticated && exchangeUserData?._id) {
              handleSubmit(); // Exchange address
            } else if (user?._id) {
              handleSubmitWalletAddressBook(); // Wallet address
            } else {
              alert("Please log in to save addresses.");
              router.back();
            }
          }}
        />
      </Box>
      
      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={(chainSymbol) => {
          console.log("Chain selected:", chainSymbol);
          setSelectedChainSymbol(chainSymbol);
          chainBottomSheetRef.current?.close();
        }}
      />
    </PageWrapper>
  );
};

export default Addresses;

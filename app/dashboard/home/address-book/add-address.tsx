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
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { addressValidation } from "@/services/formValidations";
import { useChains } from "@/src/core/chains/chains-context";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
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
  const { createAddressBook } = useSettings();
  const user = useSelector(selectUser);
  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const chainBottomSheetRef = useRef<BottomSheet>(null);

  // Get selected chain object
  const selectedChain = selectedChainSymbol ? getChainBySymbol(selectedChainSymbol) : null;

  // Set default chain when chains are loaded
  React.useEffect(() => {
    if (walletChains.length > 0 && !selectedChainSymbol) {
      // Default to Ethereum if available, otherwise first chain
      const defaultChain = walletChains.find(chain => chain.symbol === "ETH") || walletChains[0];
      setSelectedChainSymbol(defaultChain.symbol);
    }
  }, [walletChains, selectedChainSymbol]);

  const handlePaste = async () => {
    const str = await getStringAsync();
    if (str) {
      setAddress(str);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Add address - Auth check:", {
        isExchangeAuthenticated,
        exchangeUserData: exchangeUserData?._id,
        kycUser: user?._id
      });

      // Check if user is authenticated for exchange operations
      if (!isExchangeAuthenticated) {
        alert("Please log in to your exchange account to save addresses.");
        return;
      }

      // Check if exchange user data exists
      if (!exchangeUserData?._id) {
        console.log("Exchange user data missing, trying to fetch from SDK...");
        
        // Try to fetch exchange user data from SDK
        try {
          const sdkUserData = await zapSDKService.getExchangeUser();
          if (sdkUserData?._id) {
            console.log("✅ Exchange user data fetched from SDK:", sdkUserData._id);
            // Use the fetched data for the API call
            const response = await createAddressBook({
              body: {
                name,
                address,
                chainId: selectedChain?.chainId,
              },
              params: { userId: sdkUserData._id },
            });
            console.log("Address created successfully:", response.data);
            setLoading(false);
            router.back();
            return;
          }
        } catch (error) {
          console.log("Failed to fetch exchange user from SDK:", error);
        }
        
        alert("Exchange user data not available. Please try logging in again.");
        return;
      }

      setLoading(true);
      const validation = addressValidation.parse({ name, address });
      const response = await createAddressBook({
        body: {
          name,
          address,
          chainId: selectedChain?.chainId,
        },
        params: { userId: exchangeUserData._id },
      });
      console.log("Address created successfully:", response.data);
      setLoading(false);
      // Navigate back after successful creation
      router.back();
    } catch (error) {
      console.log("Add address error:", error);
      alert("Failed to add address. Please try again.");
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
            onChange={(e) => setName(e)}
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
              chainBottomSheetRef.current?.snapToIndex(0);
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
            <ChevronDown 
              color={chainsLoading || walletChains.length === 0 
                ? theme.colors.disabledTextColor 
                : theme.colors.bodyTextColor} 
            />
          </Pressable>

          <CustomInputWithoutForm
            placeholder="Enter address, domain or identity"
            value={address}
            onChange={(e) => setAddress(e)}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={
              <CustomText onPress={() => handlePaste()}>Paste</CustomText>
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
          onPress={() => handleSubmit()}
        />
      </Box>
      
      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={(chainSymbol) => {
          setSelectedChainSymbol(chainSymbol);
          chainBottomSheetRef.current?.close();
        }}
      />
    </PageWrapper>
  );
};

export default Addresses;

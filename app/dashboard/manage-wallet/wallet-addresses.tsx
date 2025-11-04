import QRCodeBottomSheet from "@/components/bottomsheets/QRCodeBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import { useChains } from "@/src/core/chains/chains-context";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import AddressesStorage, {
  StoredAddress,
} from "@/src/core/storage/addresses-storage";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Copy, QrCode } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, InteractionManager, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WalletAddressesProps {
  // No props needed for this component
}

const WalletAddresses: React.FC<WalletAddressesProps> = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const {
    userWalletGroups,
    getSDK,
    getAddresses,
    getAddress,
    setIsAccountDeriving,
    isAccountDeriving,
  } = useWallet();
  const {
    walletChains,
    isLoading: chainsLoading,
    error: chainsError,
    getChainImage,
    getChainById,
    getChainBySymbol,
  } = useChains();

  console.log("🔍 Debug - chainsLoading:", chainsLoading);
  console.log("🔍 Debug - chainsError:", chainsError);
  console.log("🔍 Debug - walletChains length:", walletChains?.length);
  const { walletId } = useLocalSearchParams<{ walletId: string }>();

  // State for wallet addresses
  const [walletAddresses, setWalletAddresses] = useState<StoredAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<StoredAddress | null>(
    null
  );

  // Bottom sheet refs
  const qrCodeBottomSheetRef = useRef<BottomSheet>(null);

  // Find the wallet
  // The walletId parameter is actually the userWalletGroup._id, not the individual wallet._id
  const userWalletGroup = userWalletGroups?.find(
    (group) => group?.walletId?._id === walletId
  );

  console.log("🔍 Debug - found userWalletGroup:", userWalletGroup);
  const wallet = userWalletGroup?.walletId;
  console.log("🔍 Debug - wallet:", wallet);
  console.log("🔍 Debug - walletChains:", walletChains?.length);

  const handleCopyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert("Copied", "Address copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleShowQR = (addressData: StoredAddress) => {
    setSelectedAddress(addressData);
    qrCodeBottomSheetRef.current?.expand();
  };

  const formatAddress = (address: string) => {
    if (!address) return "";

    // For very short addresses (like TRX), don't truncate
    if (address.length <= 12) return address;

    // For medium length addresses, use a more conservative truncation
    if (address.length <= 20) {
      const start = address.slice(0, 8);
      const end = address.slice(-6);
      return `${start}...${end}`;
    }

    // For long addresses (Ethereum, Bitcoin), use standard truncation
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
  };

  // Get wallet addresses by deriving them directly
  useEffect(() => {
    const getWalletAddresses = async () => {
      if (!wallet || !userWalletGroup) {
        console.log("❌ Missing wallet or userWalletGroup data");
        setIsLoading(false);
        return;
      }

      if (chainsLoading) {
        console.log("⏳ Waiting for chains to load...");
        return;
      }

      if (!walletChains || walletChains.length === 0) {
        console.log("❌ No wallet chains available");
        setWalletAddresses([]);
        setIsLoading(false);
        return;
      }

      // Check if derivation is already in progress in wallet context
      // This prevents multiple simultaneous derivations
      if (isAccountDeriving) {
        console.log("⏳ Account derivation already in progress, waiting...");
        // Wait a bit and retry - derivation might complete soon
        const retryTimer = setTimeout(() => {
          getWalletAddresses();
        }, 1000);
        return () => clearTimeout(retryTimer);
      }

      try {
        setIsLoading(true);

        // First, check if we have stored addresses using centralized function
        // Add a small delay for newly created wallets to allow async storage to complete
        const storedAddresses = await getAddresses(userWalletGroup._id);
        if (storedAddresses && storedAddresses.length > 0) {
          console.log("✅ Using stored addresses:", storedAddresses.length);
          setWalletAddresses(storedAddresses);
          setIsLoading(false);
          return;
        }

        // If no stored addresses, wait a bit more before deriving (might still be storing)
        // This gives time for retryPendingWallets to complete derivation and storage
        console.log(
          "ℹ️ No stored addresses found, waiting briefly before deriving...",
          userWalletGroup._id
        );
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check again after delay
        const retryStoredAddresses = await getAddresses(userWalletGroup._id);
        if (retryStoredAddresses && retryStoredAddresses.length > 0) {
          console.log(
            "✅ Found stored addresses after delay:",
            retryStoredAddresses.length
          );
          setWalletAddresses(retryStoredAddresses);
          setIsLoading(false);
          return;
        }

        console.log(
          "ℹ️ Still no stored addresses, deriving them...",
          userWalletGroup._id
        );

        // Get stored credentials to access seed phrase
        const storedCredentials =
          await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
            userWalletGroup._id
          );
        console.log("🔍 Debug - storedCredentials:", storedCredentials);

        if (!storedCredentials || !storedCredentials.credential) {
          console.log("❌ No stored credentials found");
          setWalletAddresses([]);
          setIsLoading(false);
          return;
        }

        const sdk = getSDK();
        if (!sdk) {
          console.log("❌ SDK not available");
          setWalletAddresses([]);
          setIsLoading(false);
          return;
        }

        // Derive all addresses once using the SDK
        console.log("🔍 Deriving all addresses once...");
        console.log("🔍 Using wallet depth:", wallet.walletDepth || 0);
        setIsAccountDeriving(true);

        // Use InteractionManager to defer heavy computation and allow UI to remain responsive
        // This prevents the app from freezing during crypto derivation
        const derivedResult = await new Promise<any>((resolve, reject) => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(async () => {
              try {
                const result = await zapSDKService.deriveMultiChainAddresses(
                  storedCredentials.credential, // seed phrase
                  wallet.walletDepth || 0
                );
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, 100); // Small delay to ensure UI thread is free
          });
        });

        setIsAccountDeriving(false);
        console.log("🔍 Derived result:", derivedResult);

        const addresses: StoredAddress[] = [];
        const processedChains = new Set<string>();
        const addressesToStore: StoredAddress[] = [];

        console.log(
          "🔍 Debug - derivedResult.addresses:",
          derivedResult.addresses
        );

        // Process each chain from walletChains
        for (const chainData of walletChains) {
          console.log(
            "🔍 Debug - processing chain:",
            chainData.symbol,
            chainData.name
          );
          if (processedChains.has(chainData.symbol)) continue;

          // Map chain symbols to derivation symbols
          const chainSymbolMap: { [key: string]: string } = {
            ETH: "eth",
            BTC: "btc",
            SOL: "sol",
            TRX: "trx",
            MATIC: "eth", // Polygon uses ETH derivation
            ARB: "eth", // Arbitrum uses ETH derivation
            OP: "eth", // Optimism uses ETH derivation
            BASE: "eth", // Base uses ETH derivation
          };

          const mappedSymbol =
            chainSymbolMap[chainData.symbol as keyof typeof chainSymbolMap];
          if (!mappedSymbol) {
            console.log("🔍 Debug - no mapped symbol for:", chainData.symbol);
            continue;
          }

          // Get the derived address for this chain
          const derivedAddress = derivedResult.addresses?.[mappedSymbol];
          if (!derivedAddress) {
            console.log("🔍 Debug - no derived address for:", mappedSymbol);
            continue;
          }

          // Mark this chain as processed
          processedChains.add(chainData.symbol);

          const addressData: StoredAddress = {
            chainId: chainData.chainId || 0,
            chainSymbol: chainData.symbol,
            chainName: chainData.name,
            address: derivedAddress,
            logoUrl: getChainImage(chainData._id || ""),
            isEVM: chainData.isEVM,
            timestamp: Date.now(),
          };

          addresses.push(addressData);

          // Store for secure storage
          addressesToStore.push(addressData);
        }

        console.log("🔍 Derived wallet addresses:", addresses);

        // Store addresses securely for future use
        if (addressesToStore.length > 0) {
          await AddressesStorage.storeAddresses(
            userWalletGroup._id,
            addressesToStore
          );
        }

        console.log("🔍 addresses:", addresses);
        setWalletAddresses(addresses);
      } catch (error) {
        console.error("❌ Failed to derive wallet addresses:", error);
        setWalletAddresses([]);
        setIsAccountDeriving(false);
      } finally {
        setIsLoading(false);
      }
    };

    getWalletAddresses();
  }, [
    wallet,
    userWalletGroup,
    walletChains,
    chainsLoading,
    getSDK,
    isAccountDeriving,
  ]);

  if (!wallet) {
    return (
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <Box style={{ paddingTop: insets.top }}>
          <SettingsHeader
            title="Wallet Addresses"
            onBackPress={() => router.back()}
          />
        </Box>
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="disabledTextColor">
            Wallet not found
          </CustomText>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <SettingsHeader
          title="Wallet Addresses"
          onBackPress={() => router.back()}
        />
      </Box>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Box paddingHorizontal="m" paddingTop="l">
          {isLoading ? (
            <Box
              flex={1}
              justifyContent="center"
              alignItems="center"
              paddingVertical="xl"
            >
              <CustomText variant="body" color="disabledTextColor">
                Loading wallet addresses...
              </CustomText>
            </Box>
          ) : walletAddresses.length === 0 ? (
            <Box
              flex={1}
              justifyContent="center"
              alignItems="center"
              paddingVertical="xl"
            >
              <CustomText variant="body" color="disabledTextColor">
                No wallet addresses found
              </CustomText>
            </Box>
          ) : (
            walletAddresses.map((addressData, index) => {
              const chain = getChainBySymbol(addressData.chainSymbol.toUpperCase());
              const chainImage = getChainImage(chain?._id || "");
              const chainName = chain?.name || addressData.chainName;
              const chainSymbol = chain?.symbol || addressData.chainSymbol;
              return (
                <Box
                  key={index}
                  backgroundColor="modalBackgroundColor"
                  borderRadius={12}
                  borderColor="borderColor"
                  padding="m"
                  marginBottom="s"
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box flexDirection="row" alignItems="center" flex={1}>
                      <ChainLogo
                        symbol={chainSymbol}
                        name={chainName}
                        logoUrl={chainImage}
                        width={40}
                        height={40}
                        style={{ marginRight: theme.spacing.m }}
                      />

                      <Box flex={1}>
                        <CustomText
                          variant="bodyBold"
                          fontSize={16}
                          color="headerTextColor"
                          marginBottom="s"
                        >
                          {chainName}
                        </CustomText>
                        <CustomText
                          variant="body"
                          fontSize={14}
                          color="disabledTextColor"
                        >
                          {formatAddress(addressData.address)}
                        </CustomText>
                      </Box>
                    </Box>

                    <Box flexDirection="row" alignItems="center">
                      <Pressable
                        onPress={() => handleShowQR(addressData)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          padding: 8,
                          marginRight: 8,
                        })}
                      >
                        <QrCode
                          size={20}
                          color={theme.colors.headerTextColor}
                        />
                      </Pressable>

                      <Pressable
                        onPress={() => handleCopyAddress(addressData.address)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          padding: 8,
                        })}
                      >
                        <Copy size={20} color={theme.colors.headerTextColor} />
                      </Pressable>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </ScrollView>

      {/* QR Code Bottom Sheet */}
      {selectedAddress && (
        <QRCodeBottomSheet
          bottomSheetRef={qrCodeBottomSheetRef as React.RefObject<BottomSheet>}
          chain={selectedAddress.chainName}
          symbol={selectedAddress.chainSymbol}
          address={selectedAddress.address}
          logoUrl={selectedAddress.logoUrl}
        />
      )}
    </Box>
  );
};

export default WalletAddresses;

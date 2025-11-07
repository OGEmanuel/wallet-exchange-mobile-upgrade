import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import PrivateKeyGuardScreen from "@/components/guards/PrivateKeyGuardScreen";
import { PinEntryModal } from "@/components/Modals/PinEntryModal";
import { useChains } from "@/src/core/chains/chains-context";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import PrivateKeysStorage from "@/src/core/storage/private-keys-storage";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { InteractionManager, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PrivateKeysProps {}

const PrivateKeys: React.FC<PrivateKeysProps> = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { userWalletGroups, getSDK, setIsAccountDeriving, isAccountDeriving } =
    useWallet();
  const {
    walletChains,
    isLoading: chainsLoading,
    error: chainsError,
    getChainImage,
    getChainBySymbol,
  } = useChains();

  const { walletId } = useLocalSearchParams<{ walletId: string }>();
  const router = useRouter();

  // State for private keys
  const [privateKeys, setPrivateKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuardScreen, setShowGuardScreen] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);

  // Find the wallet
  // The walletId parameter is actually the userWalletGroup._id, not the individual wallet._id
  console.log("🔍 Debug - walletId from params:", walletId);
  console.log("🔍 Debug - userWalletGroups:", userWalletGroups?.length);
  console.log(
    "🔍 Debug - userWalletGroups data:",
    userWalletGroups?.map((g) => ({ _id: g._id, walletId: g.walletId?._id }))
  );

  const userWalletGroup = userWalletGroups?.find(
    (group) => group?.walletId?._id === walletId
  );
  const wallet = userWalletGroup?.walletId;

  const handlePrivateKeyPress = (keyData: any) => {
    // Navigate to private key detail modal
    router.push({
      pathname: "/dashboard/manage-wallet/private-key-detail",
      params: {
        chain: keyData.chain,
        symbol: keyData.symbol,
        privateKey: keyData.privateKey,
        chainId: keyData.chainId,
        logoUrl: keyData.logoUrl,
      },
    });
  };

  const handleGuardContinue = () => {
    console.log("🔐 Guard continue clicked, showing PIN modal");
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    console.log("🔐 PIN success, closing modals");
    setShowPinModal(false);
    setShowGuardScreen(false);
    // Trigger derivation after PIN success
    triggerDerivation();
  };

  // Trigger derivation after PIN success
  const triggerDerivation = async () => {
    console.log("🔍 Triggering derivation after PIN success...");

    if (
      !userWalletGroup ||
      !wallet ||
      !walletChains ||
      walletChains.length === 0
    ) {
      console.log("❌ Missing required data for derivation");
      return;
    }

    // Check if derivation is already in progress
    if (isAccountDeriving) {
      console.log(
        "⏳ Account derivation already in progress, skipping duplicate derivation"
      );
      // Wait a bit and check for stored keys
      setTimeout(async () => {
        const storedPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
          userWalletGroup._id
        );
        if (storedPrivateKeys && storedPrivateKeys.length > 0) {
          const keys = storedPrivateKeys.map((storedKey) => ({
            chain: storedKey.chainName,
            symbol: storedKey.chainSymbol,
            privateKey: storedKey.privateKey,
            chainId: storedKey.chainId,
            logoUrl: storedKey.logoUrl,
            isEVM: storedKey.isEVM,
            currency: undefined,
          }));
          setPrivateKeys(keys);
          setIsLoading(false);
        }
      }, 1000);
      return;
    }

    try {
      setIsLoading(true);

      // First, try to get stored private keys
      console.log("🔍 Checking for stored private keys...");
      const storedPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
        userWalletGroup._id
      );
      console.log("🔍 Stored private keys result:", storedPrivateKeys);

      if (storedPrivateKeys && storedPrivateKeys.length > 0) {
        console.log("✅ Found stored private keys, using them");

        // Convert stored private keys to display format
        const keys = storedPrivateKeys.map((storedKey) => ({
          chain: storedKey.chainName,
          symbol: storedKey.chainSymbol,
          privateKey: storedKey.privateKey,
          chainId: storedKey.chainId,
          logoUrl: storedKey.logoUrl,
          isEVM: storedKey.isEVM,
          currency: undefined, // Not stored in private keys storage
        }));

        setPrivateKeys(keys);
        setIsLoading(false);
        return;
      } else {
        console.log("ℹ️ No stored private keys found, will derive them");
      }

      // Add a small delay to allow for async storage operations from other components
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check again after delay (retryPendingWallets might have completed)
      const retryStoredPrivateKeys = await PrivateKeysStorage.getPrivateKeys(
        userWalletGroup._id
      );
      if (retryStoredPrivateKeys && retryStoredPrivateKeys.length > 0) {
        console.log(
          "✅ Found stored private keys after delay:",
          retryStoredPrivateKeys.length
        );
        const keys = retryStoredPrivateKeys.map((storedKey) => ({
          chain: storedKey.chainName,
          symbol: storedKey.chainSymbol,
          privateKey: storedKey.privateKey,
          chainId: storedKey.chainId,
          logoUrl: storedKey.logoUrl,
          isEVM: storedKey.isEVM,
          currency: undefined,
        }));
        setPrivateKeys(keys);
        setIsLoading(false);
        return;
      }

      setIsAccountDeriving(true);
      // Get stored credentials to access seed phrase
      console.log("🔍 Debug - userWalletGroup._id:", userWalletGroup._id);
      const storedCredentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          userWalletGroup._id
        );
      console.log("🔍 Debug - storedCredentials:", storedCredentials);

      if (!storedCredentials || !storedCredentials.credential) {
        console.log("❌ No stored credentials found");
        setPrivateKeys([]);
        setIsLoading(false);
        return;
      }

      const sdk = getSDK();
      if (!sdk) {
        console.log("❌ SDK not available");
        setPrivateKeys([]);
        setIsLoading(false);
        return;
      }

      // Derive all addresses once using the SDK
      console.log("🔍 Deriving all addresses once...");
      console.log("🔍 Using wallet depth:", wallet.walletDepth || 0);

      // Use InteractionManager to defer heavy computation and allow UI to remain responsive
      // This prevents the app from freezing during crypto derivation
      let derivedResult: any;
      derivedResult = await new Promise<any>((resolve, reject) => {
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

      const keys = [];
      const processedChains = new Set();
      const privateKeysToStore: any[] = [];

      console.log(
        "🔍 Debug - derivedResult.privateKeys:",
        derivedResult.privateKeys
      );

      // Process each chain from walletChains directly
      for (const chainData of walletChains) {
        if (processedChains.has(chainData.symbol)) continue;

        // Mark this chain as processed to avoid duplicates
        processedChains.add(chainData.symbol);

        // Map chain symbols to the keys used in the derived result
        const chainSymbolMap = {
          ETH: "eth",
          BTC: "btc",
          SOL: "sol",
          TRX: "trx",
          MATIC: "eth",
          ARB: "eth",
          OP: "eth",
          BASE: "eth",
        };

        const mappedSymbol =
          chainSymbolMap[chainData.symbol as keyof typeof chainSymbolMap];
        console.log("🔍 Debug - mappedSymbol:", mappedSymbol);
        if (!mappedSymbol) {
          console.log("🔍 Debug - no mapped symbol for:", chainData.symbol);
          continue;
        }

        // Get the derived private key for this chain
        const privateKey = derivedResult.privateKeys?.[mappedSymbol];
        console.log("🔍 Debug - privateKey:", privateKey);
        if (!privateKey) {
          console.log("🔍 Debug - no derived private key for:", mappedSymbol);
          continue;
        }

        const keyData = {
          chain: chainData.name,
          symbol: chainData.symbol,
          privateKey: privateKey,
          chainId: chainData.chainId,
          logoUrl: getChainImage(chainData._id || ""),
          isEVM: chainData.isEVM,
        };

        console.log("🔍 Debug - adding private key:", keyData);
        keys.push(keyData);

        // Store for secure storage
        privateKeysToStore.push({
          chainId: chainData.chainId,
          chainSymbol: chainData.symbol,
          chainName: chainData.name,
          privateKey: privateKey,
          logoUrl: getChainImage(chainData._id || ""),
          isEVM: chainData.isEVM,
          timestamp: Date.now(),
        });
      }

      console.log("🔍 Private keys from derivation:", keys);

      // Store private keys securely for future use
      if (privateKeysToStore.length > 0) {
        try {
          console.log(
            "🔍 Storing private keys for userWalletGroup._id:",
            userWalletGroup._id
          );
          console.log("🔍 Private keys to store:", privateKeysToStore.length);
          await PrivateKeysStorage.storePrivateKeys(
            userWalletGroup._id,
            privateKeysToStore
          );
          console.log("✅ Stored private keys securely");
        } catch (error) {
          console.error("❌ Failed to store private keys:", error);
        }
      } else {
        console.log("⚠️ No private keys to store");
      }

      setPrivateKeys(keys);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Failed to process private keys:", error);
      setIsAccountDeriving(false);
      setPrivateKeys([]);
      setIsLoading(false);
    }
  };

  const formatPrivateKey = (privateKey: string) => {
    if (!privateKey) return "";

    // For very short private keys, don't truncate
    if (privateKey.length <= 12) return privateKey;

    // For medium length private keys, use a more conservative truncation
    if (privateKey.length <= 20) {
      const start = privateKey.slice(0, 8);
      const end = privateKey.slice(-6);
      return `${start}...${end}`;
    }

    // For long private keys, use standard truncation
    const start = privateKey.slice(0, 6);
    const end = privateKey.slice(-4);
    return `${start}...${end}`;
  };

  // Initialize loading state when component mounts
  useEffect(() => {
    if (!showGuardScreen) {
      // Only set loading if we're past the guard screen
      setIsLoading(true);
    }
  }, [showGuardScreen]);

  if (!wallet) {
    return (
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <Box style={{ paddingTop: insets.top }}>
          <SettingsHeader
            title="Private keys"
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

  // Show guard screen first
  if (showGuardScreen) {
    return (
      <>
        <PrivateKeyGuardScreen
          onContinue={handleGuardContinue}
          type="private-keys"
        />
        {/* PIN Modal - render at root level */}
        <PinEntryModal
          visible={showPinModal}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      </>
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <SettingsHeader
          title="Private keys"
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
                Loading private keys...
              </CustomText>
            </Box>
          ) : privateKeys.length === 0 ? (
            <Box
              flex={1}
              justifyContent="center"
              alignItems="center"
              paddingVertical="xl"
            >
              <CustomText
                variant="body"
                color="disabledTextColor"
                marginBottom="m"
              >
                No private keys found
              </CustomText>
            </Box>
          ) : (
            privateKeys.map((keyData, index) => {
              const chain = getChainBySymbol(keyData.symbol.toUpperCase());
              const chainImage = getChainImage(chain?._id || "");
              const chainName = chain?.name || keyData.chain;
              const chainSymbol = chain?.symbol || keyData.symbol;
              return (
                <Pressable
                  key={index}
                  onPress={() => handlePrivateKeyPress(keyData)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Box
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
                            {formatPrivateKey(keyData.privateKey)}
                          </CustomText>
                        </Box>
                      </Box>

                      <ChevronRight
                        size={20}
                        color={theme.colors.headerTextColor}
                      />
                    </Box>
                  </Box>
                </Pressable>
              );
            })
          )}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PrivateKeys;

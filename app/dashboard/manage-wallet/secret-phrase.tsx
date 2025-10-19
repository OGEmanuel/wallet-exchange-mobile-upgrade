import { AppBar, CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import PrivateKeyGuardScreen from "@/components/guards/PrivateKeyGuardScreen";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { Copy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

 
interface SecretPhraseProps {}

const SecretPhrase: React.FC<SecretPhraseProps> = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { userWalletGroups } = useWallet();
  const { walletId } = useLocalSearchParams<{ walletId: string }>();
  
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showGuardScreen, setShowGuardScreen] = useState(true);

  // Find the wallet
  const wallet = userWalletGroups?.find(
    (userWalletGroup) => userWalletGroup?.walletId?._id === walletId
  );

  useEffect(() => {
    const loadSeedPhrase = async () => {
      try {
        setIsLoading(true);
        
        if (wallet) {
          // Get the seed phrase from secure storage
          const credential = await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(wallet._id);
          if (credential?.credential) {
            setSeedPhrase(credential.credential);
          } else {
            Alert.alert("Error", "Seed phrase not found for this wallet");
          }
        }
      } catch (error) {
        console.error("Failed to load seed phrase:", error);
        Alert.alert("Error", "Failed to load seed phrase");
      } finally {
        setIsLoading(false);
      }
    };

    loadSeedPhrase();
  }, [wallet]);

  if (!wallet) {
    return (
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <Box style={{ paddingTop: insets.top }}>
          <AppBar
            title="Secret phrase"
            leading={<ArrowLeft2 size={24} color={theme.colors.headerTextColor} />}
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

  const handleGuardContinue = () => {
    setShowGuardScreen(false);
  };

  // Show guard screen first
  if (showGuardScreen) {
    return (
      <PrivateKeyGuardScreen
        onContinue={handleGuardContinue}
        type="seed-phrase"
      />
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleCopyPhrase = async () => {
    try {
      await Clipboard.setStringAsync(seedPhrase);
      Alert.alert("Copied", "Secret phrase copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy secret phrase");
    }
  };

  const handleGotIt = () => {
    router.back();
  };

  const words = seedPhrase.split(" ");

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          title="Secret phrase"
          leading={<Pressable onPress={handleBack}><ArrowLeft2 size={24} color={theme.colors.headerTextColor} /></Pressable>}
        />
      </Box>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Box paddingHorizontal="l" paddingTop="m">
          {/* Header */}
          <CustomText
            variant="header"
            fontSize={24}
            color="headerTextColor"
            marginBottom="m"
            textAlign="center"
          >
            Your secret phrase
          </CustomText>

          <CustomText
            variant="body"
            color="disabledTextColor"
            marginBottom="xl"
            textAlign="center"
            lineHeight={24}
          >
            These words are your secret phrase. Ensure you keep them personal to you.
          </CustomText>

          {/* Seed Phrase Grid */}
          {isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center" paddingVertical="xl">
              <CustomText variant="body" color="disabledTextColor">
                Loading secret phrase...
              </CustomText>
            </Box>
          ) : (
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={12}
              borderColor="borderColor"
              padding="l"
              marginBottom="l"
            >
              <Box
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
              >
                {words.map((word, index) => (
                  <Box
                    key={index}
                    width="48%"
                    backgroundColor="secondaryBackgroundColor"
                    borderRadius={8}
                    padding="m"
                    marginBottom="s"
                    flexDirection="row"
                    alignItems="center"
                  >
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                      marginRight="s"
                      minWidth={20}
                    >
                      {index + 1}
                    </CustomText>
                    <CustomText
                      variant="bodyBold"
                      fontSize={16}
                      color="headerTextColor"
                      flex={1}
                    >
                      {word}
                    </CustomText>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Copy Button */}
          <Pressable
            onPress={handleCopyPhrase}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              paddingVertical: 12,
            })}
          >
            <Copy size={20} color={theme.colors.headerTextColor} />
            <CustomText
              variant="body"
              color="headerTextColor"
              marginLeft="s"
            >
              Copy to Clipboard
            </CustomText>
          </Pressable>
        </Box>
      </ScrollView>

      {/* Got it Button */}
      <Box paddingHorizontal="l" paddingBottom="xl">
        <CustomButton
          onPress={handleGotIt}
          text="Got it"
          width="100%"
          borderRadius={30}
          paddingVertical={16}
        />
      </Box>
    </Box>
  );
};

export default SecretPhrase;

import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import { AppBar, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import Identicon from "@/components/general/Identicon";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

 
 
interface WalletDetailProps {}

const WalletDetail: React.FC<WalletDetailProps> = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { userWalletGroups, getSDK, refreshPortfolio } = useWallet();
  const { walletId } = useLocalSearchParams<{ walletId: string }>();

  // State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Debug logging
  console.log("🔍 Wallet Detail - Looking for walletId:", walletId);
  console.log("🔍 Available userWalletGroups:", userWalletGroups?.map(g => ({
    id: g._id,
    walletGroupId: g.walletGroupId?._id,
    walletName: g.walletId?.name
  })));

  // Find the wallet
  const wallet = userWalletGroups?.find(
    (userWalletGroup) => userWalletGroup.walletId._id === walletId
  );
  
  console.log("🔍 Found wallet:", wallet ? "Yes" : "No");
  if (wallet) {
    console.log("🔍 Wallet structure:", {
      id: wallet._id,
      walletId: wallet.walletId,
      walletGroupId: wallet.walletGroupId,
      derivationIndex: wallet.walletId?.walletDepth
    });
  }

  if (!wallet) {
    return (
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <Box style={{ paddingTop: insets.top }}>
          <AppBar
            title="Edit wallet"
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


  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(wallet.walletId?.name || "");
  };


  const handleSaveName = async () => {
    try {
      setIsUpdatingName(true);
      const sdk = getSDK();
      if (!sdk) {
        throw new Error("SDK not available");
      }

      // Update wallet name via SDK
      await sdk.wallets.updateWallet(wallet.walletId?._id, {
        name: editedName,
      });

      // Update the local wallet name immediately
      if (wallet.walletId) {
        wallet.walletId.name = editedName;
      }

      setIsEditingName(false);
      await refreshPortfolio(); // Refresh to get updated data
    } catch (error) {
      console.error("Failed to update wallet name:", error);
      Alert.alert("Error", "Failed to update wallet name");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleWalletAddresses = () => {
    router.push(`/dashboard/manage-wallet/wallet-addresses?walletId=${walletId}`);
  };

  const handlePrivateKeys = () => {
    router.push(`/dashboard/manage-wallet/private-keys?walletId=${walletId}`);
  };

  const handleSecretPhrase = () => {
    router.push(`/dashboard/manage-wallet/secret-phrase?walletId=${walletId}`);
  };


  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          title="Edit wallet"
          leading={<ArrowLeft2 size={24} color={theme.colors.headerTextColor} />}
        />
      </Box>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Wallet Icon and Name */}
        <Box
          backgroundColor="modalBackgroundColor"
          borderRadius={12}
          borderColor="borderColor"
          padding="l"
          marginHorizontal="m"
          marginTop="l"
          alignItems="center"
        >
          <Box marginBottom="m" borderRadius={12} overflow="hidden">
            <Identicon value={wallet.walletId?.name || wallet.walletId?._id || wallet._id || "0x0000000000000000000000000000000000000000"} size={60} />
          </Box>
          
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            {isEditingName ? (
              <Box flex={1} marginRight="s">
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: theme.colors.headerTextColor,
                    backgroundColor: "transparent",
                    paddingVertical: 4,
                  }}
                  autoFocus
                  selectTextOnFocus
                />
              </Box>
            ) : (
              <CustomText
                variant="bodyBold"
                fontSize={18}
                color="headerTextColor"
              >
                {wallet.walletId?.name || "Unnamed Wallet"}
              </CustomText>
            )}
            <Box flexDirection="row" alignItems="center">
              {isEditingName ? (
                <>
                  <Pressable
                    onPress={handleSaveName}
                    disabled={isUpdatingName}
                    style={({ pressed }) => ({
                      opacity: pressed || isUpdatingName ? 0.5 : 1,
                      marginRight: 8,
                    })}
                  >
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color={
                        isUpdatingName ? "disabledTextColor" : "secondaryColor"
                      }
                    >
                      {isUpdatingName ? "Saving..." : "Save"}
                    </CustomText>
                  </Pressable>
                  <Pressable
                    onPress={handleCancelEdit}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="disabledTextColor"
                    >
                      Cancel
                    </CustomText>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={handleEditName}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <ThemedEditIcon />
                </Pressable>
              )}
            </Box>
          </Box>
        </Box>

        {/* Wallet Options */}
        <Box marginTop="l" marginHorizontal="m">
          <CustomText
            variant="bodyBold"
            color="headerTextColor"
            marginBottom="m"
          >
            Wallet Information
          </CustomText>

          <Box
            backgroundColor="modalBackgroundColor"
            borderRadius={12}
            borderColor="borderColor"
            padding="m"
          >
            <Pressable
              onPress={handleWalletAddresses}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="s"
              >
                <CustomText
                  variant="body"
                  fontSize={16}
                  color="headerTextColor"
                >
                  Wallet addresses
                </CustomText>
                <ChevronRight size={20} color={theme.colors.headerTextColor} />
              </Box>
            </Pressable>

            <Box height={1} marginVertical="s" />

            <Pressable
              onPress={handlePrivateKeys}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="s"
              >
                <CustomText
                  variant="body"
                  fontSize={16}
                  color="headerTextColor"
                >
                  Show private keys
                </CustomText>
                <ChevronRight size={20} color={theme.colors.headerTextColor} />
              </Box>
            </Pressable>

            <Box height={1} marginVertical="s" />

            <Pressable
              onPress={handleSecretPhrase}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="s"
              >
                <CustomText
                  variant="body"
                  fontSize={16}
                  color="headerTextColor"
                >
                  Show secret recovery phrase
                </CustomText>
                <ChevronRight size={20} color={theme.colors.headerTextColor} />
              </Box>
            </Pressable>
          </Box>
        </Box>

      </ScrollView>
    </Box>
  );
};

export default WalletDetail;

import {
  ThemedAddIcon,
  ThemedCheckIcon,
  ThemedDeleteIcon,
} from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import Identicon from "@/components/general/Identicon";
import RemoveWalletModal from "@/components/Modals/RemoveWalletModal";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import AddressesStorage from "@/src/core/storage/addresses-storage";
import PrivateKeysStorage from "@/src/core/storage/private-keys-storage";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView } from "react-native";
import { CustomButton } from "../general";
import SuccessModal from "../Modals/SuccessModal";

interface WalletSelectorBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onWalletSelect?: (walletGroup: any) => void;
  onManagePress?: () => void;
  onAddWalletPress?: () => void;
  onDeleteWallet?: (wallet: any) => void;
  selectedWalletGroupId?: string;
  showDeleteModal?: boolean;
  handleCancelDelete?: () => void;
  handleConfirmDelete?: () => void;
  walletToDelete?: any;
}

const WalletSelectorBottomSheet = ({
  visible,
  onClose,
  onWalletSelect,
  onManagePress,
  onAddWalletPress,
  onDeleteWallet,
  selectedWalletGroupId,
  handleCancelDelete = () => {},
  handleConfirmDelete = () => {},
  walletToDelete,
}: WalletSelectorBottomSheetProps) => {
  const theme = useTheme<Theme>();

  const { userWalletGroups, portfolio, getSDK, refreshPortfolio, refreshUserWalletGroups } = useWallet();
  const [activeTab, setActiveTab] = useState<"wallets" | "watchlist">(
    "wallets"
  );
  const [showGroups, setShowGroups] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [localShowDeleteModal, setLocalShowDeleteModal] = useState(false);

  // Get portfolio value from the main wallet group
  const portfolioValue = portfolio?.totalValue || "$0.00";

  // Process and group wallet groups from context
  const walletGroupsMap = new Map();

  (userWalletGroups && Array.isArray(userWalletGroups) ? userWalletGroups : []).forEach((userWalletGroup) => {
    // Get the actual wallet group ID and name
    const walletGroupId = userWalletGroup.walletGroupId?._id;
    const walletGroupName =
      userWalletGroup.walletGroupId?.name ||
      `Wallet Group ${walletGroupId?.slice(-4) || "Unknown"}`;

    // Get wallet info
    const walletInfo = userWalletGroup.walletId;
    const walletName =
      userWalletGroup?.name || walletInfo?.name || `Wallet ${userWalletGroup?._id?.slice(-4) || "Unknown"}`;
    const totalValue = walletInfo?.totalUsdValue
      ? `$${walletInfo.totalUsdValue}`
      : "$0.00";

    // If this wallet group doesn't exist in our map, create it
    if (!walletGroupsMap.has(walletGroupId)) {
      walletGroupsMap.set(walletGroupId, {
        id: walletGroupId,
        name: walletGroupName,
        totalValue: "$0.00", // Will be calculated from all wallets
        wallets: [],
      });
    }

    // Add this wallet to the group
    const group = walletGroupsMap.get(walletGroupId);
    group.wallets.push({
      id: walletInfo?._id || userWalletGroup._id,
      name: walletName,
      address: walletInfo?.hashedSeedPhraseOrPrivateKey || "No address",
      balance: totalValue,
      groupId: walletGroupId,
      userWalletGroupId: userWalletGroup._id, // Keep reference to original user wallet group
    });
  });

  // Convert map to array and calculate total values
  const processedWalletGroups = Array.from(walletGroupsMap.values()).map(
    (group) => {
      // Calculate total value for the group
      const totalValue = group.wallets.reduce((sum: number, wallet: any) => {
        const value = parseFloat(wallet.balance.replace("$", "")) || 0;
        return sum + value;
      }, 0);

      return {
        ...group,
        totalValue: `$${totalValue.toFixed(2)}`,
      };
    }
  );

  const allWallets = processedWalletGroups.flatMap((group) => group.wallets);

  const handleWalletSelect = (wallet: any) => {
    // Find the user wallet group for this wallet
    const userWalletGroup = (userWalletGroups || []).find(
      (uwg) => uwg._id === wallet.userWalletGroupId
    );
    if (userWalletGroup) {
      onWalletSelect?.(userWalletGroup);
    }
  };

  const handleManagePress = () => {
    setIsManageMode(!isManageMode);
    onManagePress?.();
  };

  const handleAddWalletPress = () => {
    // Close the wallet selector modal first
    onClose();
    // Navigate to the wallet creation screen
    router.push("/setup");
    onAddWalletPress?.();
  };

  const handleDeleteWallet = (wallet: any, event: any) => {
    console.log("🗑️ Delete wallet clicked:", wallet);
    event.stopPropagation(); // Prevent the parent Pressable from firing
    setLocalShowDeleteModal(true); // Show the local delete modal
    onDeleteWallet?.(wallet);
  };

  const handlePinSuccess = async (_: string) => {
    try {
      // Get SDK instance
      const sdk = getSDK();
      if (!sdk) {
        throw new Error("SDK not available");
      }

      // Debug the wallet structure
      console.log("🔍 walletToDelete structure:", JSON.stringify(walletToDelete, null, 2));
      console.log("🔍 walletToDelete.walletGroupId:", walletToDelete.walletGroupId);
      console.log("🔍 walletToDelete keys:", Object.keys(walletToDelete));

      // Call SDK to delete wallet group
      console.log(
        "🗑️ Calling SDK to delete wallet group:",
        walletToDelete.groupId
      );
      await zapSDKService.deleteWalletGroup(walletToDelete.groupId);

      console.log("✅ Wallet group deleted successfully");

      // Clear stored credentials for all user wallet groups in this wallet group
      try {
        const walletGroupId = walletToDelete.groupId;

        // Get all user wallet groups for this wallet group
        const allUserWalletGroups =
          userWalletGroups?.filter(
            (group) => group.walletGroupId._id === walletGroupId
          ) || [];

        console.log(
          `🧹 Clearing credentials for ${allUserWalletGroups.length} user wallet groups`
        );

        // Clear credentials for each user wallet group
        for (const userWalletGroupToDelete of allUserWalletGroups) {
          await WalletCredentialsStorage.deleteCredentialsByUserWalletGroupId(
            userWalletGroupToDelete._id
          );

          await PrivateKeysStorage.clearPrivateKeys(
            userWalletGroupToDelete._id
          );
          await AddressesStorage.clearAddresses(userWalletGroupToDelete._id);
        }

        console.log(
          "✅ Cleared stored credentials for all wallets in deleted wallet group"
        );
      } catch (error) {
        console.error("❌ Failed to clear stored credentials:", error);
        // Don't throw here, as the wallet group is already deleted on the server
      }

      // Close both modals
      console.log("🗑️ Closing PIN modal");
      await setShowPinModal(false);

      // Refresh wallet groups and portfolio
      await refreshUserWalletGroups();
      await refreshPortfolio();

      console.log("🗑️ Closing local delete modal");

      console.log("🗑️ Closing parent delete modal");
      await handleCancelDelete(); // This will close the parent's delete modal and reset state

      // Refresh wallet groups and portfolio
      await refreshUserWalletGroups();
      await refreshPortfolio();

      await setTimeout(() => {
        setLocalShowDeleteModal(false); // Close the local delete modal
      }, 1000);

      // Show success modal
      await setTimeout(() => {
        setShowSuccessModal(true);
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to delete wallet group:", error);
      // Close PIN modal on error
      setShowPinModal(false);
      // Show error message (we can create an error modal later if needed)
      Alert.alert("Error", "Failed to delete wallet group. Please try again.");
    }
  };

  // Simple test - if visible is true, show a basic modal
  if (!visible) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <Box flex={1} backgroundColor="modalBackgroundColor">
          <Pressable onPress={onClose}>
            <Box
              width={60}
              alignSelf="center"
              height={4}
              backgroundColor="white"
              borderRadius={2}
              marginTop="s"
            />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 25,
              paddingBottom: 100,
            }}
          >
            {/* Portfolio Value */}
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={12}
              padding="l"
              marginBottom="l"
              borderWidth={1}
              borderColor="borderColor"
            >
              <CustomText
                variant="body"
                fontSize={14}
                color="disabledTextColor"
                marginBottom="s"
                textAlign="center"
              >
                Est. Portfolio Value
              </CustomText>
              <CustomText
                variant="header"
                fontSize={28}
                color="headerTextColor"
                fontWeight="bold"
                textAlign="center"
              >
                {portfolioValue}
              </CustomText>
            </Box>

            {/* Tabs */}
            <Box
              flexDirection="row"
              alignItems="center"
              marginBottom="m"
              paddingHorizontal="s"
            >
              <Box flexDirection="row" flex={1} justifyContent="flex-start">
                <Pressable
                  onPress={() => setActiveTab("wallets")}
                  style={{ marginRight: 20 }}
                >
                  <CustomText
                    variant="bodyBold"
                    fontSize={16}
                    color={
                      activeTab === "wallets"
                        ? "headerTextColor"
                        : "disabledTextColor"
                    }
                  >
                    My wallets
                  </CustomText>
                </Pressable>
                <Pressable onPress={() => setActiveTab("watchlist")}>
                  <CustomText
                    variant="bodyBold"
                    fontSize={16}
                    color={
                      activeTab === "watchlist"
                        ? "headerTextColor"
                        : "disabledTextColor"
                    }
                  >
                    Watchlist
                  </CustomText>
                </Pressable>
              </Box>
              <Pressable onPress={handleManagePress}>
                <Box
                  backgroundColor={
                    isManageMode
                      ? "secondaryBackgroundColor"
                      : "modalBackgroundColor"
                  }
                  paddingHorizontal="s"
                  paddingVertical="s"
                  borderWidth={1}
                  borderColor="secondaryBackgroundColor"
                  borderRadius={20}
                  minWidth={60}
                  alignItems="center"
                >
                  <CustomText
                    variant="body"
                    fontSize={12}
                    color={isManageMode ? "white" : "headerTextColor"}
                  >
                    {isManageMode ? "Done" : "Manage"}
                  </CustomText>
                </Box>
              </Pressable>
            </Box>

            {/* Show/Hide Groups Toggle */}
            <Pressable
              onPress={() => setShowGroups(!showGroups)}
              style={{ marginBottom: 20, alignSelf: "flex-start" }}
            >
              <Box
                backgroundColor="secondaryBackgroundColor"
                paddingHorizontal="s"
                paddingVertical="s"
                borderRadius={20}
              >
                <CustomText
                  variant="body"
                  fontSize={12}
                  color="headerTextColor"
                >
                  {showGroups ? "Hide Groups" : "Show Groups"}
                </CustomText>
              </Box>
            </Pressable>

            {/* Wallet Groups or Flat List */}
            {activeTab === "wallets" && (
              <>
                {processedWalletGroups.length === 0 ? (
                  <Box alignItems="center" paddingVertical="xl">
                    <CustomText
                      variant="body"
                      fontSize={16}
                      color="disabledTextColor"
                    >
                      No wallet groups found
                    </CustomText>
                  </Box>
                ) : showGroups ? (
                  // Show grouped wallets
                  processedWalletGroups.map((group) => (
                    <Box key={group.id} marginBottom="l">
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="m"
                      >
                        <CustomText
                          variant="bodyBold"
                          fontSize={16}
                          color="headerTextColor"
                        >
                          {group.name}
                        </CustomText>
                        <CustomText
                          variant="body"
                          fontSize={14}
                          color="disabledTextColor"
                        >
                          {group.totalValue}
                        </CustomText>
                      </Box>
                      {group.wallets.map((wallet: any) => (
                        <Pressable
                          key={wallet.id}
                          onPress={() => handleWalletSelect(wallet)}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.5 : 1,
                          })}
                        >
                          <Box
                            flexDirection="row"
                            alignItems="center"
                            paddingVertical="m"
                            paddingHorizontal="m"
                            backgroundColor="modalBackgroundColor"
                            borderRadius={12}
                            marginBottom="s"
                            borderWidth={1}
                            borderColor="borderColor"
                          >
                            <Box marginRight="m">
                              <Identicon value={wallet?.name || wallet._id || "0x0000000000000000000000000000000000000000"} size={40} />
                            </Box>
                            <Box flex={1}>
                              <CustomText
                                variant="bodyBold"
                                fontSize={16}
                                color="headerTextColor"
                              >
                                {wallet.name}
                              </CustomText>
                              <CustomText
                                variant="body"
                                fontSize={14}
                                color="disabledTextColor"
                              >
                                {wallet.balance}
                              </CustomText>
                            </Box>
                            {isManageMode ? (
                              <Pressable
                                onPress={(event) =>
                                  handleDeleteWallet(wallet, event)
                                }
                                style={({ pressed }) => ({
                                  padding: 8,
                                  opacity: pressed ? 0.5 : 1,
                                })}
                              >
                                <ThemedDeleteIcon />
                              </Pressable>
                            ) : (
                              <>
                                {selectedWalletGroupId ===
                                  wallet.userWalletGroupId && (
                                  <Box marginRight="s">
                                    <ThemedCheckIcon />
                                  </Box>
                                )}
                              </>
                            )}
                          </Box>
                        </Pressable>
                      ))}
                    </Box>
                  ))
                ) : (
                  // Show flat list
                  allWallets.map((wallet: any) => {
                    return (
                      <Pressable
                        key={wallet.id}
                        onPress={() => handleWalletSelect(wallet)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.5 : 1,
                        })}
                      >
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          paddingVertical="m"
                          paddingHorizontal="m"
                          backgroundColor="modalBackgroundColor"
                          borderRadius={12}
                          marginBottom="s"
                          borderWidth={1}
                          borderColor="borderColor"
                        >
                          <Box marginRight="m">
                            <Identicon value={wallet?.name || wallet._id || "0x0000000000000000000000000000000000000000"} size={40} />
                          </Box>
                          <Box flex={1}>
                            <CustomText
                              variant="bodyBold"
                              fontSize={16}
                              color="headerTextColor"
                            >
                              {wallet.name}
                            </CustomText>
                            <CustomText
                              variant="body"
                              fontSize={14}
                              color="disabledTextColor"
                            >
                              {wallet.balance}
                            </CustomText>
                          </Box>
                          {isManageMode ? (
                            <Pressable
                              onPress={(event) =>
                                handleDeleteWallet(wallet, event)
                              }
                              style={({ pressed }) => ({
                                padding: 8,
                                opacity: pressed ? 0.5 : 1,
                              })}
                            >
                              <ThemedDeleteIcon />
                            </Pressable>
                          ) : (
                            <>
                              {selectedWalletGroupId ===
                                wallet.userWalletGroupId && (
                                <Box marginRight="s">
                                  <ThemedCheckIcon />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Pressable>
                    );
                  })
                )}
              </>
            )}

            {/* Watchlist Tab */}
            {activeTab === "watchlist" && (
              <Box alignItems="center" paddingVertical="xl">
                <CustomText
                  variant="body"
                  fontSize={16}
                  color="disabledTextColor"
                >
                  No watchlist items yet
                </CustomText>
              </Box>
            )}
          </ScrollView>

          {/* Add New Wallet Button */}
          <Box
            paddingHorizontal="m"
            paddingVertical="m"
            pb="xl"
            borderTopColor="borderColor"
          >
            <CustomButton
              bgColor={theme.colors.primaryColor}
              text="Add New Wallet"
              leadingIcon={<ThemedAddIcon />}
              onPress={handleAddWalletPress}
              width="100%"
              borderRadius={50}
            />
          </Box>
        </Box>

        {/* Remove Wallet Modal - Outside main modal */}
        <RemoveWalletModal
          visible={localShowDeleteModal}
          onClose={() => {
            console.log("🗑️ Cancel delete clicked");
            setLocalShowDeleteModal(false);
            handleCancelDelete();
          }}
          onConfirm={() => {
            console.log("🗑️ Confirm delete clicked - showing PIN modal");
            setShowPinModal(true);
          }}
          walletName={walletToDelete?.name || "wallet group"}
          showPinModal={showPinModal}
          setShowPinModal={setShowPinModal}
          handlePinSuccess={handlePinSuccess}
        />
        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Wallet Deleted"
          message="Wallet group has been successfully deleted from your account."
          buttonText="Continue"
          onButtonPress={() => setShowSuccessModal(false)}
        />

      </Modal>
    </>
  );
};

WalletSelectorBottomSheet.displayName = "WalletSelectorBottomSheet";

export default WalletSelectorBottomSheet;

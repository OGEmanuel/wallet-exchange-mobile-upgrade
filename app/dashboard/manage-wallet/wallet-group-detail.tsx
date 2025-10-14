import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import { AppBar, CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import Identicon from "@/components/general/Identicon";
import AddWalletModal from "@/components/Modals/AddWalletModal";
import RemoveWalletModal from "@/components/Modals/RemoveWalletModal";
import SuccessModal from "@/components/Modals/SuccessModal";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import AddressesStorage from "@/src/core/storage/addresses-storage";
import PrivateKeysStorage from "@/src/core/storage/private-keys-storage";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { listWalletGroupBackups } from "@/src/core/utils/backup-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { ArrowLeft, ChevronRight, CloudOff, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";

interface WalletGroupDetailProps {}

const WalletGroupDetail: React.FC<WalletGroupDetailProps> = () => {
  const theme = useTheme<Theme>();
  const {
    userWalletGroups,
    currentWalletUser,
    getSDK,
    refreshPortfolio,
    refreshUserWalletGroups,
    isCreatingWallet: contextIsCreatingWallet,
    setIsCreatingWallet,
  } = useWallet();
  const { walletGroupId } = useLocalSearchParams<{ walletGroupId: string }>();

  // State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isBackedUp, setIsBackedUp] = useState(false);
  const [isCheckingBackup, setIsCheckingBackup] = useState(true);

  // Find the wallet group and get all wallets in this group
  console.log(
    "🔍 Wallet Group Detail - Looking for walletGroupId:",
    walletGroupId
  );
  console.log(
    "🔍 Available wallet groups:",
    userWalletGroups?.map((g) => ({
      id: g._id,
      walletGroupId: g.walletGroupId?._id,
      walletGroupName: g.walletGroupId?.name,
    }))
  );

  const userWalletGroup = userWalletGroups?.find(
    (group) => group.walletGroupId._id === walletGroupId
  );

  console.log("🔍 Found wallet group:", userWalletGroup ? "Yes" : "No");

  // Get all wallets that belong to this wallet group
  const walletsInGroup =
    userWalletGroups?.filter(
      (userWalletGroup) => userWalletGroup.walletGroupId._id === walletGroupId
    ) || [];

  // Check if wallet group is backed up
  const checkBackupStatus = useCallback(async () => {
    if (!userWalletGroup) return;

    try {
      setIsCheckingBackup(true);
      const backups = await listWalletGroupBackups();
      const isBackedUp = backups.some(
        (backup) => backup.id === userWalletGroup.walletGroupId._id
      );
      setIsBackedUp(isBackedUp);
    } catch (error) {
      console.error("Error checking backup status:", error);
      setIsBackedUp(false);
    } finally {
      setIsCheckingBackup(false);
    }
  }, [userWalletGroup]);

  useEffect(() => {
    checkBackupStatus();
  }, [userWalletGroup, checkBackupStatus]);

  // Early return after all hooks are called
  if (!userWalletGroup) {
    return (
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <AppBar
          title="Wallet Group"
          leading={<ArrowLeft size={24} color={theme.colors.headerTextColor} />}
        />
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="disabledTextColor">
            Wallet group not found
          </CustomText>
        </Box>
      </Box>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(userWalletGroup.walletGroupId.name || "Wallet Group");
  };

  const handleSaveName = async () => {
    try {
      setIsUpdatingName(true);
      const sdk = getSDK();
      if (!sdk) {
        throw new Error("SDK not available");
      }

      // Update wallet group name via SDK
      await zapSDKService.updateWalletGroup(
        userWalletGroup?.walletGroupId?._id,
        {
          name: editedName,
        }
      );

      // Update the local wallet group name immediately
      if (userWalletGroup) {
        userWalletGroup.walletGroupId.name = editedName;
      }

      setIsEditingName(false);
      await refreshPortfolio(); // Refresh to get updated data
    } catch (error) {
      console.error("Failed to update wallet group name:", error);
      Alert.alert("Error", "Failed to update wallet group name");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleRemoveWalletGroup = () => {
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    setShowPinModal(true);
  };

  const handlePinSuccess = async (pin: string) => {
    try {
      const sdk = getSDK();
      if (!sdk) {
        throw new Error("SDK not available");
      }

      await zapSDKService.deleteWalletGroup(userWalletGroup.walletGroupId._id);

      // Clear stored credentials for all user wallet groups in this wallet group
      try {
        const walletGroupId = userWalletGroup.walletGroupId._id;

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

      // Close PIN modal first
      setShowPinModal(false);

      // Wait 1 second before closing remove modal
      setTimeout(() => {
        setShowRemoveModal(false);

        // Wait another 1 second before showing success modal
        setTimeout(() => {
          setShowSuccessModal(true);

          // After showing success modal, refresh wallet groups and navigate
          setTimeout(async () => {
            setShowSuccessModal(false);

            // Refresh wallet groups first to get updated list
            await refreshUserWalletGroups();
            await refreshPortfolio();

            // Wait a bit for state to update, then navigate
            setTimeout(async () => {
              try {
                // Get fresh wallet groups directly from SDK to ensure we have the latest data
                if (!currentWalletUser) {
                  router.replace("/dashboard/home/wallet-home/home");
                  return;
                }
                const freshWalletGroups =
                  await zapSDKService.getUserWalletGroups(currentWalletUser);
                const walletGroupsArray = Array.isArray(freshWalletGroups)
                  ? freshWalletGroups
                  : freshWalletGroups?.userWalletGroups || [];

                // Filter out the deleted wallet group
                const remainingWalletGroups = walletGroupsArray.filter(
                  (group) =>
                    group.walletGroupId._id !==
                    userWalletGroup.walletGroupId._id
                );

                if (remainingWalletGroups.length > 0) {
                  // Navigate to the first remaining wallet group
                  const nextWalletGroup = remainingWalletGroups[0];
                  router.replace(
                    `/dashboard/manage-wallet/wallet-group-detail?walletGroupId=${nextWalletGroup.walletGroupId._id}`
                  );
                } else {
                  router.replace("/select-track");
                }
              } catch (navError) {
                console.error("Navigation error:", navError);
                router.replace("/dashboard/home/wallet-home/home");
              }
            }, 500); // Wait for state to update
          }, 2000); // Show success modal for 2 seconds
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to delete wallet group:", error);
      setShowPinModal(false);
      Alert.alert("Error", "Failed to delete wallet group. Please try again.");
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleWalletPress = (userWalletGroup: any) => {
    router.push(
      `/dashboard/manage-wallet/wallet-detail?walletId=${userWalletGroup?.walletId?._id}`
    );
  };

  const handleRecoveryPhrase = () => {
    // TODO: Navigate to recovery phrase screen
    Alert.alert("Recovery Phrase", "Navigate to recovery phrase screen");
  };

  const handleBackupWallet = () => {
    if (isBackedUp) {
      Alert.alert(
        "Already Backed Up",
        "This wallet group is already backed up to iCloud."
      );
      return;
    }
    router.push(
      `/dashboard/manage-wallet/backup-wallet?walletGroupId=${userWalletGroup?.walletGroupId._id}`
    );
  };

  const handleAddWallet = () => {
    setShowAddWalletModal(true);
  };

  const handleAddWalletSubmit = async (walletName: string) => {
    try {
      setIsCreatingWallet(true); // Set context flag to prevent retry mechanism
      const sdk = getSDK();
      if (!sdk) {
        throw new Error("SDK not available");
      }

      // Get the seed phrase from secure storage
      const walletGroupCredential =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          userWalletGroup?._id
        );

      if (!walletGroupCredential?.credential) {
        throw new Error("Seed phrase not found for this wallet group");
      }

      // Use the comprehensive SDK service function
      const result = await zapSDKService.createWalletInGroup({
        walletGroupId: userWalletGroup?.walletGroupId._id,
        name: walletName,
        seedPhrase: walletGroupCredential.credential,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create wallet");
      }

      console.log("✅ Wallet created successfully:", result);

      // Close modal and show success
      setShowAddWalletModal(false);
      Alert.alert("Success", `Wallet '${walletName}' created successfully!`);

      // Refresh wallet groups and portfolio to show new wallet
      await refreshUserWalletGroups();
      await refreshPortfolio();
    } catch (error) {
      console.error("❌ Failed to create wallet:", error);
      Alert.alert("Error", "Failed to create wallet. Please try again.");
    } finally {
      setIsCreatingWallet(false); // Reset context flag
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingTop="xl"
        backgroundColor="mainBackgroundColor"
      >
        <AppBar
          title={userWalletGroup.walletGroupId.name || "Wallet Group"}
          leading={
            <ArrowLeft2
              onPress={handleBack}
              size={24}
              color={theme.colors.headerTextColor}
            />
          }
        />
      </Box>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Group Name Section */}
        <Box
          backgroundColor="modalBackgroundColor"
          borderRadius={12}
          borderColor="borderColor"
          padding="m"
          marginBottom="l"
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            height={30}
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
                {userWalletGroup.walletGroupId.name || "Wallet Group"}
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

        {/* Backup Section */}
        <Box marginBottom="l">
          <CustomText
            variant="bodyBold"
            color="headerTextColor"
            marginBottom="m"
          >
            Backup
          </CustomText>

          <Box
            backgroundColor="modalBackgroundColor"
            borderRadius={12}
            borderColor="borderColor"
            padding="m"
          >
            <Pressable
              onPress={handleRecoveryPhrase}
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
                  Recovery phrase
                </CustomText>
                <ChevronRight size={20} color={theme.colors.headerTextColor} />
              </Box>
            </Pressable>

            <Box height={1} marginVertical="s" />

            <Pressable
              onPress={handleBackupWallet}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              disabled={isCheckingBackup}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="s"
              >
                <Box flexDirection="row" alignItems="center" flex={1}>
                  <CustomText
                    variant="body"
                    fontSize={16}
                    color="headerTextColor"
                    marginRight="s"
                  >
                    {isCheckingBackup
                      ? "Checking backup status..."
                      : isBackedUp
                      ? "Backed up to iCloud"
                      : "Backup wallet"}
                  </CustomText>
                  {!isCheckingBackup && (
                    <Box
                      backgroundColor={
                        isBackedUp ? "primaryColor" : "secondaryBackgroundColor"
                      }
                      paddingHorizontal="s"
                      paddingVertical="s"
                      borderRadius={12}
                      flexDirection="row"
                      alignItems="center"
                    >
                      {!isBackedUp && (
                        <CloudOff
                          size={12}
                          color={theme.colors.placeholderTextColor}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <CustomText
                        variant="body"
                        fontSize={12}
                        color={isBackedUp ? "white" : "placeholderTextColor"}
                      >
                        {isBackedUp ? "Backed up" : "Not Backed Up"}
                      </CustomText>
                    </Box>
                  )}
                </Box>
                {!isCheckingBackup && (
                  <ChevronRight
                    size={20}
                    color={theme.colors.headerTextColor}
                  />
                )}
              </Box>
            </Pressable>
          </Box>
        </Box>

        {/* Wallets Section */}
        <Box marginBottom="xl">
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="m"
          >
            <CustomText variant="bodyBold" color="headerTextColor">
              Wallets
            </CustomText>
            <Pressable
              onPress={handleAddWallet}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
              })}
            >
              <Plus color={theme.colors.white} />
              <CustomText variant="body" fontSize={14} color="white" ml="s">
                Add Wallet
              </CustomText>
            </Pressable>
          </Box>

          <Box
            backgroundColor="modalBackgroundColor"
            borderRadius={12}
            borderColor="borderColor"
            padding="m"
          >
            {walletsInGroup.map((userWalletGroup: any, index: number) => {
              const wallet = userWalletGroup.walletId;
              const walletName =
                userWalletGroup.name ||
                wallet?.name ||
                `Wallet ${wallet?._id?.slice(-4) || "Unknown"}`;
              const walletAddress = wallet?.address || "0x...";
              const walletBalance = wallet?.totalUsdValue
                ? `$${wallet.totalUsdValue}`
                : "$0.00";

              return (
                <Pressable
                  key={userWalletGroup._id || index}
                  onPress={() => handleWalletPress(userWalletGroup)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    paddingVertical="s"
                    borderBottomColor="borderColor"
                  >
                    <Box marginRight="m" borderRadius={5} overflow="hidden">
                      <Identicon
                        value={
                          userWalletGroup.name ||
                          wallet?.name ||
                          wallet?._id ||
                          "0x0000000000000000000000000000000000000000"
                        }
                        size={32}
                      />
                    </Box>
                    <Box flex={1}>
                      <CustomText
                        variant="bodyBold"
                        fontSize={16}
                        color="headerTextColor"
                      >
                        {walletName}
                      </CustomText>
                      <CustomText
                        variant="body"
                        fontSize={14}
                        color="disabledTextColor"
                      >
                        {walletBalance}
                      </CustomText>
                    </Box>
                    <ChevronRight
                      size={20}
                      color={theme.colors.headerTextColor}
                    />
                  </Box>
                </Pressable>
              );
            })}
          </Box>
        </Box>
      </ScrollView>

      {/* Remove Wallet Group Button */}
      <Box
        paddingHorizontal="l"
        paddingBottom="xl"
        backgroundColor="mainBackgroundColor"
      >
        <CustomButton
          bgColor="rgba(147, 75, 80, 0.4)"
          color="rgba(255, 105, 106, 1)"
          text="Remove Wallet Group"
          onPress={handleRemoveWalletGroup}
          width="100%"
          borderRadius={30}
          paddingVertical={16}
        />
      </Box>

      {/* Remove Wallet Modal */}
      <RemoveWalletModal
        visible={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleConfirmRemove}
        walletName={userWalletGroup.walletGroupId.name || "wallet group"}
        showPinModal={showPinModal}
        setShowPinModal={setShowPinModal}
        handlePinSuccess={handlePinSuccess}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Wallet Group Removed"
        message="The wallet group has been successfully removed."
        buttonText="Continue"
        onButtonPress={handleSuccessContinue}
      />

      {/* Add Wallet Modal */}
      <AddWalletModal
        walletCount={walletsInGroup.length + 1}
        isVisible={showAddWalletModal}
        onClose={() => setShowAddWalletModal(false)}
        onAddWallet={handleAddWalletSubmit}
        isLoading={contextIsCreatingWallet}
      />
    </Box>
  );
};

export default WalletGroupDetail;

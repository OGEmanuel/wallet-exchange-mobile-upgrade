import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import Identicon from "@/components/general/Identicon";
import ImportWalletModal from "@/components/Modals/ImportWalletModal";
import { useAggregatedBalances } from "@/hooks/useAggregatedBalances";
import { listWalletGroupBackups } from "@/src/core/utils/backup-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronRight, CloudOff, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ManageWalletScreen = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { userWalletGroups, refreshUserWalletGroups } = useWallet();
  const { getEnhancedWalletGroups } = useAggregatedBalances();
  const [activeTab, setActiveTab] = useState<"wallets" | "watchlist">(
    "wallets"
  );
  const [backupStatuses, setBackupStatuses] = useState<Record<string, boolean>>(
    {}
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showImportWalletModal, setShowImportWalletModal] = useState(false);
  // Animation values
  const underlineAnimation = useRef(new Animated.Value(0)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserWalletGroups();
    } catch (error) {
      console.error("Failed to refresh wallet groups:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check backup status for all wallet groups
  const checkBackupStatuses = useCallback(async () => {
    try {
      const backups = await listWalletGroupBackups();
      const statuses: Record<string, boolean> = {};

      (userWalletGroups || []).forEach((userWalletGroup) => {
        const walletGroupId = userWalletGroup.walletGroupId?._id;
        if (walletGroupId) {
          statuses[walletGroupId] = backups.some(
            (backup) => backup.id === walletGroupId
          );
        }
      });

      setBackupStatuses(statuses);
    } catch (error) {
      console.error("Error checking backup statuses:", error);
    }
  }, [userWalletGroups]);

  useEffect(() => {
    checkBackupStatuses();
  }, [userWalletGroups, checkBackupStatuses]);

  // Format currency values to show appropriate decimal places
  const formatCurrency = (value: number): string => {
    if (value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 100) return `$${value.toFixed(2)}`;
    return `$${value.toFixed(2)}`;
  };

  // Process and group wallet groups from context
  // Use cached aggregated balances instead of manual calculation
  const enhancedWalletGroups = getEnhancedWalletGroups();

  const walletGroupsMap = new Map();

  enhancedWalletGroups.forEach((userWalletGroup: any) => {
    // Get the actual wallet group ID and name
    const walletGroupId = userWalletGroup.walletGroupId?._id;
    const walletGroupName =
      userWalletGroup.walletGroupId?.name ||
      `Wallet Group ${walletGroupId?.slice(-4) || "Unknown"}`;

    // Get wallet info
    const walletInfo = userWalletGroup.walletId;
    const walletName =
      userWalletGroup?.name ||
      walletInfo?.name ||
      `Wallet ${userWalletGroup?._id?.slice(-4) || "Unknown"}`;

    // Use aggregated balance instead of manual calculation
    const totalValue = userWalletGroup.aggregatedBalance || 0;
    const formattedValue = formatCurrency(totalValue);

    // If this wallet group doesn't exist in our map, create it
    if (!walletGroupsMap.has(walletGroupId)) {
      walletGroupsMap.set(walletGroupId, {
        id: walletGroupId,
        name: walletGroupName,
        totalValue: "$0.00", // Will be calculated from all wallets
        wallets: [],
        isBackedUp: backupStatuses[walletGroupId] || false,
      });
    }

    // Add this wallet to the group
    const group = walletGroupsMap.get(walletGroupId);
    group.wallets.push({
      id: walletInfo?._id,
      name: walletName,
      address: walletInfo?.address || "0x...",
      balance: formattedValue,
      userWalletGroupId: userWalletGroup._id,
    });
  });

  // Convert map to array and calculate total values using aggregated balances
  const processedWalletGroups = Array.from(walletGroupsMap.values()).map(
    (group) => {
      // Calculate total value for the group using aggregated balances
      const totalValue = group.wallets.reduce((sum: number, wallet: any) => {
        const value = parseFloat(wallet.balance.replace("$", "")) || 0;
        return sum + value;
      }, 0);

      return {
        ...group,
        totalValue: formatCurrency(totalValue),
      };
    }
  );

  const handleCreateWallet = () => {
    router.push("/setup");
  };

  const handleImportWallet = () => {
    // Pop up import wallet modal
    setShowImportWalletModal(true);
  };

  const handleWalletGroupPress = (group: any) => {
    router.push(
      `/dashboard/manage-wallet/wallet-group-detail?walletGroupId=${group.id}`
    );
  };

  // const handleWalletPress = (wallet: any) => {
  //   // Navigate to wallet details
  //   console.log("Navigate to wallet:", wallet.name);
  // };

  // Animation functions
  const animateTabSwitch = (newTab: "wallets" | "watchlist") => {
    const isWallets = newTab === "wallets";

    // Fade out current content
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnimation, {
        toValue: isWallets ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update tab
      setActiveTab(newTab);

      // Animate underline position
      Animated.timing(underlineAnimation, {
        toValue: isWallets ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Fade in new content
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <ImportWalletModal
        isOpen={showImportWalletModal}
        onClose={() => setShowImportWalletModal(false)}
      />
      {/* Custom Header */}
      <Box style={{ paddingTop: insets.top }}>
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="l"
          paddingVertical="m"
          backgroundColor="mainBackgroundColor"
        >
          <Pressable onPress={() => router.back()}>
            <X size={24} color={theme.colors.white} />
          </Pressable>
          <CustomText
            variant="header"
            fontSize={20}
            color="headerTextColor"
            fontWeight="bold"
          >
            Manage Wallet
          </CustomText>
          <Box width={24} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        flexDirection="row"
        alignItems="center"
        marginBottom="l"
        marginTop="s"
        width="100%"
        position="relative"
        height={40}
      >
        <Pressable
          onPress={() => animateTabSwitch("wallets")}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <CustomText
            variant="body"
            fontSize={14}
            color={
              activeTab === "wallets" ? "headerTextColor" : "disabledTextColor"
            }
          >
            My wallets
          </CustomText>
          <Box height={2} backgroundColor="disabledTextColor" width="100%" />
        </Pressable>
        <Pressable
          onPress={() => animateTabSwitch("watchlist")}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <CustomText
            variant="body"
            fontSize={14}
            color={
              activeTab === "watchlist"
                ? "headerTextColor"
                : "disabledTextColor"
            }
          >
            Watchlist
          </CustomText>
          <Box height={2} backgroundColor="disabledTextColor" width="100%" />
        </Pressable>

        {/* Animated Underline */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            height: 3,
            backgroundColor: theme.colors.secondaryColor,
            borderRadius: 1.5,
            width: "50%",
            transform: [
              {
                translateX: underlineAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, SCREEN_WIDTH * 0.5],
                }),
              },
            ],
          }}
        />
      </Box>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primaryColor}
          />
        }
      >
        {/* Wallet Groups */}
        {activeTab === "wallets" && (
          <Animated.View
            style={{
              opacity: fadeAnimation,
              transform: [{ translateY: contentAnimation }],
            }}
          >
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
            ) : (
              processedWalletGroups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => handleWalletGroupPress(group)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Box
                    key={group.id}
                    marginBottom="s"
                    backgroundColor="mainBackgroundColor"
                    borderRadius={12}
                    borderWidth={1}
                    borderColor="borderColor"
                    padding="m"
                  >
                    {/* Wallet Group Header */}
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      marginBottom="m"
                      paddingVertical="s"
                    >
                      <Box flexDirection="row" alignItems="center" flex={1}>
                        <CustomText
                          variant="body"
                          fontSize={16}
                          color="placeholderTextColor"
                          marginRight="s"
                        >
                          {group.name}
                        </CustomText>
                        <Box
                          backgroundColor="secondaryBackgroundColor"
                          paddingHorizontal="s"
                          paddingVertical="s"
                          borderRadius={12}
                          marginRight="s"
                        >
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="disabledTextColor"
                          >
                            {group.wallets.length}{" "}
                            {group.wallets.length === 1 ? "wallet" : "wallets"}
                          </CustomText>
                        </Box>
                        <Box
                          backgroundColor={
                            group.isBackedUp
                              ? "primaryColor"
                              : "secondaryBackgroundColor"
                          }
                          paddingHorizontal="s"
                          paddingVertical="s"
                          borderRadius={12}
                          flexDirection="row"
                          alignItems="center"
                        >
                          {!group.isBackedUp && (
                            <CustomText
                              color="placeholderTextColor"
                              marginRight="s"
                            >
                              <CloudOff
                                size={12}
                                color={theme.colors.placeholderTextColor}
                              />
                            </CustomText>
                          )}
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color={
                              group.isBackedUp
                                ? "white"
                                : "placeholderTextColor"
                            }
                          >
                            {group.isBackedUp ? "Backed Up" : "Not Backed Up"}
                          </CustomText>
                        </Box>
                      </Box>
                      <CustomText
                        variant="body"
                        fontSize={16}
                        color="disabledTextColor"
                      >
                        <ChevronRight
                          size={24}
                          color={theme.colors.placeholderTextColor}
                        />
                      </CustomText>
                    </Box>

                    {/* Individual Wallets */}
                    {group.wallets.map((wallet: any) => (
                      <Box key={wallet.id}>
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          paddingVertical="s"
                          paddingHorizontal="m"
                          marginBottom="s"
                          borderColor="borderColor"
                        >
                          <Box marginRight="m">
                            <Identicon
                              value={
                                wallet?.name ||
                                wallet._id ||
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
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Pressable>
              ))
            )}
          </Animated.View>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <Animated.View
            style={{
              opacity: fadeAnimation,
              transform: [{ translateY: contentAnimation }],
            }}
          >
            <Box alignItems="center" paddingVertical="xl">
              <CustomText
                variant="body"
                fontSize={16}
                color="disabledTextColor"
              >
                No watchlist items yet
              </CustomText>
            </Box>
          </Animated.View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <Box
        paddingHorizontal="l"
        paddingVertical="l"
        style={{
          paddingBottom: insets.bottom + 20,
        }}
        backgroundColor="mainBackgroundColor"
        borderTopColor="borderColor"
      >
        <CustomButton
          bgColor={theme.colors.primaryColor}
          text="Create new wallet"
          onPress={handleCreateWallet}
          width="100%"
          borderRadius={25}
          paddingVertical={16}
        />
        <Box height={15} />
        <CustomButton
          bgColor="transparent"
          text="Import Existing Wallet"
          onPress={handleImportWallet}
          width="100%"
          borderRadius={25}
          borderWidth={1}
          borderColor={theme.colors.borderColor}
          color={theme.colors.headerTextColor}
        />
      </Box>
    </Box>
  );
};

export default ManageWalletScreen;

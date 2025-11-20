import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import DeleteAddressModal from "@/components/Modals/DeleteAddressModal";
import { useAddressBookSDK } from "@/hooks/useAddressBookSDK";
import { useChains } from "@/src/core/chains/chains-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tab component matching ActivityTabar style
const AddressBookTabar = ({ 
  activeTab, 
  onPress 
}: { 
  activeTab: "exchange" | "wallet"; 
  onPress: (tab: "exchange" | "wallet") => void; 
}) => {
  const theme = useTheme<Theme>();
  const slideAnim = useRef(
    new Animated.Value(activeTab === "exchange" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "exchange" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabPress = (tab: "exchange" | "wallet") => {
    onPress(tab);
  };

  return (
    <Box
      width={"100%"}
      height={40}
      bg="secondaryBackgroundColor"
      borderRadius={40}
      alignItems="center"
      flexDirection="row"
      px="s"
      position="relative"
    >
      {/* Sliding background */}
      <Animated.View
        style={{
          position: "absolute",
          width: "50%",
          height: 32,
          borderRadius: 50,
          backgroundColor: theme.colors.white,
          left: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["2%", "53%"],
          }),
          top: 4,
        }}
      />

      <Pressable
        style={{ width: "50%", zIndex: 0 }}
        onPress={() => {
          handleTabPress("exchange");
        }}
      >
        <View
          style={{
            width: "100%",
            height: 32,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomText
            variant="body"
            fontSize={14}
            color={activeTab === "exchange" ? "black" : "disabledTextColor"}
          >
            Exchange
          </CustomText>
        </View>
      </Pressable>
      <Pressable
        style={{ width: "50%", zIndex: 0 }}
        onPress={() => {
          handleTabPress("wallet");
        }}
      >
        <View
          style={{
            width: "100%",
            height: 32,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomText
            variant="body"
            fontSize={14}
            color={activeTab === "wallet" ? "black" : "disabledTextColor"}
          >
            Wallet
          </CustomText>
        </View>
      </Pressable>
    </Box>
  );
};

const EmptyState = ({ onAddAddress, isExchangeTab = false }: { onAddAddress: () => void; isExchangeTab?: boolean }) => {
  return (
    <Box width={"100%"} flex={1} alignItems="center" justifyContent="center">
      <Image
        source={require("@/assets/images/addressbook.png")}
        style={{ width: 250, height: 250 }}
        contentFit="contain"
      />
      <CustomText variant="subheader">No Contacts</CustomText>
      <CustomText textAlign="center" style={{ width: "70%" }} mt="m">
        {isExchangeTab 
          ? "Add your exchange addresses to manage them here. Address fetching will be available soon."
          : "You need to add your addresses to view a list of addresses here"
        }
      </CustomText>
        <Box height={30} />
      <CustomButton
        width={"70%"}
        text="Add address"
        onPress={onAddAddress}
        borderRadius={50}
      />
    </Box>
  );
};

const Addresses = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { getChainById } = useChains();
  const [activeTab, setActiveTab] = useState<"exchange" | "wallet">("wallet");
  const { tokenId } = useLocalSearchParams<{ tokenId?: string }>();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; name: string; address: string } | null>(null);
  const {
    addresses,
    isLoading,
    error,
    getUserAddresses,
    deleteAddressBook,
    clearError,
  } = useAddressBookSDK();

  const handleAddAddress = () => {
    router.push("/dashboard/home/address-book/add-address");
  };

  // Fetch addresses when tab changes or page comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchAddresses = async () => {
        try {
          await getUserAddresses(activeTab);
        } catch (err) {
          console.error("Failed to fetch addresses:", err);
        }
      };
      fetchAddresses();
    }, [activeTab, getUserAddresses])
  );

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDelete = (addressId: string, name: string, address: string) => {
    setAddressToDelete({ id: addressId, name, address });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddressBook(addressToDelete.id);
      // Refresh addresses after deletion
      await getUserAddresses(activeTab);
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    } catch {
      Alert.alert("Error", "Failed to delete address");
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setAddressToDelete(null);
  };

  const handleSelectAddress = (address: string) => {
    // Navigate back to send screen with the selected address
    // Always navigate to send screen with address parameter
    // If we have a tokenId, include it to preserve the selected token
    const params: any = { address: address };
    if (tokenId) {
      params.tokenId = tokenId;
    }
    
    router.push({
      pathname: "/dashboard/home/send-token",
      params: params,
    });
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const chain = getChainById(item.chainId);
    const chainName = chain?.name || item.chainName || "Unknown Chain";

    return (
      <Pressable
        onPress={() => handleSelectAddress(item.address)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="m"
          paddingHorizontal="m"
          borderBottomWidth={1}
          borderBottomColor="secondaryBackgroundColor"
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              bg="fadedPrimary"
              alignItems="center"
              justifyContent="center"
              marginRight="m"
            >
              <CustomText color="white" fontSize={16} fontWeight="bold">
                {item.name.charAt(0).toUpperCase()}
              </CustomText>
            </Box>

            <Box flex={1}>
              <CustomText variant="bodyBold" color="headerTextColor" marginBottom="s">
                {item.name}
              </CustomText>
              <CustomText variant="body" color="bodyTextColor" fontSize={12} marginBottom="s">
                {formatAddress(item.address)}
              </CustomText>
              {chainName && (
                <CustomText variant="body" color="disabledTextColor" fontSize={11}>
                  {chainName}
                </CustomText>
              )}
            </Box>
          </Box>

          <Pressable
            onPress={() => handleDelete(item._id, item.name, item.address)}
            style={{ padding: 8 }}
          >
            <MoreVertical size={20} color={theme.colors.bodyTextColor} />
          </Pressable>
        </Box>
      </Pressable>
    );
  };

  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <SettingsHeader title="Address book" onBackPress={() => router.back()} />
        
        <Box paddingHorizontal="m" paddingTop="m">
          <AddressBookTabar activeTab={activeTab} onPress={setActiveTab} />
        </Box>

        <Box flex={1} marginTop="m">
          {isLoading && addresses.length === 0 ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color={theme.colors.primaryColor} />
              <CustomText marginTop="m" color="bodyTextColor">
                Loading addresses...
              </CustomText>
            </Box>
          ) : error ? (
            <Box flex={1} justifyContent="center" alignItems="center" paddingHorizontal="l">
              <CustomText color="error" textAlign="center" marginBottom="m">
                {error}
              </CustomText>
              <CustomButton
                text="Retry"
                onPress={() => {
                  clearError();
                  getUserAddresses(activeTab);
                }}
                width="70%"
              />
            </Box>
          ) : addresses.length === 0 ? (
            <EmptyState onAddAddress={handleAddAddress} isExchangeTab={activeTab === "exchange"} />
          ) : (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              ListFooterComponent={
                <Box paddingVertical="l" alignItems="center">
                  <CustomButton
                    text="Add New Address"
                    onPress={handleAddAddress}
                    width="70%"
                    borderRadius={50}
                  />
                </Box>
              }
            />
          )}
        </Box>
      </Box>

      <DeleteAddressModal
        visible={deleteModalVisible}
        addressName={addressToDelete?.name || ""}
        address={addressToDelete?.address || ""}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </PageWrapper>
  );
};

export default Addresses;
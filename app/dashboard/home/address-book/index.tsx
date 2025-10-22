import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

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

const ItemCard = () => {
  const theme = useTheme<Theme>();
  
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="m"
      paddingVertical="m"
      backgroundColor="mainBackgroundColor"
      borderRadius={12}
      marginBottom="s"
      style={{
        borderWidth: 1,
        borderColor: theme.colors.borderColor,
      }}
    >
      <Box flex={1}>
        <CustomText variant="bodyBold">John Doe</CustomText>
        <CustomText variant="body" color="disabledTextColor">
          0x1234...5678
        </CustomText>
      </Box>
      <MoreVertical size={25} color={theme.colors.bodyTextColor} />
    </Box>
  );
};

const Addresses = () => {
  // states
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [activeTab, setActiveTab] = useState<'exchange' | 'wallet'>('exchange');

  const theme = useTheme<Theme>();
  const user = useSelector(selectUser);
  const { getUserAddress } = useSettings();

  // Handle successful exchange login - navigate to add address
  const handleExchangeLoginSuccess = () => {
    console.log("Exchange login successful, navigating to add address");
    // Small delay to ensure state is updated
    setTimeout(() => {
      router.push("/dashboard/home/address-book/add-address");
    }, 500);
  };

  const { isExchangeAuthenticated, exchangeUserData, showExchangeLogin, ExchangeLoginBottomSheet } = useExchangeAuth(handleExchangeLoginSuccess);

  // Monitor authentication state changes
  React.useEffect(() => {
    console.log("Exchange authentication state changed:", {
      isExchangeAuthenticated,
      exchangeUserData: exchangeUserData?._id,
      activeTab
    });
  }, [isExchangeAuthenticated, exchangeUserData, activeTab]);

  const handleAddAddress = () => {
    console.log("Add address clicked - Tab:", activeTab, "Exchange Auth:", isExchangeAuthenticated);
    
    if (activeTab === 'exchange') {
      // For exchange, check if user is exchange authenticated
      if (!isExchangeAuthenticated) {
        console.log("Exchange not authenticated, showing login bottom sheet");
        // Open exchange login bottom sheet
        showExchangeLogin();
        return;
      }
    }
    
    console.log("Navigating to add address screen");
    // Navigate to add address
    router.push("/dashboard/home/address-book/add-address");
  };

  React.useEffect(() => {
    (async () => {
      try {
        // Only try to fetch addresses if user is authenticated for the current tab
        if (activeTab === 'exchange' && !isExchangeAuthenticated) {
          console.log("Exchange not authenticated, showing empty state");
          setAddressLoading(false);
          return;
        }

        if (activeTab === 'wallet' && !user?._id) {
          console.log("Wallet not authenticated, showing empty state");
          setAddressLoading(false);
          return;
        }

        // For exchange tab, skip address fetching for now due to token mismatch
        if (activeTab === 'exchange') {
          console.log("Exchange tab - skipping address fetch due to token authentication mismatch");
          setAddressLoading(false);
          setData([]); // Show empty state
          return;
        }

        setAddressLoading(true);
        
        // Use appropriate user ID based on tab (only for wallet tab now)
        const userId = user?._id;
        
        if (!userId) {
          console.log("No user ID available for address fetch");
          setAddressLoading(false);
          return;
        }

        const response = await getUserAddress(userId);
        console.log("Address book data:", response.data);
        // to avoid duplicates
        setData([...data, ...(response.data as any)] as []);
        setAddressLoading(false);
      } catch (error) {
        console.log("Address book error:", error);
        setAddressLoading(false);
        // Only show alert if user is authenticated but request failed
        if (activeTab === 'wallet' && user?._id) {
          alert("An error occurred while loading addresses");
        }
      }
    })();
  }, [user?._id, isExchangeAuthenticated, exchangeUserData?._id, activeTab]);

  return (
    <PageWrapper>
      <AppBar
        height={20}
        title={<CustomText variant="bodySubheader">Address book</CustomText>}
        leading={
          <ChevronLeft
            size={25}
            color={theme.colors.bodyTextColor}
            onPress={() => router.back()}
          />
        }
      />
      
      {/* Tab Navigation */}
      <Box marginHorizontal="m" marginTop="m">
        <AddressBookTabar activeTab={activeTab} onPress={setActiveTab} />
      </Box>

      <Box flex={1} bg="mainBackgroundColor">
        <FlatList
                  ListEmptyComponent={() => (
                    <>
                      {!addressLoading && (
                        <Box flex={1} mt="5xl" justifyContent="center">
                          <EmptyState 
                            onAddAddress={handleAddAddress} 
                            isExchangeTab={activeTab === 'exchange'} 
                          />
                        </Box>
                      )}
                    </>
                  )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ItemCard />}
          ListFooterComponent={() => (
            <>
              {addressLoading && (
                <Box
                  width={"100%"}
                  height={100}
                  justifyContent="center"
                  alignItems="center"
                >
                  <ActivityIndicator
                    color={theme.colors.primaryColor}
                    size={"small"}
                  />
                </Box>
              )}
            </>
          )}
        />
      </Box>
      
      {/* Exchange Login Bottom Sheet */}
      <ExchangeLoginBottomSheet />
    </PageWrapper>
  );
};

export default Addresses;
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";

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
  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <SettingsHeader title="Address book" onBackPress={() => router.back()} />
        <EmptyState />
      </Box>
    </PageWrapper>
  );
};

export default Addresses;
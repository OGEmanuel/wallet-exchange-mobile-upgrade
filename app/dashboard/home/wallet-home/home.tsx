import BalanceCard from "@/components/dashboard/BalanceCard";
import DashboardActionItem from "@/components/dashboard/DashboardActionItem";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Bank } from "iconsax-react-nativejs";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable } from "react-native";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  ThemedQrCodeIcon,
  ThemedScanIcon,
  ThemedSendIcon,
  ThemedSettingsOutlineIcon,
  ThemedSwap1Icon,
} from "@/assets/svg/wallet-icons-components";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import TradeSelectBottomSheet from "@/components/bottomsheets/home/BuyBottomSheet";
import SelectUserTokens from "@/components/bottomsheets/recieve/SelectTokens";
import SelectTokenBottomSheet from "@/components/bottomsheets/send/SelectTokens";
import AssetsSection from "@/components/dashboard/AssetsSection";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ScrollView } from "react-native-gesture-handler";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const OS = Platform.OS;

  const theme = useTheme<Theme>();
  const {
    sendTokenRef: bottomsheetRef,
    recieveTokenRef,
    tradeBottomSheetRef,
  } = useBottomSheetRefs();
  // const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <PageWrapper>
      <ScrollView>
        <LinearGradient
          colors={["#27BA0F00", "#6045FF33"]}
          style={{
            flex: 0.6,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
          }}
        >
          <AppBar
            backgroundColor="transparent"
            height={OS === "android" ? 50 : 50}
            leading={
              <Pressable>
                <ThemedSettingsOutlineIcon
                  darkModeColor={theme.colors.white}
                  lightModeColor={theme.colors.black}
                />
              </Pressable>
            }
            trailing={
              <ThemedScanIcon
                darkModeColor={theme.colors.white}
                lightModeColor={theme.colors.black}
              />
            }
            title={
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "auto",
                }}
              >
                <Box
                  width={20}
                  height={20}
                  borderRadius={2}
                  bg="secondaryBackgroundColor"
                >
                  <Image
                    source={require("@/assets/images/rect2.png")}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 2,
                    }}
                  />
                </Box>
                <CustomText variant="body" fontSize={14} marginHorizontal="m">
                  Daggerman
                </CustomText>
                <ChevronDown size={20} color={theme.colors.bodyTextColor} />
              </Pressable>
            }
          />
          <Box height={30} />
          <BalanceCard />
          <Box
            width={"100%"}
            height={100}
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="2xl"
            mt="m"
          >
            {/* <ReceiveTokenActionItem /> */}
            <DashboardActionItem
              icon={
                <ThemedQrCodeIcon
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Recieve"
              action={() => recieveTokenRef.current?.snapToIndex(1)}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <ThemedSendIcon
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Send"
              action={() => bottomsheetRef.current?.snapToIndex(0)}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <Bank
                  color={theme.colors.bodyTextColor}
                  size={25}
                  variant="Bold"
                />
              }
              title="Trade"
              action={() => tradeBottomSheetRef.current?.expand()}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <ThemedSwap1Icon
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Swap"
              action={() => {}}
            />
          </Box>

          <Box
            width="100%"
            alignItems="center"
            overflow="hidden"
            justifyContent="flex-end"
            flex={1}
          >
            <Image
              source={require("@/assets/images/cardds.png")}
              style={{
                width: "80%",
                height: 80,
              }}
            />
          </Box>
        </LinearGradient>
        <Box flex={0.4} paddingHorizontal="m">
          <AssetsSection />
        </Box>

        <AppBottomSheet isVisible={isOpen} onClose={() => setIsOpen(false)}>
          <Box>
            <CustomText>Recieve Tokens</CustomText>
          </Box>
        </AppBottomSheet>
        <SelectTokenBottomSheet ref={bottomsheetRef} />
        <SelectUserTokens ref={recieveTokenRef} />
      </ScrollView>
      <TradeSelectBottomSheet ref={tradeBottomSheetRef} />
    </PageWrapper>
  );
};

export default Home;

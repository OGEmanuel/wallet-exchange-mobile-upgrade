import BalanceCard from "@/components/dashboard/BalanceCard";
import DashboardActionItem from "@/components/dashboard/DashboardActionItem";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { Bank } from "iconsax-react-nativejs";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import icons from "@/assets/icons";
import {
  ThemedQrCodeIcon,
  ThemedSendIcon,
  ThemedSwap1Icon,
} from "@/assets/svg/wallet-icons-components";
import { TouchableIcon } from "@/components";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import SelectBuyTokens from "@/components/bottomsheets/buy/SelectBuyTokens";
import TradeSelectBottomSheet from "@/components/bottomsheets/home/BuyBottomSheet";
import SelectUserTokens from "@/components/bottomsheets/recieve/SelectTokens";
import SelectTokenBottomSheet from "@/components/bottomsheets/send/SelectTokens";
import ThemedText from "@/components/general/ThemedText";
import { SIZES } from "@/data";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { LinearGradient } from "expo-linear-gradient";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const OS = Platform.OS;

  const theme = useTheme<Theme>();
  const gradientValue = ["#6045ff00", "#6045ff"];
  const {
    sendTokenRef: bottomsheetRef,
    recieveTokenRef,
    tradeBottomSheetRef,
    buyTokensBottomSheetRef,
  } = useBottomSheetRefs();
  // const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <PageWrapper>
      <View style={{}}>
        <LinearGradient
          colors={["#6045ff00", "#6045ff"]}
          style={{
            opacity: 0.7,
            position: "absolute",
            top: SIZES.height / 5,
            width: SIZES.width,
            height: SIZES.height / 4,
            borderBottomEndRadius: 30,
            borderBottomStartRadius: 30,
          }}
        />
        <AppBar
          backgroundColor="transparent"
          height={OS === "android" ? 50 : 50}
          leading={
            <TouchableIcon
              source={icons.settingsRound}
              height={24}
              width={24}
              tintColor={theme.colors.bodyTextColor}
            />
          }
          trailing={
            <TouchableIcon
              source={icons.scan}
              height={24}
              width={24}
              tintColor={theme.colors.bodyTextColor}
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

              <ThemedText
                color={theme.colors.bodyTextColor}
                style={{
                  marginHorizontal: 16,
                  fontSize: 14,
                  fontWeight: "400",
                  textTransform: "capitalize",
                }}
              >
                Daggerman
              </ThemedText>
              <Image
                source={icons.chevronDown}
                style={{ height: 20, width: 20 }}
              />
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
      </View>

      {/* <Box
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
      </Box> */}
      {/* <Box flex={0.4} paddingHorizontal="m">
        <AssetsSection />
      </Box> */}

      <AppBottomSheet isVisible={isOpen} onClose={() => setIsOpen(false)}>
        <Box>
          <CustomText>Recieve Tokens</CustomText>
        </Box>
      </AppBottomSheet>
      <SelectTokenBottomSheet ref={bottomsheetRef} />
      <SelectUserTokens ref={recieveTokenRef} />
      <SelectBuyTokens ref={buyTokensBottomSheetRef} />
      <TradeSelectBottomSheet ref={tradeBottomSheetRef} />
    </PageWrapper>
  );
};

export default Home;

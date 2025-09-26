import {
  ThemedBookIcon,
  ThemedScanIcon,
} from "@/assets/svg/wallet-icons-components";
import ConfirmSend from "@/components/bottomsheets/send/ConfirmSend";
import SaveAddress from "@/components/bottomsheets/send/SaveAddress";
import SendSuccessModal from "@/components/bottomsheets/send/SendSuccessModal";
import WhatIsNetworkFeeBottomsheet from "@/components/bottomsheets/send/WhatIsNetworkFeeBottomSheet";
import NetworkFeeCard from "@/components/dashboard/NetworkFeeCard";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  AppBar,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import Box from "@/components/general/Box";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { TextInput } from "react-native-gesture-handler";

const PriceCard = ({
  price,
  setPrice,
}: {
  price: string;
  setPrice: (e: string) => void;
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width={"100%"}
      height={101}
      borderRadius={12}
      backgroundColor="secondaryBackgroundColor"
      padding="m"
      flexDirection="row"
    >
      <Box flex={1} justifyContent="space-between">
        <TextInput
          value={price}
          onChangeText={(e) => setPrice(e)}
          placeholder="0"
          placeholderTextColor={theme.colors.bodyTextColor}
          keyboardType="numbers-and-punctuation"
          style={{
            fontFamily: "NewScience_SemiBold",
            fontSize: 22,
            color: theme.colors.headerTextColor,
          }}
        />
        <Box flexDirection="row" alignItems="center">
          <Image
            source={require("@/assets/images/updownarrow.png")}
            style={{ width: 14, height: 14 }}
            contentFit="contain"
          />
          <CustomText variant="body" color="disabledTextColor" marginLeft="s">
            $0.00
          </CustomText>
        </Box>
      </Box>
      <Box flex={1} alignItems="flex-end" justifyContent="space-between">
        <Pressable
          style={{
            width: 75,
            height: 36,
            borderRadius: 30,
            backgroundColor: theme.colors.mainBackgroundColor,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Box
            width={20}
            height={20}
            borderRadius={20}
            bg="secondaryBackgroundColor"
          ></Box>
          <CustomText variant="body" fontSize={14} ml="s" color="bodyTextColor">
            Send
          </CustomText>
        </Pressable>

        <Box flexDirection="row" alignItems="center">
          <CustomText
            variant="body"
            color="disabledTextColor"
            fontSize={12}
            marginLeft="s"
            marginRight="s"
          >
            Bal: 20 AVAX
          </CustomText>

          <Pressable
            style={{
              width: 39,
              height: 21,
              borderRadius: 30,
              backgroundColor: theme.colors.bodyTextColor,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <CustomText variant="body" fontSize={14} color="black">
              Max
            </CustomText>
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
};

const SendToken = () => {
  const [price, setPrice] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const theme = useTheme<Theme>();
  const { networkFeeRef, confirmSendRef, saveAddressRef } =
    useBottomSheetRefs();

  return (
    <PageWrapper>
      <Box flex={1} backgroundColor="mainBackgroundColor" paddingHorizontal="m">
        <AppBar
          height={30}
          paddingHorizontal={0}
          leading={
            <ChevronLeft
              size={25}
              color={theme.colors.bodyTextColor}
              onPress={() => router.back()}
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

        {/* TEXT BOX */}
        <CustomInputWithoutForm
          value=""
          onChange={() => {}}
          iconLeft={
            <CustomText variant="body" fontSize={14}>
              TO:
            </CustomText>
          }
          iconRight={
            <CustomText variant="body" fontSize={14}>
              Paste
            </CustomText>
          }
          placeholder="Enter address or zap username"
          boxStyle={{
            borderWidth: 0,
            marginTop: 20,
          }}
        />

        {/* SCAN AND ADRESS BOOK SECTION */}
        <Box
          width={"100%"}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt="m"
        >
          <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedScanIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
            <CustomText variant="body" fontSize={12} marginLeft="s">
              Scan QR Code
            </CustomText>
          </Pressable>
          <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedBookIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
            <CustomText variant="body" fontSize={12} marginLeft="s">
              Address Book
            </CustomText>
          </Pressable>
        </Box>

        <Box height={30} />
        <PriceCard price={price as string} setPrice={setPrice} />
        <Box height={30} />
        <NetworkFeeCard />
      </Box>
      <Box
        width={"100%"}
        height={60}
        justifyContent="center"
        paddingHorizontal="m"
      >
        <CustomButton
          text="Continue"
          onPress={() => confirmSendRef.current?.snapToIndex(1)}
          width={"100%"}
          borderRadius={50}
          disabled={price === null}
          disabledColor={theme.colors.disabledTextColor}
        />
      </Box>
      {/* BOTTOMSHEETS */}
      <WhatIsNetworkFeeBottomsheet ref={networkFeeRef} />
      <ConfirmSend
        ref={confirmSendRef}
        send={() => {
          confirmSendRef.current?.close();
          setShowModal(true);
        }}
      />
      <SendSuccessModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          saveAddressRef.current?.snapToIndex(1);
        }}
      />
      <SaveAddress
        ref={saveAddressRef}
        save={() => saveAddressRef.current?.close()}
      />
    </PageWrapper>
  );
};

export default SendToken;

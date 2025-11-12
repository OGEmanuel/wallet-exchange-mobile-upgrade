import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { setSellStage } from "@/src/modules/sell/presentation/state/sell-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";

interface DetailsStepProps {
  setShowConfirmModal: (show: boolean) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ setShowConfirmModal }) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Summary");

  const handleBack = () => {
    dispatch(setSellStage("select-bank"));
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
        flex={1}
      >
        <Pressable onPress={handleBack}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
          Transaction Details
        </CustomText>
        <Box width={30} />
      </Box>

      <Box
        flexDirection="row"
        width="80%"
        alignSelf="center"
        mb="m"
        backgroundColor="secondaryBackgroundColor"
        style={{ padding: 5 }}
        borderRadius={50}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 50,
            backgroundColor:
              activeTab === "Summary"
                ? theme.colors.bodyTextColor
                : "transparent",
          }}
          onPress={() => setActiveTab("Summary")}
        >
          <CustomText
            variant="body"
            color={
              isDark
                ? activeTab === "Summary"
                  ? "black"
                  : "bodyTextColor"
                : activeTab === "Summary"
                ? "white"
                : "black"
            }
          >
            Summary
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 50,
            backgroundColor:
              activeTab === "Details"
                ? theme.colors.bodyTextColor
                : "transparent",
          }}
          onPress={() => setActiveTab("Details")}
        >
          <CustomText
            variant="body"
            color={
              isDark
                ? activeTab === "Details"
                  ? "black"
                  : "bodyTextColor"
                : activeTab === "Details"
                ? "white"
                : "black"
            }
          >
            Details
          </CustomText>
        </TouchableOpacity>
      </Box>

      {activeTab === "Summary" ? (
        <Box flex={1}>
          <Box flex={1} marginBottom="xl">
            <Box
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              mb="m"
              alignItems="center"
            >
              <CustomText
                variant="body"
                color="bodyTextColor"
                mb="s"
                fontSize={10}
              >
                YOU SEND
              </CustomText>
              <Box
                alignItems="center"
                alignContent="center"
                justifyContent="center"
                flexDirection="row"
                gap="s"
                marginTop="m"
              >
                <Image
                  source={{
                    uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                  }}
                  style={{ width: 25, height: 25 }}
                />
                <CustomText variant="bodyBold" fontSize={18}>
                  3 BNB
                </CustomText>
              </Box>
            </Box>

            <Box
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              mb="m"
              gap="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  You Receive:
                </CustomText>
                <CustomText variant="bodyBold" fontSize={10}>
                  4,543,444 NGN
                </CustomText>
              </Box>
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  LP Fee:
                </CustomText>
                <CustomText variant="bodyBold" fontSize={10}>
                  0.02 BNB
                </CustomText>
              </Box>
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  Receiving Address:
                </CustomText>
                <CustomText variant="bodyBold" fontSize={10}>
                  0xB1aE3...efd736
                </CustomText>
              </Box>

              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  Chain:
                </CustomText>
                <Box
                  alignItems="center"
                  alignContent="center"
                  justifyContent="center"
                  flexDirection="row"
                  style={{ gap: 3 }}
                >
                  <Image
                    source={{
                      uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    }}
                    style={{ width: 15, height: 15 }}
                  />
                  <CustomText variant="bodyBold" fontSize={10}>
                    BSC
                  </CustomText>
                </Box>
              </Box>

              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  Status:
                </CustomText>
                <CustomButton
                  text="Pending"
                  variant="bodySubheader"
                  width={70}
                  height={25}
                  borderRadius={20}
                  borderWidth={1}
                  borderColor="#FEDB24"
                  bgColor="#393002"
                  color="#FEDB24"
                  onPress={() => {}}
                  fontSize={10}
                />
              </Box>
            </Box>

            <Box
              bg="warningBackgroundColor"
              borderRadius={10}
              p="m"
              flexDirection="row"
              alignItems="center"
              mb="m"
            >
              <Box width={2} height="100%" bg="warningColor" mr="s" />
              <CustomText variant="body" flex={1}>
                We will complete your transaction of 4,844,800 NGN after we
                confirm receipt of your deposit
              </CustomText>
            </Box>
          </Box>
          <CustomButton
            text="Show Deposit Details"
            onPress={() => setActiveTab("Details")}
            width={"100%"}
            borderRadius={50}
            bgColor={theme.colors.primaryColor}
          />
        </Box>
      ) : (
        <Box flex={1}>
          <Box alignItems="center">
            <CustomText variant="medium" mb="m">
              Deposit Address
            </CustomText>
            <Box
              height={120}
              width={120}
              borderRadius={1}
              bg="white"
              alignItems="center"
              justifyContent="center"
              padding="s"
              mb="m"
            >
              <QRCode
                size={110}
                value={
                  "https://play.google.com/store/apps/details?id=com.zapmobile"
                }
                color="#000000"
                backgroundColor="#FFFFFF"
                logoSize={20}
                logoMargin={2}
                logoBackgroundColor="transparent"
              />
            </Box>
            <Box
              width="100%"
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              gap="m"
              mb="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  Address:
                </CustomText>
                <CustomText variant="bodyBold" fontSize={10}>
                  0xB1aE3...efd736
                </CustomText>
              </Box>

              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText variant="body" color="disabledTextColor">
                  Chain:
                </CustomText>
                <Box
                  alignItems="center"
                  alignContent="center"
                  justifyContent="center"
                  flexDirection="row"
                  style={{ gap: 3 }}
                >
                  <Image
                    source={{
                      uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    }}
                    style={{ width: 15, height: 15 }}
                  />
                  <CustomText variant="bodyBold" fontSize={10}>
                    BSC
                  </CustomText>
                </Box>
              </Box>
            </Box>

            <Box
              bg="warningBackgroundColor"
              borderRadius={10}
              p="m"
              flexDirection="row"
              alignItems="center"
              mb="xl"
            >
              <Box width={2} height="100%" bg="warningColor" mr="s" />
              <CustomText variant="body" flex={1}>
                We will complete your transaction of 4,844,800 NGN after we
                confirm receipt of your deposit
              </CustomText>
            </Box>

            <CustomButton
              text="Send from wallet"
              onPress={() => setShowConfirmModal(true)}
              width={"100%"}
              borderRadius={50}
              bgColor={theme.colors.primaryColor}
            />
          </Box>
        </Box>
      )}
    </BottomSheetView>
  );
};

export default DetailsStep;

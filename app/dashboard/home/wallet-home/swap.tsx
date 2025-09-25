import { ThemedLinkExternalIcon } from "@/assets/svg/wallet-icons-components";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ArrowUpDown, ChevronDown } from "lucide-react-native";
import React from "react";

const Swap = () => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = React.useState<"EXCHANGE" | "WALLET">(
    "EXCHANGE"
  );
  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>
        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

        <Box marginBottom="s" mt="m" position="relative">
          <Box
            width={"100%"}
            height={105}
            borderRadius={12}
            backgroundColor="secondaryBackgroundColor"
            p="m"
            justifyContent="space-between"
          >
            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="medium">0.009</CustomText>
              <CustomButton
                width={107}
                height={36}
                borderRadius={36}
                bgColor={theme.colors.mainBackgroundColor}
                text="BUSD"
                fontSize={12}
                onPress={() => {}}
                leadingIcon={
                  <Image
                    source={require("@/assets/images/btc.png")}
                    style={{ width: 20, height: 20, marginRight: 5 }}
                  />
                }
                trailingIcon={
                  <ChevronDown
                    color={theme.colors.bodyTextColor}
                    size={12}
                    style={{ marginLeft: 5 }}
                  />
                }
              />
            </Box>

            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mt="s"
            >
              <CustomText variant="medium">0.009</CustomText>
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <CustomText fontSize={12} variant="body" marginRight="s">
                  Bal: 20BNB
                </CustomText>
                <CustomButton
                  width={50}
                  height={25}
                  borderRadius={36}
                  bgColor={theme.colors.white}
                  color="black"
                  text="MAX"
                  fontSize={12}
                  onPress={() => {}}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box
            width={"100%"}
            height={105}
            borderRadius={12}
            backgroundColor="secondaryBackgroundColor"
            p="m"
            justifyContent="center"
          >
            <Box
              width={"100%"}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="medium">30,027,060.88</CustomText>
              <CustomButton
                width={107}
                height={36}
                borderRadius={36}
                bgColor={theme.colors.mainBackgroundColor}
                text="BUSD"
                fontSize={12}
                onPress={() => {}}
                leadingIcon={
                  <Image
                    source={require("@/assets/images/btc.png")}
                    style={{ width: 20, height: 20, marginRight: 5 }}
                  />
                }
                trailingIcon={
                  <ChevronDown
                    color={theme.colors.bodyTextColor}
                    size={12}
                    style={{ marginLeft: 5 }}
                  />
                }
              />
            </Box>

            <CustomText variant="body" mt="s">
              $180
            </CustomText>
          </Box>

          <Box
            width={50}
            height={50}
            borderRadius={50}
            bg="mainBackgroundColor"
            position="absolute"
            left={"40%"}
            top={"-28%"}
            style={{ padding: 8 }}
          >
            <Box
              width={"100%"}
              height={"100%"}
              borderRadius={50}
              backgroundColor="secondaryBackgroundColor"
              justifyContent="center"
              alignItems="center"
            >
              <ArrowUpDown color={theme.colors.bodyTextColor} size={20} />
            </Box>
          </Box>
        </Box>

        <Box
          marginVertical="m"
          width={"100%"}
          borderRadius={10}
          borderWidth={2}
          borderColor="borderColor"
          height={150}
          p="m"
        >
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Provider
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <ThemedLinkExternalIcon
                darkModeColor={theme.colors.bodyTextColor}
                lightModeColor={theme.colors.bodyTextColor}
                width={15}
                height={15}
              />
              <Image
                source={require("@/assets/images/btc.png")}
                style={{ width: 20, height: 20, marginHorizontal: 5 }}
                contentFit="cover"
              />
              <CustomText variant="body" fontSize={12}>
                Zap exchange
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12} color="bodyTextColor">
              Zap Fee
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText
                variant="bodyMedium"
                fontSize={12}
                color="headerTextColor"
              >
                $0.009
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Rate
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="bodyMedium" fontSize={12}>
                1BNB = 500 USDC
              </CustomText>
            </Box>
          </Box>
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <CustomText variant="body" fontSize={12}>
              Minimium Received
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="bodyMedium" fontSize={12}>
                327,060.88 NGN
              </CustomText>
            </Box>
          </Box>
          <Box alignItems="center" width={"100%"}>
            <CustomButton
              trailingIcon={<ChevronDown color={"white"} size={15} />}
              width={120}
              height={22}
              borderRadius={22}
              onPress={() => {}}
              text="Show Less"
              fontSize={12}
              bgColor={theme.colors.secondaryBackgroundColor}
            />
          </Box>
          BB
        </Box>
        <CustomButton
          text="Continue"
          fontSize={14}
          width={"100%"}
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={() => {}}
        />
      </Box>
    </PageWrapper>
  );
};

export default Swap;

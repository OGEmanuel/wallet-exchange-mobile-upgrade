import { View, Text } from "react-native";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import CustomButton from "../general/CustomButton";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import { ScrollView } from "react-native-gesture-handler";

const AssetCard = ({ coin }: { coin: string }) => {
  return (
    <Box
      width="100%"
      height={57}
      borderRadius={10}
      bg="secondaryBackgroundColor"
      mb="s"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="m"
    >
      <Box flexDirection="row">
        <Box
          width={32}
          height={32}
          borderRadius={20}
          bg="mainBackgroundColor"
        ></Box>
        <Box ml="m">
          <CustomText fontSize={14}>BTC</CustomText>
          <CustomText variant="light" fontSize={12}>
            $2.45{" "}
            <CustomText variant="light" color="success" ml="m" fontSize={12}>
              +0.6
            </CustomText>
          </CustomText>
        </Box>
      </Box>
      <Box alignItems="flex-end">
        <CustomText variant="medium" fontSize={14}>
          $56,000
        </CustomText>
        <CustomText variant="body" fontSize={10}>
          0.5BTC
        </CustomText>
      </Box>
    </Box>
  );
};

const AssetsSection = () => {
  const theme = useTheme<Theme>();
  return (
    <Box width={"100%"} flex={1}>
      <Box
        width="100%"
        height={50}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
      >
        <CustomText fontSize={18} variant="subheader">
          Assets
        </CustomText>
        <CustomButton
          onPress={() => {}}
          text="Manage"
          width={90}
          height={32}
          borderRadius={30}
          borderWidth={1}
          bgColor="transparent"
          variant="bodySubheader"
          leadingIcon={
            <ThemedEditIcon
              width={15}
              height={15}
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
          }
          fontSize={12}
          borderColor={theme.colors.borderColor}
        />
      </Box>
      <ScrollView>
        {Array.from([1, 2, 4, 5, 6, 7, 78, 8, 9]).map((item) => {
          return <AssetCard key={item} coin="Btc" />;
        })}
      </ScrollView>
    </Box>
  );
};

export default AssetsSection;

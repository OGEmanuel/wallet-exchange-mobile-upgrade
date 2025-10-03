import { ThemedFilterIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText, PageWrapper } from "@/components/general";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

const ItemCard = () => {
  return (
    <Box
      width={"100%"}
      flexDirection="row"
      height={70}
      paddingHorizontal="s"
      mb="m"
    >
      <Box
        width={30}
        height={30}
        borderRadius={3}
        bg="secondaryBackgroundColor"
        justifyContent="center"
        alignItems="center"
        position="relative"
      ></Box>
      <Box ml="m">
        <CustomText fontSize={14}>Login</CustomText>
        <CustomText fontSize={12} mt="s">
          You transaction from 40 ETH To20 BTC was completed successfully{" "}
        </CustomText>
        <CustomText fontSize={10} color="disabledTextColor" mt="s">
          27 Dec 2022, 11:58AM
        </CustomText>
      </Box>
    </Box>
  );
};

const ActivityLogs = () => {
  const theme = useTheme<Theme>();
  const user = useSelector(selectUser);
  console.log(user);
  const { getActivities } = useSettings();
  return (
    <PageWrapper>
      <SettingsHeader title="Activty Logs" onBackPress={() => router.back()} />
      <Box
        paddingHorizontal="m"
        mt="m"
        height={60}
        position="relative"
        justifyContent="center"
        mb="l"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          width={"100%"}
          justifyContent="space-between"
        >
          <Box width={"90%"}>
            <CustomInputWithoutForm
              placeholder="Search"
              placeholderTextColor={theme.colors.disabledTextColor}
              value=""
              onChange={() => {}}
              iconLeft={<Search size={20} color={theme.colors.bodyTextColor} />}
            />
          </Box>
          <ThemedFilterIcon
            width={35}
            height={35}
            darkModeColor={theme.colors.bodyTextColor}
            lightModeColor={theme.colors.bodyTextColor}
          />
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {Array.from([
          1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        ]).map((item, index) => (
          <ItemCard key={index.toString()} />
        ))}
      </ScrollView>
    </PageWrapper>
  );
};

export default ActivityLogs;

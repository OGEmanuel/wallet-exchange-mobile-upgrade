import { ThemedFilterIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import ActivityLogsEmptyState from "./empty-logs";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getExchangeUser } = useWallet();

  const settings = useSettings();

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      setError(null);
      try {
        const userData = await getExchangeUser();
        if (userData) {
          const response = await settings.getActivities(userData);
          setActivities(response);
          // setUsername(userData.username || "");
          // setPhone(userData.phone || "");
        }
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(err?.message || "Failed to load user profile");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [getExchangeUser]);

  console.log(activities);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

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
              value={searchQuery}
              onChange={handleSearchChange}
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
      <ActivityLogsEmptyState />

      {/* <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {Array.from([
          1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        ]).map((item, index) => (
          <ItemCard key={index.toString()} />
        ))}
      </ScrollView> */}
    </PageWrapper>
  );
};

export default ActivityLogs;

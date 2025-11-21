import { ThemedFilterIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { queryKeys } from "@/src/core/api/query-keys";
import { useGetExchangeUser } from "@/src/hooks/queries";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ActivityLogModel } from "@/src/modules/settings/domain/entities/models/activity-log-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList } from "react-native";
import ActivityLogsEmptyState from "./empty-logs";

const ItemCard = (props: { logs: ActivityLogModel }) => {
  const { logs } = props;

  function formatDateReadable(dateString: string): string {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // convert to 12-hour format

    return `${day} ${month} ${year}, ${hours}:${minutes}${ampm}`;
  }

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
        <CustomText fontSize={14}>{logs.type}</CustomText>
        <CustomText fontSize={12} mt="s">
          {logs.description}
        </CustomText>
        <CustomText fontSize={10} color="disabledTextColor" mt="s">
          {formatDateReadable(logs.createdAt.toISOString())}
        </CustomText>
      </Box>
    </Box>
  );
};

const useGetActivityLogs = (page: number, limit: number, user?: UserModel) => {
  const settings = useSettings();

  return useQuery({
    queryKey: queryKeys.activity.logs(),
    queryFn: async () =>
      await settings.getActivities({
        user: user,
        page: page,
        limit: limit,
      }),
    enabled: user ? true : false,
  });
};

const ActivityLogs = () => {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: userData } = useGetExchangeUser();
  const user: UserModel | null | undefined = userData;

  const {
    data: logsData,
    isPending: loading,
    isError: error,
  } = useGetActivityLogs(1, 10, user!!);
  const logs = logsData?.data || [];

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
      {logs?.length === 0 ? (
        <ActivityLogsEmptyState />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(log) => log._id}
          renderItem={(logsData) => <ItemCard logs={logsData.item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </PageWrapper>
  );
};

export default ActivityLogs;

import { ThemedFilterIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ActivityLogModel } from "@/src/modules/settings/domain/entities/models/activity-log-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Code, Lock } from "iconsax-react-nativejs";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

const ItemCard = ({ type, description, createdAt }: ActivityLogModel) => {
  const theme = useTheme<Theme>();

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
      >
        {type === "LOGIN" && (
          <Lock size={20} color={theme.colors.fadedPrimary} variant="Bold" />
        )}
        {type === "OTP" && (
          <Code size={20} color={theme.colors.fadedPrimary} variant="Bold" />
        )}
      </Box>
      <Box ml="m">
        <CustomText fontSize={14}>{type}</CustomText>
        <CustomText fontSize={12} mt="s">
          {description}
        </CustomText>
        <CustomText fontSize={10} color="disabledTextColor" mt="s">
          {new Date(createdAt).toDateString()}
        </CustomText>
      </Box>
    </Box>
  );
};

const ActivityLogs = () => {
  const theme = useTheme<Theme>();
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ActivityLogModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { getActivities } = useSettings();

  React.useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true);
      const data = await getActivities({
        limit,
        page,
        user: user as UserModel,
      });
      setIsLoading(false);
      setData((data.data as ActivityLogModel[]) || []);
    }
    fetchActivities();
  }, []);
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

      <FlatList
        data={data}
        ListFooterComponent={() => (
          <Box height={20} justifyContent="center" alignItems="center">
            {isLoading && (
              <ActivityIndicator
                animating={isLoading}
                color={theme.colors.bodyTextColor}
              />
            )}
          </Box>
        )}
        renderItem={({ item }) => <ItemCard {...item} />}
        keyExtractor={(item) => item._id}
      />
    </PageWrapper>
  );
};

export default ActivityLogs;

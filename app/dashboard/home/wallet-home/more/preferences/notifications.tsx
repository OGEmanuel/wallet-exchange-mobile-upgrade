import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { router } from "expo-router";
import React, { useState } from "react";
import { Switch } from "react-native";

const NotificationCard = ({
  title,
  description,
  isActive,
  onPress,
}: {
  title: string;
  description: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <Box width={"100%"} height={100} mb="m">
      <Box
        width="100%"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomText variant="bodySubheader" fontSize={16}>
          {title}
        </CustomText>
        <Box>
          <Switch value={isActive} onValueChange={onPress} />
        </Box>
      </Box>
      <CustomText variant="body" fontSize={12} mt="s">
        {description}
      </CustomText>
    </Box>
  );
};

const Notifications = () => {
  const [isActive, setIsActive] = useState(false);
  return (
    <PageWrapper>
      <SettingsHeader title="Notifications" onBackPress={() => router.back()} />
      <Box paddingHorizontal="m" pt="l">
        <NotificationCard
          title="Watchlist Settings"
          description="Get notified daily about price changes happening in the market."
          isActive={isActive}
          onPress={() => setIsActive(true)}
        />

        <NotificationCard
          title="Price Alerts"
          description="Enable price alerts to stay informed when the price reaches your desired level."
          isActive={isActive}
          onPress={() => setIsActive(true)}
        />
      </Box>
    </PageWrapper>
  );
};

export default Notifications;

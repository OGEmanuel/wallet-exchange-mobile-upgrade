import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { UpdateSettingsBody } from "@/src/modules/settings/domain/entities/params/update-settings-body";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { InfoCircle } from "iconsax-react-nativejs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Switch } from "react-native";

const NotificationCard = ({
  title,
  description,
  isActive,
  onPress,
  isWaitlist,
  threshold,
  onThresholdChange,
}: {
  title: string;
  description: string;
  isActive: boolean;
  onPress: () => void;
  isWaitlist: boolean;
  threshold?: string;
  onThresholdChange?: (value: string) => void;
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box width="100%" mb="l">
      <Box width={"100%"} height={"auto"} mb="m">
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
      {isWaitlist && (
        <Box width="100%" flexDirection="row" alignItems="center">
          <CustomText>Watchlist Threshold</CustomText>
          <InfoCircle
            size={24}
            color={theme.colors.bodyTextColor}
            style={{ marginRight: 30, marginLeft: 10 }}
          />
          <CustomInputWithoutForm
            keyboardType="number-pad"
            value={threshold as string}
            onChange={(e) => onThresholdChange?.(e)}
            placeholder="0%"
            boxStyle={{
              width: 70,
              borderWidth: 0.6,
              borderColor: theme.colors.borderColor,
              backgroundColor: "transparent",
              height: 40,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const Notifications = () => {
  const theme = useTheme<Theme>();
  const { currentExchangeUser } = useWallet();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Notification preferences state
  const [preferences, setPreferences] = useState<UpdateSettingsBody>({
    push: false,
    email: false,
    priceAlert: false,
    watchlist: false,
    watchlistTreshHold: 0,
    userId: "",
  });

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentExchangeUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await zapSDKService.getNotificationPreferences({
          userId: currentExchangeUser,
        });

        if (data) {
          setPreferences({
            push: data.push ?? false,
            email: data.email ?? false,
            priceAlert: data.priceAlert ?? false,
            watchlist: data.watchlist ?? false,
            watchlistTreshHold: data.watchlistTreshHold ?? 0,
            transaction: data.transaction ?? false,
            marketing: data.marketing ?? false,
            twoFA: data.twoFA ?? false,
            userId: currentExchangeUser,
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch notification preferences:", err);
        setError(err?.message || "Failed to load notification preferences");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentExchangeUser]);

  const handleSave = async () => {
    if (!currentExchangeUser) {
      setError("User not authenticated");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdateSettingsBody = {
        ...preferences,
        userId: currentExchangeUser,
      };

      const result = await zapSDKService.updateNotificationPreferences({
        userId: currentExchangeUser,
        notificationPreferences: payload,
      });

      if (result) {
        // Update local state with the response
        setPreferences({
          push: result.push ?? preferences.push,
          email: result.email ?? preferences.email,
          priceAlert: result.priceAlert ?? preferences.priceAlert,
          watchlist: result.watchlist ?? preferences.watchlist,
          watchlistTreshHold: result.watchlistTreshHold ?? preferences.watchlistTreshHold,
          transaction: result.transaction ?? preferences.transaction,
          marketing: result.marketing ?? preferences.marketing,
          twoFA: result.twoFA ?? preferences.twoFA,
          userId: currentExchangeUser,
        });
      }
    } catch (err: any) {
      console.error("Failed to update notification preferences:", err);
      setError(err?.message || "Failed to save notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof UpdateSettingsBody, value: boolean | number) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!currentExchangeUser) {
    return (
      <PageWrapper>
        <SettingsHeader title="Notifications" onBackPress={() => router.back()} />
        <Box flex={1} alignItems="center" justifyContent="center">
          <CustomText variant="body" color="error">
            Please login to manage notification preferences
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SettingsHeader title="Notifications" onBackPress={() => router.back()} />
      
      {loading && (
        <Box
          width="100%"
          height={50}
          justifyContent="center"
          alignItems="center"
        >
          <ActivityIndicator size="small" color={theme.colors.primaryColor} />
        </Box>
      )}

      {error && (
        <Box paddingHorizontal="m" paddingVertical="s">
          <CustomText variant="body" color="error" fontSize={14}>
            {error}
          </CustomText>
        </Box>
      )}

      {!loading && (
        <>
          <Box paddingHorizontal="m" pt="l" flex={1}>
            <NotificationCard
              title="Watchlist Settings"
              description="Get notified daily about price changes happening in the market."
              isActive={Boolean(preferences.watchlist ?? false)}
              onPress={() => {
                updatePreference("watchlist", !preferences.watchlist);
              }}
              isWaitlist={true}
              threshold={String(preferences.watchlistTreshHold ?? 0)}
              onThresholdChange={(val) => {
                const num = Number(val);
                const safe = Number.isFinite(num) ? num : 0;
                updatePreference("watchlistTreshHold", safe);
              }}
            />

            <NotificationCard
              title="Price Alerts"
              description="Enable price alerts to stay informed when the price reaches your desired level."
              isActive={Boolean(preferences.priceAlert ?? false)}
              isWaitlist={false}
              onPress={() => {
                updatePreference("priceAlert", !preferences.priceAlert);
              }}
            />

            <NotificationCard
              title="Push Notifications"
              description="Enable push notifications to stay informed when the price reaches your desired level."
              isActive={Boolean(preferences.push ?? false)}
              isWaitlist={false}
              onPress={() => {
                updatePreference("push", !preferences.push);
              }}
            />

            <NotificationCard
              title="Email Notifications"
              description="Enable email notifications to stay informed when the price reaches your desired level."
              isActive={Boolean(preferences.email ?? false)}
              isWaitlist={false}
              onPress={() => {
                updatePreference("email", !preferences.email);
              }}
            />
          </Box>
          <Box
            width="100%"
            height={60}
            paddingHorizontal="m"
            justifyContent="center"
            mb="m"
          >
            <CustomButton
              width={"100%"}
              text="Save"
              borderRadius={50}
              isLoading={isSaving}
              onPress={handleSave}
            />
          </Box>
        </>
      )}
    </PageWrapper>
  );
};

export default Notifications;

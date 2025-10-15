import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { SettingsModel } from "@/src/modules/settings/domain/entities/models/Settings-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import {
  selectSettingState,
  setSettings,
} from "@/src/modules/settings/presentation/state/settings-slice";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { InfoCircle } from "iconsax-react-nativejs";
import React, { useState } from "react";
import { ActivityIndicator, Switch } from "react-native";
import { useDispatch, useSelector } from "react-redux";

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
          <CustomText>Watchlist Threashold</CustomText>
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
  const [isSaving, setIsSaving] = useState(false);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { settings } = useSelector(selectSettingState);
  const user = useSelector(selectUser);
  const { getSettings, updateSettings } = useSettings();
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();
  const [settingsState, setSettingsState] = useState<SettingsModel>(
    {} as SettingsModel
  );

  React.useEffect(() => {
    if (settings) {
      // Sync local state with store settings when available
      setSettingsState(settings as SettingsModel);
      setShow(true);
      return;
    }
    if (user?._id) {
      setLoading(true);
      (async () => {
        try {
          const response = await getSettings({
            params: { user: user as UserModel },
          });
          const { _id, __v, ...rest } = response.data as SettingsModel;
          setSettingsState({ ...rest } as SettingsModel);
          setShow(true);
        } catch (e) {
          // Optionally handle error state here
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [settings, user?._id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: SettingsModel = {
        ...(settings ?? settingsState),
        userId: user?._id as string,
      } as SettingsModel;

      const response = await updateSettings({
        params: { user: user as UserModel },
        body: payload,
      });

      const { _id, __v, ...rest } = response.data as SettingsModel;
      setSettingsState((prev) => ({ ...prev, ...rest } as SettingsModel));
      dispatch(setSettings({ ...rest } as SettingsModel));
    } catch (error) {
      // Optionally handle error (e.g., show toast)
    } finally {
      setIsSaving(false);
    }
  };
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
      {!loading && show && (
        <>
          <Box paddingHorizontal="m" pt="l" flex={1}>
            <NotificationCard
              title="Watchlist Settings"
              description="Get notified daily about price changes happening in the market."
              isActive={Boolean((settings?.watchlist ?? settingsState.watchlist) ?? false)}
              onPress={() => {
                const current = (settings?.watchlist ?? settingsState.watchlist) ?? false;
                if (settings) {
                  dispatch(setSettings({ ...settings, watchlist: !current }));
                } else {
                  setSettingsState((prev) => ({ ...prev, watchlist: !current } as SettingsModel));
                }
              }}
              isWaitlist={true}
              threshold={String((settings?.watchlistTreshHold ?? settingsState.watchlistTreshHold ?? 0))}
              onThresholdChange={(val) => {
                const num = Number(val);
                const safe = Number.isFinite(num) ? num : 0;
                if (settings) {
                  dispatch(setSettings({ ...settings, watchlistTreshHold: safe }));
                } else {
                  setSettingsState((prev) => ({ ...prev, watchlistTreshHold: safe } as SettingsModel));
                }
              }}
            />

            <NotificationCard
              title="Price Alerts"
              description="Enable price alerts to stay informed when the price reaches your desired level."
              isActive={Boolean((settings?.priceAlert ?? settingsState.priceAlert) ?? false)}
              isWaitlist={false}
              onPress={() => {
                const current = (settings?.priceAlert ?? settingsState.priceAlert) ?? false;
                if (settings) {
                  dispatch(setSettings({ ...settings, priceAlert: !current }));
                } else {
                  setSettingsState((prev) => ({ ...prev, priceAlert: !current } as SettingsModel));
                }
              }}
            />

            <NotificationCard
              title="Push Notifications"
              description="Enable push notifications to stay informed when the price reaches your desired level."
              isActive={Boolean((settings?.push ?? settingsState.push) ?? false)}
              isWaitlist={false}
              onPress={() => {
                const current = (settings?.push ?? settingsState.push) ?? false;
                if (settings) {
                  dispatch(setSettings({ ...settings, push: !current }));
                } else {
                  setSettingsState((prev) => ({ ...prev, push: !current } as SettingsModel));
                }
              }}
            />

            <NotificationCard
              title="Email Notifications"
              description="Enable email notifications to stay informed when the price reaches your desired level."
              isActive={Boolean((settings?.email ?? settingsState.email) ?? false)}
              isWaitlist={false}
              onPress={() => {
                const current = (settings?.email ?? settingsState.email) ?? false;
                if (settings) {
                  dispatch(setSettings({ ...settings, email: !current }));
                } else {
                  setSettingsState((prev) => ({ ...prev, email: !current } as SettingsModel));
                }
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

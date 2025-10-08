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
      setShow(true);
    } else {
      if (user?._id) {
        setLoading(true);
        (async function () {
          const response = await getSettings({
            params: { user: user as UserModel },
          });
          const { _id, __v, ...rest } = response.data as SettingsModel;
          setSettingsState({ ...rest } as SettingsModel);
          if (response) {
            setShow(true);
            setLoading(false);
          }
        })();
      }
    }
  }, [settings, user?._id]);

  const handleSave = async () => {
    console.log(user);
    setIsSaving(true);
    try {
      const response = await updateSettings({
        params: { user: user as UserModel },
        body: {
          ...settingsState,
          userId: user?._id as string,
        },
      });
      console.log("RESPONSE DATA", response.data);
      const { _id, __v, ...rest } = response.data as SettingsModel;
      setSettingsState({ ...settingsState, ...rest } as SettingsModel);
      dispatch(setSettings({ ...rest } as SettingsModel));
      setIsSaving(false);
    } catch (error) {
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
              isActive={settings?.watchlist as boolean}
              onPress={() => {
                if (settings) {
                  dispatch(
                    setSettings({ ...settings, watchlist: !settings.watchlist })
                  );
                }
              }}
              isWaitlist={true}
              threshold={settings?.watchlistTreshHold.toString()}
              onThresholdChange={(val) =>
                dispatch(
                  setSettings({ ...settings!, watchlistTreshHold: Number(val) })
                )
              }
            />

            <NotificationCard
              title="Price Alerts"
              description="Enable price alerts to stay informed when the price reaches your desired level."
              isActive={settings?.priceAlert as boolean}
              isWaitlist={false}
              onPress={() => {
                if (settings) {
                  dispatch(
                    setSettings({
                      ...settings,
                      priceAlert: !settings.priceAlert,
                    })
                  );
                }
              }}
            />

            <NotificationCard
              title="Push Notifications"
              description="Enable push notifications to stay informed when the price reaches your desired level."
              isActive={settings?.push as boolean}
              isWaitlist={false}
              onPress={() => {
                if (settings) {
                  dispatch(setSettings({ ...settings, push: !settings.push }));
                }
              }}
            />

            <NotificationCard
              title="Email Notifications"
              description="Enable email notifications to stay informed when the price reaches your desired level."
              isActive={settings?.email as boolean}
              isWaitlist={false}
              onPress={() => {
                if (settings) {
                  dispatch(
                    setSettings({ ...settings, email: !settings.email })
                  );
                }
              }}
            />
          </Box>
          <Box
            width="100%"
            height={60}
            paddingHorizontal="m"
            justifyContent="center"
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

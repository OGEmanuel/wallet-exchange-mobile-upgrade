import icons from "@/assets/icons";
import { ThemedChevronDownIcon } from "@/assets/svg/wallet-icons-components";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import AppBottomSheet, {
  AppBottomSheetRef,
} from "@/components/bottomsheet/AppBottomSheet";
import Loader from "@/components/dashboard/market/Loader";
import Switch from "@/components/dashboard/market/Switch";
import TokenImage from "@/components/dashboard/market/TokenImage";
import TouchableIcon from "@/components/dashboard/market/TouchableIcon";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText, PageWrapper } from "@/components/general";
import CustomButton from "@/components/general/CustomButton";
import {
  formatAccountValue,
  formatToSigFigMax6Digits,
  getApproximateAmount,
} from "@/lib/utils/market/helpers";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import { PriceAlertData } from "@/src/modules/market/data/remote/market-remote-datasource";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";

type PriceAlert = {
  userId: string;
  currencyId: string;
  alertType: "up" | "down" | "up-down";
  duration: "oneTime" | "recurrent";
  priceThreshold: number;
  percentageChange: number;
  timeFrame: number;
  lastNotified: string;
  isActive: boolean;
};

type FrequencyOption = {
  label: string;
  seconds: number;
};

// Time frequency options in seconds
const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { label: "Every 5 minutes", seconds: 300 },
  { label: "Every 15 minutes", seconds: 900 },
  { label: "Every 30 minutes", seconds: 1800 },
  { label: "Every 45 minutes", seconds: 2700 },
  { label: "Every 1 hour", seconds: 3600 },
  { label: "Every 2 hours", seconds: 7200 },
  { label: "Every 24 hours", seconds: 86400 },
];

const AlertType = ({
  type,
  onPress,
  text,
}: {
  type: "up" | "down";
  text: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        height={36}
        width="100%"
        flexDirection="row"
        alignItems="center"
        gap="s"
      >
        <Box
          width={36}
          height={36}
          borderRadius={8}
          bg="secondaryBackgroundColor"
          alignItems="center"
          justifyContent="center"
        >
          <TouchableIcon
            source={type === "up" ? icons.topRight : icons.bottomRight}
          />
        </Box>
        <CustomText variant="body" fontSize={16}>
          {text}
        </CustomText>
      </Box>
    </TouchableOpacity>
  );
};

export default function CreatePriceAlerts() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { asset } = useLocalSearchParams();
  const parsedAsset = asset ? JSON.parse(asset as string) : null;

  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const { currentTokenDetails } = useSelector(
    (state: AppRootState) => state.market
  );

  const user = useSelector((state: AppRootState) => state.kyc.user);
  const token = currentTokenDetails?.tokenDetails;
  const { createPriceAlert } = useMarket();

  const [alertType, setAlertType] = useState("");
  const [alertPrice, setAlertPrice] = useState<number>(0);
  const [alertPriceText, setAlertPriceText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [selectedFrequency, setSelectedFrequency] =
    useState<FrequencyOption | null>(null);
  const [priceError, setPriceError] = useState<string>("");
  const alertTypeSheetRef = useRef<AppBottomSheetRef>(null);
  const frequencySheetRef = useRef<AppBottomSheetRef>(null);

  const handleOpenAlertTypeSheet = () => {
    alertTypeSheetRef.current?.open();
  };

  const handleOpenFrequencySheet = () => {
    frequencySheetRef.current?.open();
  };

  // Handle text input for price/percentage - only allow numbers and decimal point
  const handlePriceChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedText = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = sanitizedText.split(".");
    const formattedText =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : sanitizedText;

    setAlertPriceText(formattedText);
    setAlertPrice(parseFloat(formattedText) || 0);
  };

  // Handle frequency selection
  const handleFrequencySelect = (seconds: number, label: string) => {
    setSelectedFrequency({ label, seconds });
    setRecurring(true);
  };

  // Validate price based on alert type
  useEffect(() => {
    if (alertType && alertPrice > 0) {
      const currentPrice = parsedAsset?.rate || 0;

      const isPriceAlert = alertType.includes("$");
      const isAboveAlert = alertType.includes("above");
      const isBelowAlert = alertType.includes("below");

      if (isPriceAlert) {
        if (isAboveAlert && alertPrice <= currentPrice) {
          setPriceError(
            `Alert price must be higher than current price (${currentPrice})`
          );
        } else if (isBelowAlert && alertPrice >= currentPrice) {
          setPriceError(
            `Alert price must be lower than current price (${currentPrice})`
          );
        } else {
          setPriceError("");
        }
      } else {
        // For percentage-based alerts, ensure percentage is reasonable
        if (alertPrice <= 0) {
          setPriceError("Please enter a percentage greater than 0");
        } else if (alertPrice > 100) {
          setPriceError("Percentage change is unreasonably high");
        } else {
          setPriceError("");
        }
      }
    } else if (alertType && alertPrice === 0) {
      setPriceError("Please enter a valid value");
    } else {
      setPriceError("");
    }
  }, [alertType, alertPrice, currentTokenDetails?.tokenMetrics?.marketCap]);

  // Reset price input when alert type changes
  useEffect(() => {
    setAlertPriceText("");
    setAlertPrice(0);
    setPriceError("");
  }, [alertType]);

  // Handle alert creation
  const handleCreateAlert = async () => {
    if (priceError) {
      showErrorToast(priceError);
      return;
    }

    if (!alertPrice || alertPrice <= 0) {
      showErrorToast("Please enter a valid value");
      return;
    }

    setIsLoading(true);

    try {
      // Determine if this is a price or percentage based alert
      const isPriceAlert = alertType.includes("$");
      const isUpAlert = alertType.includes("above") || alertType.includes("up");
      const newAlert: PriceAlertData = {
        userId: user?._id || "",
        currencyId: currentTokenDetails?.tokenMetrics?.currencyId || "",
        alertType: isUpAlert ? "up" : "down",
        duration: recurring ? "recurrent" : "oneTime",
      };

      // Set either price threshold or percentage change based on alert type
      if (isPriceAlert) {
        newAlert.priceThreshold = alertPrice;
      } else {
        newAlert.percentageChange = alertPrice;
      }

      if (recurring && selectedFrequency?.seconds) {
        newAlert.timeFrame = selectedFrequency.seconds;
      }

      // Test if user has valid data
      if (!user?._id) {
        showErrorToast("Please log in to create price alerts");
        return;
      }

      if (!currentTokenDetails?.tokenMetrics?.currencyId) {
        showErrorToast("Unable to get token information");
        return;
      }

      const response = await createPriceAlert({
        body: newAlert,
        params: {},
        extra: null,
      });

      if (response?.success) {
        showSuccessToast("Price alert created successfully!");
        router.back();
      } else {
        showErrorToast(response?.message || "Failed to create price alert");
      }
    } catch (error) {
      showErrorToast("Failed to create price alert. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Box flex={1} paddingBottom="xl" position="relative">
        {/* Header */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="m"
          marginHorizontal="m"
        >
          <Box width={92}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: true,
              }}
            >
              <SvgXml
                xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
                width={16}
                height={16}
              />
            </Pressable>
          </Box>
          <CustomText
            variant="bodySubheader"
            fontSize={20}
            style={{ fontFamily: "NewScience_Bold" }}
          >
            Create Price Alert
          </CustomText>
          <Box width={80} />
        </Box>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Token Info Card */}
          <Box
            width="100%"
            bg="secondaryBackgroundColor"
            borderRadius={16}
            padding="m"
            marginBottom="m"
            alignItems="center"
          >
            <Box
              flexDirection="row"
              alignItems="center"
              gap="s"
              marginBottom="s"
            >
              <TokenImage
                name={token?.name || currentTokenDetails?.tokenDetails?.name}
                uri={token?.logo || currentTokenDetails?.tokenDetails?.logo}
                size={28}
              />
              <CustomText variant="bodySubheader" fontSize={16}>
                {token?.name ||
                  currentTokenDetails?.tokenDetails?.name ||
                  "Bitcoin"}
              </CustomText>
            </Box>

            <Box alignItems="center">
              <CustomText variant="bodyBold" fontSize={18} marginBottom="s">
                {formatAccountValue({
                  value: parsedAsset?.rate || 0,
                  currency: "USD",
                  convert: true,
                  rate: 1600,
                  showSymbol: true,
                  getApproximateAmount: getApproximateAmount,
                })}
              </CustomText>
              <CustomText variant="body" fontSize={14} color="success">
                {formatToSigFigMax6Digits(parsedAsset?.dailyChange || 1)}%
              </CustomText>
            </Box>
          </Box>

          {/* Alert Type Selection */}
          <Box marginBottom="m">
            <TouchableOpacity onPress={handleOpenAlertTypeSheet}>
              <Box
                bg="secondaryBackgroundColor"
                borderRadius={12}
                padding="m"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                borderWidth={1}
                // borderColor="disabledTextColor"
              >
                <CustomText variant="body" fontSize={16}>
                  {alertType || "Choose Alert Type"}
                </CustomText>
                <CustomText style={{ color: theme.colors.bodyTextColor }}>
                  <ThemedChevronDownIcon
                    lightModeColor={theme.colors.bodyTextColor}
                    darkModeColor={theme.colors.bodyTextColor}
                  />
                </CustomText>
              </Box>
            </TouchableOpacity>
          </Box>

          {alertType.length > 0 && (
            <Box>
              <Box marginBottom="m">
                <CustomInputWithoutForm
                  label={
                    alertType.includes("%") ? "Enter Percentage" : "Enter Price"
                  }
                  value={alertPriceText}
                  onChange={handlePriceChange}
                />
                {priceError && (
                  <CustomText
                    variant="body"
                    fontSize={12}
                    color="error"
                    marginTop="s"
                  >
                    {priceError}
                  </CustomText>
                )}
              </Box>

              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="m"
              >
                <CustomText variant="body" fontSize={16}>
                  Recurring Alert
                </CustomText>
                <Switch
                  value={recurring}
                  onValueChange={(val: boolean) => {
                    setRecurring(val);
                    if (!val) {
                      setSelectedFrequency(null);
                    }
                  }}
                />
              </Box>

              {recurring && (
                <Box marginBottom="m">
                  <TouchableOpacity onPress={handleOpenFrequencySheet}>
                    <Box
                      bg="secondaryBackgroundColor"
                      borderRadius={12}
                      padding="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      borderWidth={1}
                    >
                      <CustomText variant="body" fontSize={16}>
                        {selectedFrequency?.label || "Choose Frequency"}
                      </CustomText>
                      <CustomText style={{ color: theme.colors.bodyTextColor }}>
                        <ThemedChevronDownIcon
                          lightModeColor={theme.colors.bodyTextColor}
                          darkModeColor={theme.colors.bodyTextColor}
                        />
                      </CustomText>
                    </Box>
                  </TouchableOpacity>
                </Box>
              )}
            </Box>
          )}
        </ScrollView>
        <Box paddingVertical="m" marginHorizontal="m">
          <CustomButton
            text="Create Alert"
            onPress={handleCreateAlert}
            width="100%"
            borderRadius={50}
            height={50}
            bgColor="#6045FF"
            disabled={
              !alertType ||
              alertPrice <= 0 ||
              (recurring && !selectedFrequency) ||
              !!priceError
            }
            isLoading={isLoading}
          />
        </Box>

        <AppBottomSheet
          ref={alertTypeSheetRef}
          snapPoints={["85%"]}
          title="Select Alert Type"
        >
          <Box gap="s">
            <AlertType
              type="up"
              text="Price goes above ($)"
              onPress={() => {
                alertTypeSheetRef.current?.close();
                setAlertType("Price goes above ($)");
              }}
            />

            <AlertType
              type="down"
              text="Price goes below ($)"
              onPress={() => {
                alertTypeSheetRef.current?.close();
                setAlertType("Price goes below ($)");
              }}
            />

            <AlertType
              type="up"
              text="Price goes up more than (%)"
              onPress={() => {
                alertTypeSheetRef.current?.close();
                setAlertType("Price goes up more than (%)");
              }}
            />

            <AlertType
              type="down"
              text="Price goes down more than (%)"
              onPress={() => {
                alertTypeSheetRef.current?.close();
                setAlertType("Price goes down more than (%)");
              }}
            />
          </Box>
        </AppBottomSheet>

        <AppBottomSheet
          ref={frequencySheetRef}
          snapPoints={["80%"]}
          title="Select Frequency"
        >
          <Box gap="s">
            {FREQUENCY_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={`freq-${index}`}
                onPress={() => {
                  frequencySheetRef.current?.close();
                  handleFrequencySelect(option.seconds, option.label);
                }}
              >
                <Box
                  padding="m"
                  bg="secondaryBackgroundColor"
                  borderRadius={12}
                >
                  <CustomText variant="body" fontSize={16}>
                    {option.label}
                  </CustomText>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        </AppBottomSheet>

        {isLoading && (
          <Box
            flex={1}
            paddingBottom="xl"
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
          >
            <Loader visible={isLoading} />
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
}

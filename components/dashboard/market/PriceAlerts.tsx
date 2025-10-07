import Button from "@/components/Button";
import SettingItem from "@/components/SettingItem";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import AppText from "../../../components/AppText";
import EmptyState from "../../../components/ui/EmptyState";
import Search from "../../../components/ui/Search";
import { useBottomSheet } from "../../../hooks/useBottomSheet";
import Base from "../../../layouts/Base";

// Safe dimensions with fallback
const getScreenHeight = () => {
  try {
    return Dimensions.get("window").height || 800;
  } catch (error) {
    return 800; // Fallback height
  }
};

// Mock types
interface Currency {
  _id: string;
  name: string;
  symbol: string;
  logo?: string;
}

interface PriceAlert {
  _id: string;
  currencyId: Currency;
  targetPrice: number;
  isActive: boolean;
  alertType: "up" | "down";
  createdAt: string;
}

// Mock implementations
const useToast = () => ({
  success: (message: string) => console.log("Toast:", message),
  error: (message: string) => console.log("Toast Error:", message),
});

const usePriceAlerts = () => ({
  alerts: [] as PriceAlert[],
  refetch: () => Promise.resolve(),
  isLoading: false,
  isRefetching: false,
});

const updatePriceAlert = (data: any) => ({
  type: "UPDATE_PRICE_ALERT",
  payload: data,
});

// Mock components
const If = ({
  condition,
  children,
}: {
  condition: boolean;
  children: React.ReactNode;
}) => {
  return condition ? <>{children}</> : null;
};

const PriceAlertItem = ({ alert, onToggle }: any) => (
  <View className="p-4 border-b border-gray-200">
    <AppText variant="h5">{alert.currencyId.name}</AppText>
    <AppText variant="h6">${alert.targetPrice}</AppText>
  </View>
);

const SelectToken = ({ bottomSheetRef, onSelect }: any) => null;

interface AlertGroup {
  currencyInfo: Currency;
  alerts: PriceAlert[];
}

// Helper function to deep compare arrays (moved outside component)
const areAlertsEqual = (a: PriceAlert[], b: PriceAlert[]) => {
  if (a.length !== b.length) return false;
  return a.every((alert, index) => {
    const otherAlert = b[index];
    return (
      alert._id === otherAlert._id &&
      alert.targetPrice === otherAlert.targetPrice &&
      alert.isActive === otherAlert.isActive
    );
  });
};

export default function PriceAlerts() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { alerts, refetch, isLoading, isRefetching } = usePriceAlerts();

  const { bottomSheetRef: selectTokenSheetRef, open: openSelectTokenSheet } =
    useBottomSheet();
  const toast = useToast();
  const dispatch = useDispatch();
  // Mock redux alerts since market state doesn't exist
  const reduxAlerts: PriceAlert[] = [];

  // Debounce timer for focus-triggered refetches
  const focusDebounceRef = useRef<number | null>(null);

  // Track if initial mount has occurred
  const isInitialMount = useRef(true);

  // Track last updated alerts to prevent unnecessary updates
  const lastAlertsRef = useRef<PriceAlert[]>([]);

  // Update Redux store when alerts change (with proper comparison)
  useEffect(() => {
    if (alerts && !areAlertsEqual(alerts, lastAlertsRef.current)) {
      lastAlertsRef.current = alerts;
      dispatch(updatePriceAlert(alerts));
    }
  }, [alerts, dispatch]); // Removed reduxAlerts from dependencies

  // useFocusEffect(
  //   useCallback(() => {
  //     // Skip on initial mount since the hook already does the initial fetch
  //     if (isInitialMount.current) {
  //       isInitialMount.current = false
  //       return
  //     }

  //     // Clear any existing timers
  //     if (focusDebounceRef.current) {
  //       clearTimeout(focusDebounceRef.current)
  //     }

  //     // Debounce the refetch with 300ms delay
  //     focusDebounceRef.current = setTimeout(() => {
  //       refetch().catch((error) => {
  //         console.error("Focus refetch error:", error)
  //         toast.error("Failed to update price alerts")
  //       })
  //     }, 300)

  //     return () => {
  //       // Cleanup timer on blur
  //       if (focusDebounceRef.current) {
  //         clearTimeout(focusDebounceRef.current)
  //       }
  //     }
  //   }, []),
  // )

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (isRefetching) return;

    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      toast.error("Failed to update price alerts");
    } finally {
      setRefreshing(false);
    }
  }, [refetch, isRefetching, toast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
    };
  }, []);

  // Toggle price alerts (memoized to prevent re-renders)
  const togglePriceAlerts = useCallback(() => {
    setIsEnabled((prevState) => {
      const newState = !prevState;
      // Here you would typically call an API to update user preferences
      return newState;
    });
  }, []);

  // Use alerts from the hook instead of redux to avoid circular updates
  const alertsToUse = alerts || reduxAlerts;

  // Filter alerts based on search query
  const filteredAlerts = React.useMemo(() => {
    if (!searchQuery.trim()) return alertsToUse;

    const query = searchQuery.toLowerCase().trim();
    return alertsToUse.filter(
      (alert: PriceAlert) =>
        alert.currencyId.name.toLowerCase().includes(query) ||
        alert.currencyId.symbol.toLowerCase().includes(query)
    );
  }, [alertsToUse, searchQuery]); // Use alertsToUse instead of reduxAlerts

  // Group alerts by currency ID
  const groupedAlerts = React.useMemo<AlertGroup[]>(() => {
    const groupedByCurrency: Record<string, AlertGroup> = {};

    filteredAlerts.forEach((alert: PriceAlert) => {
      const currencyId = alert?.currencyId?._id || "";

      if (!groupedByCurrency[currencyId]) {
        groupedByCurrency[currencyId] = {
          currencyInfo: alert.currencyId,
          alerts: [],
        };
      }
      groupedByCurrency[currencyId].alerts.push(alert);
    });

    return Object.values(groupedByCurrency);
  }, [filteredAlerts]);

  // Handle search input change
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Navigate to create alert screen
  const navigateToCreateAlert = useCallback(
    (token: any) => {
      if (selectTokenSheetRef?.current) {
        selectTokenSheetRef.current.close();
        router.push({
          pathname: "/modules/markets/CreatePriceAlerts",
          params: { token: JSON.stringify(token) },
        } as unknown as Href);
      }
    },
    [router]
  );

  // Open token selection sheet
  const openTokenSelector = useCallback(() => {
    openSelectTokenSheet();
  }, [openSelectTokenSheet]);

  // Clear search query
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Handle alert update after deletion
  const handleAlertUpdate = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refetching after deletion:", error);
      toast.error("Failed to update price alerts");
    }
  }, [refetch, toast]);

  return (
    <Base title="Price Alerts" canGoBack>
      <View style={{ height: getScreenHeight() - 180 }} className="flex-1">
        <SettingItem
          title="Enable price alerts to stay informed when the price reaches your desired level."
          isToggle
          isEnabled={isEnabled}
          setIsEnabled={togglePriceAlerts}
          textClassName="text-[14px] w-[80%] leading-[21px]"
        />

        <View className="px-[16px] mt-4">
          <Search
            placeholder="Search for token"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <AppText className="mt-4">Loading price alerts...</AppText>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View className="mb-[100px]">
              {groupedAlerts.length > 0 ? (
                groupedAlerts.map((group, index) => (
                  <PriceAlertItem
                    key={`${group?.currencyInfo?._id || "cccc"}-${index}`}
                    data={group}
                    onUpdate={handleAlertUpdate}
                  />
                ))
              ) : (
                <View className="items-center justify-center mt-12">
                  {searchQuery ? (
                    <EmptyState
                      title="No matching alerts found"
                      info="Try a different search query"
                      onPress={clearSearch}
                    >
                      <AppText>Clear search</AppText>
                    </EmptyState>
                  ) : (
                    <EmptyState
                      title="No price alerts yet"
                      info="Create a price alert to stay informed when the price reaches your desired level."
                      onPress={openTokenSelector}
                    >
                      <AppText>Create Alert</AppText>
                    </EmptyState>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <If condition={!searchQuery && groupedAlerts.length > 0 && !isLoading}>
          <View className="absolute bottom-0 items-center self-center w-full px-[16px] pb-[16px]">
            <Button onPress={openTokenSelector}>
              <AppText>Create Alert</AppText>
            </Button>
          </View>
        </If>
      </View>

      <SelectToken
        bottomSheetRef={selectTokenSheetRef}
        onSelect={navigateToCreateAlert}
      />
    </Base>
  );
}

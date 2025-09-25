import useCurrencyHistory from "@/hooks/useCurrencyHistory";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { ErrorState, Text } from "..";
import HistoryItem from "./HistoryItem";

export default function TransactionHistory({ id }: { id: string }) {
  const { history, loading, error } = useCurrencyHistory(id);

  // Group history items by date
  const groupedHistory = useMemo(() => {
    if (!history?.length) return [];

    const groups: Record<string, any[]> = {};

    history.forEach((item) => {
      // Format date to display as "Feb 9th" etc.
      const date = new Date(item.createdAt);
      const formattedDate = format(date, "MMM do");

      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }

      groups[formattedDate].push(item);
    });

    // Convert to array for rendering
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  }, [history]);

  if (loading) {
    return (
      <View className="w-full items-center justify-center py-8">
        <ActivityIndicator size="large" color="#6045FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="w-full items-center justify-center py-8">
        <ErrorState
          title="Failed to load history"
          info="We couldn't load your transaction history. Please try again later."
          btnTitle="Retry"
          onPress={() => {
            // You can add a refetch function here if available
            console.log("Retry loading history");
          }}
        />
      </View>
    );
  }

  if (!history?.length) {
    return (
      <View className="w-full items-center justify-center py-8">
        <Text className="text-gray-500">No transaction history found</Text>
      </View>
    );
  }

  return (
    <View className="w-full mt-4">
      {groupedHistory.map((group, groupIndex) => (
        <View key={groupIndex} className="mb-4">
          <View className="w-full bg-background h-[24px] items-center px-[16px] flex-row">
            <Text>{group.date}</Text>
          </View>
          {group.items.map((item, itemIndex) => (
            <HistoryItem key={item._id || itemIndex} data={item} />
          ))}
        </View>
      ))}
    </View>
  );
}

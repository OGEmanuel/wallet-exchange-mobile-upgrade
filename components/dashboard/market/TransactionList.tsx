import { SIZES } from "@/data";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import HistoryItem from "../market/HistoryItem";
import TransactionGroupHeader from "./TransactionGroupHeader";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface TransactionListProps {
  groupedTransactions: Array<{
    dateKey: string;
    timestamp: number;
    transactions: any[];
  }>;
  refreshing: boolean;
  onRefresh: () => void;
  loading: boolean;
  isDarkMode: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  groupedTransactions,
  refreshing,
  onRefresh,
  loading,
  isDarkMode,
  onEndReached,
  onEndReachedThreshold = 0.5,
}) => {
  // Flatten grouped transactions for FlatList
  const flatData = groupedTransactions?.flatMap((group) => [
    { type: "header", dateKey: group.dateKey, timestamp: group.timestamp },
    ...group.transactions.map((txn: any) => ({
      type: "item",
      ...txn,
      groupDate: group.dateKey,
      timestamp: group.timestamp,
    })),
  ]);

  const renderItem = ({ item }: any) => {
    if (item.type === "header") {
      const dateObj = new Date(item.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let label: string;
      if (isSameDay(dateObj, today)) {
        label = "Today";
      } else if (isSameDay(dateObj, yesterday)) {
        label = "Yesterday";
      } else {
        label = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return <TransactionGroupHeader label={label} />;
    }
    return <HistoryItem key={item._id} data={item} />;
  };

  return (
    <View style={{ height: SIZES.height - 200 }}>
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item, idx) =>
          item.type === "header"
            ? `header-${item.dateKey}`
            : item._id || idx.toString()
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? "#FFFFFF" : "#121212"}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : (
            <View style={{ height: 100 }} />
          )
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    </View>
  );
};

export default TransactionList;

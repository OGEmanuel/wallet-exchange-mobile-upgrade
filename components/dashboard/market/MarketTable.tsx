import React, { memo } from "react";
import { ScrollView, View } from "react-native";
import { useActiveMarket } from "../hooks";
import CategoryOptions from "./CategoryOption";
import TableHeader from "./TableHeader";
import TableItem from "./TableItem";

function MarketTable() {
  const {
    activeMarkets,
    selectedCategory,
    setSelectedCategory,
    selectedCurrency,
    setSelectedCurrency,
    currentRate,
  } = useActiveMarket();

  return (
    <View className="mt-[16px] ">
      <CategoryOptions
        selectedCategory={selectedCategory}
        selectedCurrency={selectedCurrency}
        setSelectedCategory={setSelectedCategory}
        setSelectedCurrency={setSelectedCurrency}
      />
      <TableHeader />
      <View className="min-h-[400px] border-cardBorder border-t">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-[300px] ">
            {activeMarkets.map((item, index) => (
              <TableItem
                key={`${item?.marketData?.currencyId?._id}${index}`}
                data={item}
                number={index + 1}
                currentRate={currentRate}
                selectedCurrency={selectedCurrency}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(MarketTable);

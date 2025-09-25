import FilterPill from "@/components/dashboard/market/FilterPill";
import MarketTableItem from "@/components/dashboard/market/MarketTableItem";
import SwitchTab from "@/components/dashboard/market/SwitchTab";
import TableHeader from "@/components/dashboard/market/TableHeader";
import { PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { marketData, watchlistData } from "@/data";
import React, { useState } from "react";
import { Pressable, ScrollView } from "react-native";

const Explore = () => {
  const [isTokens, setIsTokens] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const categories = ["All", "Top Gainers", "Top Losers"];
  const currencies = ["USD", "NGN"];

  const currentData = isTokens ? marketData : watchlistData;

  return (
    <PageWrapper>
      <Box width="100%" alignItems="center">
        <CustomText
          variant="bodyBold"
          textAlign="center"
          style={{ fontFamily: "NewScience_Bold" }}
        >
          Markets
        </CustomText>
      </Box>
      <Box width="100%" mt="m">
        <SwitchTab
          active={isTokens}
          setActive={setIsTokens}
          firstText="Tokens"
          secondText="Watchlist"
        />
      </Box>

      {/* Category Filters */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="l"
        mt="s"
        width="100%"
      >
        <Box flexDirection="row">
          {categories.map((category) => (
            <FilterPill
              key={category}
              label={category}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </Box>
        <Box
          flexDirection="row"
          bg="secondaryBackgroundColor"
          borderRadius={20}
          padding="s"
        >
          {currencies.map((currency) => (
            <Pressable
              key={currency}
              onPress={() => setSelectedCurrency(currency)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor:
                  selectedCurrency === currency
                    ? "rgba(196, 230, 77, 0.2)"
                    : "transparent",
                borderWidth: selectedCurrency === currency ? 1 : 0,
                borderColor:
                  selectedCurrency === currency ? "#C7E64D" : "transparent",
              }}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: true,
              }}
            >
              <CustomText variant="body" fontSize={10} color="bodyTextColor">
                {currency}
              </CustomText>
            </Pressable>
          ))}
        </Box>
      </Box>

      <Box
        bg="secondaryBackgroundColor"
        flex={1}
        borderRadius={8}
        marginTop="s"
        marginHorizontal="m"
      >
        <TableHeader />

        {/* Market Data Table */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {currentData.map((item, index) => (
            <MarketTableItem key={item.id} item={item} index={index} />
          ))}
        </ScrollView>
      </Box>
    </PageWrapper>
  );
};

export default Explore;

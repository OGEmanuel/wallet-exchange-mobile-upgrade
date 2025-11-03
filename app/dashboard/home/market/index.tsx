import images from "@/assets/images";
import CurrencyTab from "@/components/dashboard/market/CurrencyTab";
import EmptyState from "@/components/dashboard/market/EmptyState";
import Loader from "@/components/dashboard/market/Loader";
import MarketFilter from "@/components/dashboard/market/MarketFilter";
import MarketTableItem from "@/components/dashboard/market/MarketTableItem";
import SwitchTab from "@/components/dashboard/market/SwitchTab";
import TableHeader from "@/components/dashboard/market/TableHeader";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import { MarketTokenModel } from "@/src/modules/market/domain/entities/models/market-token-model";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useSelector } from "react-redux";

const Explore = () => {
  const [isTokens, setIsTokens] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCurrency, setSelectedCurrency] = useState<
    CurrencyModel | undefined
  >();
  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  // const [filteredCurrencies, setFilteredCurrencies] = useState<
  //   (CurrencyModel | undefined)[] | null
  // >(null);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { currencies } = useSelector((state: AppRootState) => state.utilities);
  const { marketTokens, watchlistTokens } = useSelector(
    (state: AppRootState) => state.market
  );
  const { user } = useSelector((state: AppRootState) => state.kyc);

  const { fetchMarketTokens, fetchWatchlistTokens } = useMarket();
  const { fetchCurrencies } = useUtilities();

  const retrieveNairaCurrency = useCallback((): void => {
    if (currencies) {
      const nairaCurrency = currencies.find(
        (currency) => currency.code === "NGN"
      );
      if (nairaCurrency) {
        setNairaCurrency(nairaCurrency);
      }
    }
  }, [currencies]);

  const retrieveUsdCurrency = useCallback((): void => {
    if (currencies) {
      const usdCurrency = currencies.find(
        (currency) => currency.code === "USD"
      );
      if (usdCurrency) {
        setUsdCurrency(usdCurrency);
        setSelectedCurrency(usdCurrency);
      }
    }
  }, [currencies]);

  // Function to fetch market tokens with proper error handling
  const loadMarketTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      // setIsError(false);
      setErrorMessage(null);

      await fetchMarketTokens({
        body: {},
        params: {},
        extra: {},
      });
    } catch (error) {
      // setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrencies = useCallback(async () => {
    await fetchCurrencies({
      body: {},
      params: {},
      extra: {},
    }).then(() => {
      retrieveNairaCurrency();
      retrieveUsdCurrency();
    });
  }, []);

  // Function to fetch watchlist tokens
  const loadWatchlistTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await fetchWatchlistTokens({
        body: {},
        params: {},
        extra: user,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading watchlist. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchWatchlistTokens, user]);

  useEffect(() => {
    if (currencies && currencies.length > 0) {
      const usd = currencies.find((c) => c.code === "USD");
      const ngn = currencies.find((c) => c.code === "NGN");

      setUsdCurrency(usd);
      setNairaCurrency(ngn);
      setSelectedCurrency(usd); // default USD
      // setFilteredCurrencies([usd, ngn]);
    }
  }, [currencies]);

  useEffect(() => {
    loadCurrencies();
    loadMarketTokens();
  }, []);

  // Load watchlist when switching to watchlist tab
  useEffect(() => {
    if (!isTokens && user) {
      loadWatchlistTokens();
    }
  }, [isTokens, user, loadWatchlistTokens]);

  const categories = ["All", "Top Gainers", "Top Losers"];

  // Filter market tokens based on selected category
  const filteredMarketTokens = React.useMemo(() => {
    if (!marketTokens) return null;

    switch (selectedCategory) {
      case "Top Gainers":
        return [...marketTokens]
          .filter((token) => token.change24h && token.change24h > 0)
          .sort((a, b) => (b.change24h || 0) - (a.change24h || 0));

      case "Top Losers":
        return [...marketTokens]
          .filter((token) => token.change24h && token.change24h < 0)
          .sort((a, b) => (a.change24h || 0) - (b.change24h || 0));

      case "All":
      default:
        return marketTokens;
    }
  }, [marketTokens, selectedCategory]);

  // Filter watchlist tokens based on selected category
  const filteredWatchlistTokens = React.useMemo(() => {
    if (!watchlistTokens) return null;

    // Extract market data from watchlist items
    const watchlistMarketData = watchlistTokens
      .map((item) => item.marketData)
      .filter(Boolean) as MarketTokenModel[];

    if (watchlistMarketData.length === 0) return [];

    switch (selectedCategory) {
      case "Top Gainers":
        return [...watchlistMarketData]
          .filter((token) => token.change24h && token.change24h > 0)
          .sort((a, b) => (b.change24h || 0) - (a.change24h || 0));

      case "Top Losers":
        return [...watchlistMarketData]
          .filter((token) => token.change24h && token.change24h < 0)
          .sort((a, b) => (a.change24h || 0) - (b.change24h || 0));

      case "All":
      default:
        return watchlistMarketData;
    }
  }, [watchlistTokens, selectedCategory]);

  // Get the current data to display based on tab selection
  const currentData = isTokens ? filteredMarketTokens : filteredWatchlistTokens;

  const currentLoading = isTokens
    ? isLoading && !marketTokens
    : isLoading && !watchlistTokens;

  const currentError = isTokens
    ? !!errorMessage && !marketTokens
    : !!errorMessage && !watchlistTokens;

  // Check if watchlist is empty (has been loaded but no items)
  // const isWatchlistEmpty =
  //   !isTokens && watchlistTokens && watchlistTokens.length === 0;

  const watchlistEmptyState = (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="l"
      paddingVertical="xl"
    >
      <EmptyState
        title="No tokens in watchlist"
        info="Add tokens to your watchlist to track their prices and get alerts when they change."
        hasNoBtn={true}
        source={images.glass}
      />
    </Box>
  );

  return (
    <PageWrapper>
      <SettingsHeader title="Markets" onBackPress={() => router.back()} />
      <Box width="100%" mt="m">
        <SwitchTab
          active={isTokens}
          setActive={setIsTokens}
          firstText="Tokens"
          secondText="Watchlist"
        />
      </Box>

      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="l"
        mt="s"
        width="100%"
      >
        <Box flexDirection="row">
          {categories.map((category, index) => (
            <MarketFilter
              key={index}
              label={category}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </Box>

        <CurrencyTab
          selectedCurrency={selectedCurrency?.code as "USD" | "NGN"}
          setSelectedCurrency={(code) => {
            const foundCurrency = currencies?.find((c) => c.code === code);
            setSelectedCurrency(foundCurrency);
          }}
        />
      </Box>

      <LoaderWrapper
        isLoading={currentLoading}
        isError={currentError}
        errorMessage={errorMessage}
        onRetry={isTokens ? loadMarketTokens : loadWatchlistTokens}
        isEmpty={
          !currentLoading &&
          !currentError &&
          (!currentData || currentData?.length === 0)
        }
        emptyComponent={watchlistEmptyState}
        existingData={!currentData}
      >
        <Box
          // bg="modalBackgroundColor"
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
            {currentData?.map((item, index) => (
              <MarketTableItem
                key={index}
                item={item}
                index={index}
                selectedCurrency={selectedCurrency?.code as "USD" | "NGN"}
                nairaCurrency={nairaCurrency}
                usdCurrency={usdCurrency}
              />
            ))}
          </ScrollView>
        </Box>
      </LoaderWrapper>
      <Loader visible={currentLoading} />
    </PageWrapper>
  );
};

export default Explore;

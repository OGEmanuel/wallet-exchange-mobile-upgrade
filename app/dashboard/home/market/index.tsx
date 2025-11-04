import icons from "@/assets/icons";
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
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { MarketData } from "@zap/blockchain-sdk";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView } from "react-native";
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

      await fetchMarketTokens();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading market tokens. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchMarketTokens]);

  // Function to fetch watchlist tokens with proper error handling
  const loadWatchlistTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await fetchWatchlistTokens();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading watchlist. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchWatchlistTokens]);

  // Function to fetch currencies
  const loadCurrencies = useCallback(async () => {
    try {
      await fetchCurrencies();
    } catch (error) {
      console.error("Failed to load currencies:", error);
    }
  }, [fetchCurrencies]);

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

  const getTokenChange = (token: MarketData) =>
    (token as { change24h?: number }).change24h;

  // Filter market tokens based on selected category
  const filteredMarketTokens = React.useMemo(() => {
    if (!marketTokens) return null;

    switch (selectedCategory) {
      case "Top Gainers":
        return [...marketTokens]
          .filter((token) => {
            const change = getTokenChange(token);
            return change && change > 0;
          })
          .sort((a, b) =>
            (getTokenChange(b) || 0) - (getTokenChange(a) || 0)
          );

      case "Top Losers":
        return [...marketTokens]
          .filter((token) => {
            const change = getTokenChange(token);
            return change && change < 0;
          })
          .sort((a, b) =>
            (getTokenChange(a) || 0) - (getTokenChange(b) || 0)
          );

      case "All":
      default:
        return marketTokens;
    }
  }, [marketTokens, selectedCategory]);

  // Filter watchlist tokens based on selected category
  const filteredWatchlistTokens = React.useMemo(() => {
    if (!watchlistTokens) return null;

    const watchlistMarketData = watchlistTokens
      .map((item) => item.marketData)
      .filter(Boolean) as MarketData[];

    if (watchlistMarketData.length === 0) return [];

    switch (selectedCategory) {
      case "Top Gainers":
        return [...watchlistMarketData]
          .filter((token) => {
            const change = getTokenChange(token);
            return change && change > 0;
          })
          .sort((a, b) =>
            (getTokenChange(b) || 0) - (getTokenChange(a) || 0)
          );

      case "Top Losers":
        return [...watchlistMarketData]
          .filter((token) => {
            const change = getTokenChange(token);
            return change && change < 0;
          })
          .sort((a, b) =>
            (getTokenChange(a) || 0) - (getTokenChange(b) || 0)
          );

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

  const openWatchlistModal = useCallback(() => {
    router.push("/(modal)/select-watchlist");
  }, [router]);

  const renderFloatingActionButton = () => (
    <Pressable
      onPress={openWatchlistModal}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#6366F1",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      hitSlop={12}
    >
      <Image
        source={icons.edit}
        style={{
          width: 20,
          height: 20,
          tintColor: "white",
        }}
      />
    </Pressable>
  );

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

      <Box position="absolute" bottom={40} right={24}>
        {renderFloatingActionButton()}
      </Box>
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
          position="relative"
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

          {/* Floating Edit Icon - display only on Watchlist tab */}
          {!isTokens && (
            <Box
              position="absolute"
              bottom={20}
              right={20}
              zIndex={10}
            >
              <Pressable
                onPress={() => {
                  router.push("/(modal)/select-watchlist");
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#6366F1",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Image
                  source={icons.edit}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: "white",
                  }}
                />
              </Pressable>
            </Box>
          )}
        </Box>
      </LoaderWrapper>
      <Loader visible={currentLoading} />
    </PageWrapper>
  );
};

export default Explore;

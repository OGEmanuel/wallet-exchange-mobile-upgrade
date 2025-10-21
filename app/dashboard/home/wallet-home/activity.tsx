import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import ApprovedBottomSheet from "@/components/bottomsheets/ApprovedBottomSheet";
import BuyActivityBottomSheet from "@/components/bottomsheets/BuyActivityBottomSheet";
import RecieveBottomSheet from "@/components/bottomsheets/ReceiveBottomSheet";
import SentBottomSheet from "@/components/bottomsheets/SentBottomSheet";
import ActivityEmptyState from "@/components/dashboard/ActivityEmptyState";
import ActivityItemCard from "@/components/dashboard/ActivityItemCard";
import ActivitySearchBar from "@/components/dashboard/ActivitySearchBar";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import PageWrapper from "@/components/general/PageWrapper";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import { AppRootState } from "@/state";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { useSelector } from "react-redux";

const Activity = () => {
  const {
    activityFilterRef,
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();
  const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">(
    "EXCHANGE"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { exchangeActivities, hasMore } = useSelector(
    (state: AppRootState) => state.exchange
  );

  const { useExchangeActivities } = useExchange();

  const LIMIT = 10;

  // Fetch initial data
  const {
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useExchangeActivities({
    user,
    page: currentPage,
    limit: LIMIT,
    enabled: activeTab === "EXCHANGE",
  });

  const handleFilterClick = () => {
    if (activityFilterRef.current) {
      activityFilterRef.current.snapToPosition("40%");
    }
  };

  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    await refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isFetching) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    // The useQuery hook will automatically fetch when currentPage changes
    // We just need to wait for it to complete
    setIsLoadingMore(false);
  }, [currentPage, hasMore, isLoadingMore, isFetching]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <Box paddingVertical="m" alignItems="center">
        <ActivityIndicator size="small" />
      </Box>
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: ExchangeActivityModel }) => (
      <ActivityItemCard activity={item} />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: ExchangeActivityModel, index: number) =>
      item._id || `activity-${index}`,
    []
  );

  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <AppBar
          title="Activity"
          variant="bodySubheader"
          paddingHorizontal={0}
          height={30}
          fontSize={18}
        />
        <Box height={20} />
        <Box paddingHorizontal="m">
          <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />
          <ActivitySearchBar onFilterPress={() => handleFilterClick()} />
        </Box>

        <LoaderWrapper
          isLoading={isLoading && currentPage === 1}
          isError={isError}
          errorMessage={error?.message || "Failed to load activities"}
          onRetry={handleRefresh}
          isEmpty={!isLoading && exchangeActivities.length === 0}
          emptyComponent={<ActivityEmptyState />}
          existingData={exchangeActivities.length > 0 ? exchangeActivities : undefined}
        >
          <FlatList
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
            data={exchangeActivities}
            renderItem={renderItem}
            scrollEventThrottle={16}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && currentPage === 1}
                onRefresh={handleRefresh}
              />
            }
          />
        </LoaderWrapper>

        {/* BOTTOM SHEET */}
        <ActivityFilterBottomSheet ref={activityFilterRef} />
        <BuyActivityBottomSheet ref={buyActivityRef} />
        <SentBottomSheet ref={sentActivityRef} />
        <RecieveBottomSheet ref={recieveActivityRef} />
        <ApprovedBottomSheet ref={approvedActivityRef} />
      </Box>
    </PageWrapper>
  );
};

export default Activity;

import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import ApprovedBottomSheet from "@/components/bottomsheets/ApprovedBottomSheet";
import BuyActivityBottomSheet from "@/components/bottomsheets/BuyActivityBottomSheet";
import RecieveBottomSheet from "@/components/bottomsheets/ReceiveBottomSheet";
import SentBottomSheet from "@/components/bottomsheets/SentBottomSheet";
import ActivityEmptyState from "@/components/dashboard/ActivityEmptyState";
import ActivityItemCard from "@/components/dashboard/ActivityItemCard";
import ActivitySearchBar from "@/components/dashboard/ActivitySearchBar";
// import ActivityTabar from "@/components/dashboard/ActivityTabar";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import PageWrapper from "@/components/general/PageWrapper";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import { exchangeActions } from "@/src/modules/exchange/presentation/state/exchange-slice";
import { AppRootState } from "@/state";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Activity = () => {
  const dispatch = useDispatch();
  const {
    activityFilterRef,
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();
  // const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">(
  //   "EXCHANGE"
  // );
  // const activeTab = "EXCHANGE"; // Fixed to exchange only - removed unused variable
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { exchangeActivities, hasMore } = useSelector(
    (state: AppRootState) => state.exchange
  );

  const { fetchExchangeActivities, fetchingExchangeActivities } = useExchange();

  const LIMIT = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  const loadActivities = useCallback(async (page: number, reset = false) => {
    // if (activeTab !== "EXCHANGE") return; // Always load since we only have exchange
    
    console.log("loadActivities called", { page, reset });
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const response = await fetchExchangeActivities({
        user,
        page,
        limit: LIMIT,
      });
      
      console.log("API response received", { page, dataLength: response.data?.length });
      
      // Update hasMore based on server response
      // The response.data contains the actual ExchangeActivitiesResponse
      const activitiesData = response.data as any;
      if (activitiesData?.pagination) {
        const hasMore = activitiesData.pagination.hasMore || false;
        console.log("Using pagination metadata", { hasMore });
        dispatch(exchangeActions.setHasMore(hasMore));
      } else {
        // Fallback: if no pagination metadata, check if we got less than limit
        const dataLength = (activitiesData?.data || []).length;
        const hasMore = dataLength >= LIMIT;
        console.log("Using fallback logic", { dataLength, hasMore });
        dispatch(exchangeActions.setHasMore(hasMore));
      }
    } catch (err) {
      console.error("loadActivities error:", err);
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchExchangeActivities, dispatch]);

  // Load initial data
  useEffect(() => {
    if (user?._id) {
      loadActivities(1, true);
    }
  }, [user?._id, loadActivities]); // Include loadActivities but it's stable due to useCallback

  const handleFilterClick = () => {
    if (activityFilterRef.current) {
      activityFilterRef.current.snapToPosition("40%");
    }
  };

  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    // Clear existing activities before loading new ones
    dispatch(exchangeActions.clearExchangeActivities());
    await loadActivities(1, true);
  }, [loadActivities, dispatch]);

  const handleLoadMore = useCallback(async () => {
    console.log("handleLoadMore called", { isLoadingMore, hasMore, fetchingExchangeActivities, currentPage });
    
    if (isLoadingMore || !hasMore || fetchingExchangeActivities) {
      console.log("Load more blocked:", { isLoadingMore, hasMore, fetchingExchangeActivities });
      return;
    }

    console.log("Loading more data for page:", currentPage + 1);
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    try {
      await loadActivities(nextPage, false);
      console.log("Load more completed for page:", nextPage);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchingExchangeActivities, loadActivities]);

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
      `activity-${index}`,
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
          {/* <ActivityTabar activeTab={activeTab} onPress={setActiveTab} /> */}
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
              paddingBottom: 100, // Increased bottom padding to avoid nav bar
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
                refreshing={fetchingExchangeActivities && currentPage === 1}
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

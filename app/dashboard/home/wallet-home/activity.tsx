import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import ApprovedBottomSheet from "@/components/bottomsheets/ApprovedBottomSheet";
import BuyActivityBottomSheet from "@/components/bottomsheets/BuyActivityBottomSheet";
import RecieveBottomSheet from "@/components/bottomsheets/ReceiveBottomSheet";
import SentBottomSheet from "@/components/bottomsheets/SentBottomSheet";
import ActivityEmptyState from "@/components/dashboard/ActivityEmptyState";
import ActivityItemCard from "@/components/dashboard/ActivityItemCard";
import ActivitySearchBar from "@/components/dashboard/ActivitySearchBar";
import { AppBar } from "@/components/general";
// import ActivityTabar from "@/components/dashboard/ActivityTabar";
import Box from "@/components/general/Box";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import PageWrapper from "@/components/general/PageWrapper";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
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
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { exchangeActivities, hasMore } = useSelector(
    (state: AppRootState) => state.exchange
  );
  const {
    isExchangeAuthenticated,
    showExchangeLogin,
    ExchangeLoginBottomSheet,
  } = useExchangeAuth();

  // Filter activities based on search query
  const filteredActivities = exchangeActivities.filter((activity) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const searchableText = [
      activity.buyCurrency?.currencyId?.name,
      activity.buyCurrency?.currencyId?.code,
      activity.sellCurrency?.currencyId?.name,
      activity.sellCurrency?.currencyId?.code,
      activity.status,
      activity._id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  // Debug logging for pagination
  console.log("📊 Pagination Debug:", {
    exchangeActivitiesCount: exchangeActivities.length,
    filteredActivitiesCount: filteredActivities.length,
    hasMore,
    currentPage,
    searchQuery: searchQuery.trim(),
  });

  const { fetchExchangeActivities, fetchingExchangeActivities } = useExchange();

  const LIMIT = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  const loadActivities = useCallback(async (page: number, reset = false) => {
    // Check authentication first
    if (!isExchangeAuthenticated || !user?._id) {
      console.log("⚠️ User not authenticated, prompting login");
      showExchangeLogin();
      setIsLoading(false);
      return;
    }
    
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
      
      console.log("API response received", { 
        page, 
        dataLength: response.data?.length,
        responseStructure: response
      });
      
      // Update hasMore based on server response
      // The response.data is the ExchangeActivitiesResponse with activities and pagination
      const activitiesData = response.data as any;
      // console.log("Activities data structure:", activitiesData);
      
      if (activitiesData?.pagination) {
        const hasMore = activitiesData.pagination.hasMore || false;
        console.log("Using pagination metadata", { hasMore, pagination: activitiesData.pagination });
        dispatch(exchangeActions.setHasMore(hasMore));
      } else {
        // Fallback: if no pagination metadata, check if we got less than limit
        const activities = activitiesData?.activities || activitiesData || [];
        const dataLength = activities.length;
        const hasMore = dataLength >= LIMIT;
        console.log("Using fallback logic", { dataLength, hasMore, limit: LIMIT });
        dispatch(exchangeActions.setHasMore(hasMore));
      }
    } catch (err) {
      console.error("loadActivities error:", err);
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchExchangeActivities, dispatch, isExchangeAuthenticated, showExchangeLogin]);

  // Load initial data
  useEffect(() => {
    if (isExchangeAuthenticated && user?._id) {
      loadActivities(1, true);
    } else if (!isExchangeAuthenticated) {
      // Show login prompt if not authenticated
      showExchangeLogin();
    }
  }, [user?._id, isExchangeAuthenticated, loadActivities, showExchangeLogin]); // Include loadActivities but it's stable due to useCallback

  const handleFilterClick = () => {
    if (activityFilterRef.current) {
      activityFilterRef.current.snapToPosition("40%");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLoadMore = useCallback(async (initial = false) => {
    console.log("🚀 handleLoadMore called", { 
      isLoadingMore, 
      hasMore, 
      fetchingExchangeActivities, 
      currentPage,
      searchQuery,
      filteredCount: filteredActivities.length,
      totalCount: exchangeActivities.length,
    });

    // Check authentication first
    if (!isExchangeAuthenticated || !user?._id) {
      console.log("⚠️ User not authenticated, prompting login");
      showExchangeLogin();
      return;
    }

    // Don't load more if already loading
    if (isLoadingMore || fetchingExchangeActivities) {
      console.log("Load more blocked: already loading");
      return;
    }

    // If no more data from server, don't load more
    if (!hasMore) {
      console.log("Load more blocked: no more data from server");
      return;
    }

    // If we have a search query, only load more if we have no filtered results
    // This allows loading more data to potentially find search matches
    if (searchQuery.trim() && filteredActivities.length > 0) {
      console.log(
        "Load more blocked: search has results, no need to load more"
      );
      return;
    }

    console.log("Loading more data for page:", currentPage + 1);
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = await fetchExchangeActivities({
        user,
        page: initial ? 1 : nextPage,
        limit: LIMIT,
      });

      // Check if we got data back
      const activitiesData = response.data as any;
      const activities = activitiesData?.activities || activitiesData || [];
      
      // Only increment currentPage if we got data
      if (activities && activities.length > 0) {
        setCurrentPage(nextPage);

        // Update hasMore based on server response
        if (activitiesData?.pagination) {
          const hasMore = activitiesData.pagination.hasMore || false;
          dispatch(exchangeActions.setHasMore(hasMore));
        } else {
          // Fallback: if no pagination metadata, check if we got less than limit
          const dataLength = activities.length;
          const hasMore = dataLength >= LIMIT;
          dispatch(exchangeActions.setHasMore(hasMore));
        }
      } else {
        dispatch(exchangeActions.setHasMore(false));
      }
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    currentPage,
    hasMore,
    isLoadingMore,
    fetchingExchangeActivities,
    fetchExchangeActivities,
    user,
    LIMIT,
    dispatch,
    searchQuery,
    filteredActivities.length,
    exchangeActivities.length,
    isExchangeAuthenticated,
    showExchangeLogin,
  ]);

  const handleEndReached = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    setSearchQuery(""); // Clear search on refresh
    // Clear existing activities before loading new ones
    dispatch(exchangeActions.clearExchangeActivities());
    // Load page 1 data - isLoading will be set to true in loadActivities
    await loadActivities(1, true);
  }, [loadActivities, dispatch]);

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
    (item: ExchangeActivityModel, index: number) => `activity-${index}`,
    []
  );

  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <AppBar
          title="Activity"
          variant="subheader"
          paddingHorizontal={0}
          height={30}
          leading={null}
          trailing={null}
        />
        <Box height={20} />
        <Box paddingHorizontal="m">
          {/* <ActivityTabar activeTab={activeTab} onPress={setActiveTab} /> */}
          <ActivitySearchBar
            onFilterPress={() => handleFilterClick()}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </Box>

        <LoaderWrapper
          isLoading={isLoading && currentPage === 1}
          isError={isError}
          errorMessage={error?.message || "Failed to load activities"}
          onRetry={handleRefresh}
          isEmpty={!isLoading && filteredActivities.length === 0}
          emptyComponent={<ActivityEmptyState />}
          existingData={
            filteredActivities.length > 0 ? filteredActivities : undefined
          }
        >
          <FlatList
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 100, // Increased bottom padding to avoid nav bar
            }}
            data={filteredActivities}
            renderItem={renderItem}
            scrollEventThrottle={16}
            keyExtractor={keyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={(isLoading || fetchingExchangeActivities) && currentPage === 1}
                // onRefresh={handleRefresh}
                onRefresh={async () => {
                  console.log("Pull to refresh triggered");
                  // handleRefresh();
                  // await loadActivities(1, true);
                  await handleLoadMore(true);
                }}
              />
            }
          />
        </LoaderWrapper>

        {/* BOTTOM SHEET */}
        <ActivityFilterBottomSheet ref={activityFilterRef} />
        <BuyActivityBottomSheet ref={buyActivityRef} />
        {ExchangeLoginBottomSheet && <ExchangeLoginBottomSheet />}
        <SentBottomSheet ref={sentActivityRef} />
        <RecieveBottomSheet ref={recieveActivityRef} />
        <ApprovedBottomSheet ref={approvedActivityRef as any} />
      </Box>
    </PageWrapper>
  );
};

export default Activity;

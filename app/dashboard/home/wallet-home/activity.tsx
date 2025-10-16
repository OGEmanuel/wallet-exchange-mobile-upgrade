import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import ApprovedBottomSheet from "@/components/bottomsheets/ApprovedBottomSheet";
import BuyActivityBottomSheet from "@/components/bottomsheets/BuyActivityBottomSheet";
import RecieveBottomSheet from "@/components/bottomsheets/RecieveBottomSheet";
import SentBottomSheet from "@/components/bottomsheets/SentBottomSheet";
import ActivityEmptyState from "@/components/dashboard/ActivityEmptyState";
import ActivityItemCard from "@/components/dashboard/ActivityItemCard";
import ActivitySearchBar from "@/components/dashboard/ActivitySearchBar";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import PageWrapper from "@/components/general/PageWrapper";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import { AppRootState } from "@/state";
import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

const ITEMS: number[] = [1, 2, 3, 4, 5, 6, 7];

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

  const { user } = useSelector((state: AppRootState) => state.kyc);

  const { fetchExchangeActivities } = useExchange();

  useEffect(() => {
    console.log('Fetching exchange activities');
    
    fetchExchangeActivities({
      body: user,
      params: null,
      extra: {
        page: 1,
        limit: 10,
      },
    });
  }, []);

  const handleFilterClick = () => {
    if (activityFilterRef.current) {
      activityFilterRef.current.snapToPosition("40%");
    }
  };
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
        {ITEMS.length < 1 && <ActivityEmptyState />}
        {ITEMS.length > 0 && (
          <FlatList
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
            data={ITEMS}
            renderItem={({ item }) => <ActivityItemCard />}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => index.toString()}
          />
        )}

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

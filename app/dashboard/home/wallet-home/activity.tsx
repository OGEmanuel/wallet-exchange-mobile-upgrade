import React from "react";
import Box from "@/components/general/Box";
import PageWrapper from "@/components/general/PageWrapper";
import AppBar from "@/components/general/AppBar";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import ActivitySearchBar from "@/components/dashboard/ActivitySearchBar";
import ActivityEmptyState from "@/components/dashboard/ActivityEmptyState";
import { FlatList } from "react-native-gesture-handler";
import ActivityItemCard from "@/components/dashboard/ActivityItemCard";
import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import BuyActivityBottomSheet from "@/components/bottomsheets/BuyActivityBottomSheet";
import SentBottomSheet from "@/components/bottomsheets/SentBottomSheet";
import RecieveBottomSheet from "@/components/bottomsheets/RecieveBottomSheet";
import ApprovedBottomSheet from "@/components/bottomsheets/ApprovedBottomSheet";

const ITEMS: number[] = [1, 2, 3, 4, 5, 6, 7];

const Activity = () => {
  const {
    activityFilterRef,
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();
  const [activeTab, setActiveTab] = React.useState<"EXCHANGE" | "WALLET">(
    "EXCHANGE"
  );

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

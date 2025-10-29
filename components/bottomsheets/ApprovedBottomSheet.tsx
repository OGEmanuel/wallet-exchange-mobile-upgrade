import {
  ThemedLinkExternalIcon
} from "@/assets/svg/wallet-icons-components";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { SvgUri } from "react-native-svg";
import { useSelector } from "react-redux";
import { Box, CustomText } from "../general";

const ApprovedBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const theme = useTheme<Theme>();
  const { selectedActivity } = useSelector((state: AppRootState) => state.exchange);
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["60%", "85%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
        zIndex: 1000,
        borderRadius: 12,
        marginBottom: 100, // Add margin to avoid bottom navigation
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 100, // Move padding to contentContainerStyle for proper scrolling
            flexGrow: 1 
          }}
        >
          {selectedActivity ? (
            <>
              {/* Transaction Header */}
              <Box alignItems="center" mb="l">
                <CustomText variant="bodyMedium" fontSize={18} textAlign="center">
                  Transaction Details
                </CustomText>
                <CustomText variant="body" fontSize={12} mt="s" textAlign="center">
                  {selectedActivity.createdAt 
                    ? new Date(selectedActivity.createdAt).toLocaleString()
                    : "Date not available"
                  }
                </CustomText>
              </Box>

              {/* Transaction Amount */}
              <Box
                width={"100%"}
                alignItems="center"
                justifyContent="center"
                bg="secondaryBackgroundColor"
                borderRadius={12}
                height={120}
                mb="l"
              >
                <Box flexDirection="row" alignItems="center" mb="s">
                  {selectedActivity.buyCurrency?.image && (
                    <SvgUri
                      uri={selectedActivity.buyCurrency.image}
                      width={24}
                      height={24}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <CustomText variant="subheader" fontSize={22}>
                    {selectedActivity.buyAmount || selectedActivity.sellAmount || selectedActivity.amountToReceive || 0} {selectedActivity.buyCurrency?.currencyId?.code || selectedActivity.sellCurrency?.currencyId?.code || "USDT"}
                  </CustomText>
                </Box>
                <CustomText variant="body" fontSize={14} color="disabledTextColor">
                  Status: {selectedActivity.status || "Unknown"}
                </CustomText>
              </Box>

              {/* Transaction Details */}
              <Box
                width={"100%"}
                paddingHorizontal="m"
                paddingVertical="m"
                borderRadius={8}
                borderWidth={1}
                borderColor="borderColor"
                mb="l"
              >
                {/* Transaction Type */}
                <Box
                  width={"100%"}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  height={40}
                  borderBottomWidth={1}
                  borderBottomColor="borderColor"
                >
                  <CustomText color="disabledTextColor" fontSize={12}>
                    Type
                  </CustomText>
                  <CustomText fontSize={12}>
                    {selectedActivity.buyAmount ? "BUY" : selectedActivity.sellAmount ? "SELL" : "SWAP"}
                  </CustomText>
                </Box>

                {/* Buy Currency */}
                {selectedActivity.buyCurrency && (
                  <Box
                    width={"100%"}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={40}
                    borderBottomWidth={1}
                    borderBottomColor="borderColor"
                  >
                    <CustomText color="disabledTextColor" fontSize={12}>
                      Buy Currency
                    </CustomText>
                    <CustomText fontSize={12}>
                      {selectedActivity.buyCurrency.currencyId?.code} ({selectedActivity.buyCurrency.currencyId?.name})
                    </CustomText>
                  </Box>
                )}

                {/* Sell Currency */}
                {selectedActivity.sellCurrency && (
                  <Box
                    width={"100%"}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={40}
                    borderBottomWidth={1}
                    borderBottomColor="borderColor"
                  >
                    <CustomText color="disabledTextColor" fontSize={12}>
                      Sell Currency
                    </CustomText>
                    <CustomText fontSize={12}>
                      {selectedActivity.sellCurrency.currencyId?.code} ({selectedActivity.sellCurrency.currencyId?.name})
                    </CustomText>
                  </Box>
                )}

                {/* Rate */}
                {(selectedActivity.buyRate || selectedActivity.sellRate || selectedActivity.rate) && (
                  <Box
                    width={"100%"}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={40}
                    borderBottomWidth={1}
                    borderBottomColor="borderColor"
                  >
                    <CustomText color="disabledTextColor" fontSize={12}>
                      Rate
                    </CustomText>
                    <CustomText fontSize={12}>
                      {selectedActivity.buyRate || selectedActivity.sellRate || selectedActivity.rate}
                    </CustomText>
                  </Box>
                )}

                {/* LP Fee */}
                {selectedActivity.lpFee && (
                  <Box
                    width={"100%"}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={40}
                    borderBottomWidth={1}
                    borderBottomColor="borderColor"
                  >
                    <CustomText color="disabledTextColor" fontSize={12}>
                      LP Fee
                    </CustomText>
                    <CustomText fontSize={12}>
                      {selectedActivity.lpFee} {selectedActivity.lpFeeUsd ? `($${selectedActivity.lpFeeUsd})` : ""}
                    </CustomText>
                  </Box>
                )}

                {/* Transaction ID */}
                {selectedActivity._id && (
                  <Box
                    width={"100%"}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={40}
                  >
                    <CustomText color="disabledTextColor" fontSize={12}>
                      Transaction ID
                    </CustomText>
                    <Box flexDirection="row" alignItems="center">
                      <CustomText fontSize={12} marginRight="s">
                        {selectedActivity._id.slice(0, 8)}...{selectedActivity._id.slice(-8)}
                      </CustomText>
                      <ThemedLinkExternalIcon width={15} height={15} />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Deposit/Withdrawal Accounts */}
              {(selectedActivity.depositAccount || selectedActivity.withdrawalAccount) && (
                <Box
                  width={"100%"}
                  paddingHorizontal="m"
                  paddingVertical="m"
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="borderColor"
                  mb="l"
                >
                  <CustomText variant="bodyMedium" fontSize={14} mb="s">
                    Account Details
                  </CustomText>
                  
                  {selectedActivity.depositAccount && (
                    <Box mb="s">
                      <CustomText color="disabledTextColor" fontSize={12} mb="s">
                        Deposit Account
                      </CustomText>
                      <CustomText fontSize={12}>
                        {selectedActivity.depositAccount.number || selectedActivity.depositAccount.walletAddress || "N/A"}
                      </CustomText>
                    </Box>
                  )}

                  {selectedActivity.withdrawalAccount && (
                    <Box>
                      <CustomText color="disabledTextColor" fontSize={12} mb="s">
                        Withdrawal Account
                      </CustomText>
                      <CustomText fontSize={12}>
                        {selectedActivity.withdrawalAccount.number || selectedActivity.withdrawalAccount.walletAddress || "N/A"}
                      </CustomText>
                    </Box>
                  )}
                </Box>
              )}
            </>
          ) : (
            <Box alignItems="center" justifyContent="center" flex={1}>
              <CustomText variant="body" fontSize={14} color="disabledTextColor">
                No transaction selected
              </CustomText>
            </Box>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ApprovedBottomSheet;

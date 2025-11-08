import CryptoIcon from "@/components/general/CrptoIcon";
import { useChains } from "@/src/core/chains/chains-context";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy } from "lucide-react-native";
import React, { forwardRef, useCallback } from "react";
import { Pressable, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { Box, CustomText } from "../general";

const ApprovedBottomSheet = forwardRef<BottomSheet, Record<string, never>>(
  (props, ref) => {
    const theme = useTheme<Theme>();
    const { selectedActivity } = useSelector(
      (state: AppRootState) => state.exchange
    );
    const {
      getApproximateAmount,
      getAmountToReceive,
      getActualTransactionStatus,
    } = useUtilities();
    const { getChainById } = useChains();

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

    // Get transaction type
    const getTransactionType = () => {
      if (!selectedActivity) return "Transaction";

      const sellIsCrypto = selectedActivity.sellCurrency?.currencyId?.isCrypto ?? false;
      const buyIsCrypto = selectedActivity.buyCurrency?.currencyId?.isCrypto ?? false;

      // If both are crypto OR both are fiat → Swap
      if (sellIsCrypto === buyIsCrypto) {
        return "Swap";
      }

      // If sell (parent order) is fiat and buy (child order) is crypto → Buy
      if (sellIsCrypto && !buyIsCrypto) {
        return "Buy";
      }

      // If sell (parent order) is crypto and buy (child order) is fiat → Sell
      if (!sellIsCrypto && buyIsCrypto) {
        return "Sell";
      }

      return "Transaction";
    };

    // Format date
    const formatDate = (dateString?: string | Date) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    };

    const copyToClipboard = async (text: string) => {
      try {
        await Clipboard.setStringAsync(text);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showSuccessToast("Copied to clipboard");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        showErrorToast("Failed to copy");
      }
    };

    const displayCurrency =
      selectedActivity?.sellCurrency?.currencyId?.code ||
      selectedActivity?.buyCurrency?.currencyId?.code ||
      "USDT";
    const actualStatus = getActualTransactionStatus(selectedActivity);

    // Get chain information from currencies
    // Buy chain comes from depositAccount (where you're depositing the buy currency)
    // Sell chain comes from withdrawalAccount (where you're withdrawing the sell currency)
    const buyChainId =
      (selectedActivity?.buyCurrency?.chainId as any)?._id ||
      (typeof selectedActivity?.buyCurrency?.chainId === "string"
        ? selectedActivity?.buyCurrency?.chainId
        : null);
    const sellChainId =
      (selectedActivity?.sellCurrency?.chainId as any)?._id ||
      (typeof selectedActivity?.sellCurrency?.chainId === "string"
        ? selectedActivity?.sellCurrency?.chainId
        : null);

    // Try to get chain from buy currency first (deposit account), then sell currency (withdrawal account)
    const buyChain = buyChainId ? getChainById(buyChainId) : null;
    const sellChain = sellChainId ? getChainById(sellChainId) : null;

    // Determine which chain to display (prefer buy chain, fallback to sell chain)
    const displayChain = buyChain || sellChain;

    // Get status color
    const getStatusColor = (activityStatus?: string) => {
      if (!activityStatus) return { bg: "#6B7280", text: theme.colors.white };
      switch (activityStatus.toLowerCase()) {
        case "pending":
        case "deposit_confirming":
        case "deposit_confirmed":
          return { bg: "#EAB308", text: theme.colors.white };
        case "withdrawal_confirming":
        case "withdrawal_confirmed":
        case "filled":
        case "completed":
        case "success":
        case "confirmed":
        case "successful":
          return { bg: "#10B981", text: theme.colors.white };
        case "expired":
        case "failed":
        case "error":
        case "cancelled":
          return { bg: "#EF4444", text: theme.colors.white };
        default:
          return { bg: "#6B7280", text: theme.colors.white };
      }
    };

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
              flexGrow: 1,
            }}
          >
            {selectedActivity ? (
              <>
                {/* Header */}
                <Box alignItems="center" marginBottom="xl">
                  <CustomText
                    variant="header"
                    fontSize={24}
                    color="headerTextColor"
                    marginBottom="s"
                  >
                    {getTransactionType()}
                  </CustomText>
                  <CustomText color="placeholderTextColor" fontSize={14}>
                    {selectedActivity?.childOrder?.createdAt
                      ? formatDate(selectedActivity.childOrder.createdAt)
                      : selectedActivity?.createdAt
                      ? formatDate(selectedActivity.createdAt)
                      : "Unknown time"}
                  </CustomText>
                </Box>

                {/* Transaction Type Subtitle */}
                <CustomText
                  color="disabledTextColor"
                  fontSize={12}
                  textAlign="center"
                  marginBottom="s"
                >
                  {/* {selectedActivity?.sellAmount && selectedActivity?.sellCurrency && selectedActivity?.buyCurrency
                  ? `Swap ${getApproximateAmount(selectedActivity.sellAmount, selectedActivity.sellCurrency.currencyId?.isCrypto)} ${selectedActivity.sellCurrency.currencyId?.code} for`
                  : getTransactionType()
                } */}
                  {`Swap ${getApproximateAmount(
                    selectedActivity.buyAmount,
                    selectedActivity?.buyCurrency?.currencyId?.isCrypto
                  )} ${selectedActivity.buyCurrency?.currencyId?.code} for`}
                </CustomText>

                {/* Main Transaction Card */}
                <Box
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="s"
                  mb="xl"
                >
                  {/* Currency Icons - Side by Side */}
                  <Box flexDirection="row" alignItems="center" marginBottom="m">
                    {/* Buy Currency Icon */}
                    {selectedActivity?.buyCurrency && (
                      <Box
                        style={{
                          marginRight: selectedActivity?.sellCurrency ? -10 : 0,
                        }}
                        zIndex={1}
                      >
                        <CryptoIcon
                          image={
                            selectedActivity?.buyCurrency?.currencyId?.logo
                          }
                          size={40}
                          symbol={
                            selectedActivity?.buyCurrency?.currencyId?.code
                          }
                        />
                      </Box>
                    )}
                    {/* Sell Currency Icon */}
                    {selectedActivity?.sellCurrency && (
                      <Box zIndex={2}>
                        <CryptoIcon
                          image={
                            selectedActivity?.sellCurrency?.currencyId?.logo
                          }
                          size={40}
                          symbol={
                            selectedActivity?.sellCurrency?.currencyId?.code
                          }
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Amounts Display */}
                  <Box alignItems="center">
                    {/* Sell Amount */}
                    {selectedActivity?.sellAmount &&
                      selectedActivity?.sellCurrency && (
                        <CustomText
                          variant="header"
                          fontSize={32}
                          color="headerTextColor"
                        >
                          +
                          {getApproximateAmount(
                            selectedActivity.sellAmount,
                            selectedActivity.sellCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.sellCurrency.currencyId?.code}
                        </CustomText>
                      )}
                    {/* Fallback if amounts not available */}
                    {!selectedActivity?.buyAmount &&
                      !selectedActivity?.sellAmount &&
                      selectedActivity?.amountToReceive && (
                        <CustomText
                          variant="header"
                          fontSize={32}
                          color="headerTextColor"
                        >
                          {getApproximateAmount(
                            getAmountToReceive(selectedActivity),
                            selectedActivity?.buyCurrency?.currencyId
                              ?.isCrypto ||
                              selectedActivity?.sellCurrency?.currencyId
                                ?.isCrypto
                          )}{" "}
                          {selectedActivity?.buyCurrency?.currencyId?.code ||
                            selectedActivity?.sellCurrency?.currencyId?.code ||
                            displayCurrency}
                        </CustomText>
                      )}
                  </Box>
                </Box>

                {/* Rate Display */}
                {(selectedActivity?.rate ||
                  selectedActivity?.buyRate ||
                  selectedActivity?.sellRate) && (
                  <CustomText
                    color="disabledTextColor"
                    fontSize={12}
                    textAlign="center"
                    marginBottom="xl"
                  >
                    @
                    {getApproximateAmount(
                      selectedActivity?.rate ||
                        selectedActivity?.buyRate ||
                        selectedActivity?.sellRate ||
                        0,
                      true
                    )}{" "}
                    {selectedActivity?.sellCurrency?.currencyId?.code}/
                    {selectedActivity?.buyCurrency?.currencyId?.code}
                  </CustomText>
                )}

                {/* Transaction Details */}
                <Box
                  borderRadius={12}
                  padding="m"
                  borderWidth={1}
                  borderColor="borderColor"
                  mb="l"
                >
                  {/* Transaction ID */}
                  {selectedActivity._id && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        ID
                      </CustomText>
                      <Box flexDirection="row" alignItems="center">
                        <CustomText
                          color="headerTextColor"
                          fontSize={14}
                          marginRight="s"
                        >
                          {selectedActivity._id}
                        </CustomText>
                        <Pressable
                          onPress={() =>
                            copyToClipboard(selectedActivity._id || "")
                          }
                        >
                          <Copy
                            size={16}
                            color={theme.colors.placeholderTextColor}
                          />
                        </Pressable>
                      </Box>
                    </Box>
                  )}

                  {/* Amount Swapped */}
                  {selectedActivity?.buyAmount &&
                    selectedActivity?.buyCurrency && (
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingVertical="m"
                        borderBottomWidth={1}
                        borderBottomColor="modalBackgroundColor"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Amount Swapped
                        </CustomText>
                        <CustomText color="headerTextColor" fontSize={14}>
                          {getApproximateAmount(
                            selectedActivity.buyAmount,
                            selectedActivity.buyCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.buyCurrency.currencyId?.code}
                        </CustomText>
                      </Box>
                    )}

                  {/* Amount Received */}
                  {selectedActivity?.sellAmount &&
                    selectedActivity?.sellCurrency && (
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingVertical="m"
                        borderBottomWidth={1}
                        borderBottomColor="modalBackgroundColor"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Amount Received
                        </CustomText>
                        <CustomText color="headerTextColor" fontSize={14}>
                          {getApproximateAmount(
                            selectedActivity.sellAmount,
                            selectedActivity.sellCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.sellCurrency.currencyId?.code}
                        </CustomText>
                      </Box>
                    )}

                  {/* Rate */}
                  {(selectedActivity?.rate ||
                    selectedActivity?.buyRate ||
                    selectedActivity?.sellRate) && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Rate
                      </CustomText>
                      <CustomText color="headerTextColor" fontSize={14}>
                        {getApproximateAmount(
                          selectedActivity?.rate ||
                            selectedActivity?.buyRate ||
                            selectedActivity?.sellRate ||
                            0,
                          true
                        )}{" "}
                        {selectedActivity?.sellCurrency?.currencyId?.code ||
                          "USDT"}
                        /
                        {selectedActivity?.buyCurrency?.currencyId?.code ||
                          displayCurrency}
                      </CustomText>
                    </Box>
                  )}

                  {/* Chain */}
                  {displayChain && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Chain
                      </CustomText>
                      <CustomText color="headerTextColor" fontSize={14}>
                        {displayChain.name || displayChain.symbol || "Unknown"}
                      </CustomText>
                    </Box>
                  )}

                  {/* Date */}
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="m"
                    borderBottomWidth={1}
                    borderBottomColor="modalBackgroundColor"
                  >
                    <CustomText color="placeholderTextColor" fontSize={14}>
                      Date
                    </CustomText>
                    <CustomText color="headerTextColor" fontSize={14}>
                      {selectedActivity?.childOrder?.createdAt
                        ? formatDate(selectedActivity.childOrder.createdAt)
                        : selectedActivity?.createdAt
                        ? formatDate(selectedActivity.createdAt)
                        : "Unknown time"}
                    </CustomText>
                  </Box>

                  {/* Receiver */}
                  {selectedActivity?.withdrawalAccount?.walletAddress && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Receiver
                      </CustomText>
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        flex={1}
                        justifyContent="flex-end"
                      >
                        <CustomText
                          color="headerTextColor"
                          fontSize={14}
                          marginRight="s"
                          numberOfLines={1}
                          flexShrink={1}
                        >
                          {selectedActivity.withdrawalAccount?.walletAddress
                            ? `${selectedActivity.withdrawalAccount.walletAddress.slice(
                                0,
                                6
                              )}...${selectedActivity.withdrawalAccount.walletAddress.slice(
                                -4
                              )}`
                            : "N/A"}
                        </CustomText>
                        <Pressable
                          onPress={() =>
                            copyToClipboard(
                              selectedActivity.withdrawalAccount
                                ?.walletAddress || ""
                            )
                          }
                        >
                          <Copy
                            size={16}
                            color={theme.colors.placeholderTextColor}
                          />
                        </Pressable>
                      </Box>
                    </Box>
                  )}

                  {/* Status */}
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="m"
                  >
                    <CustomText color="placeholderTextColor" fontSize={14}>
                      Status
                    </CustomText>
                    <Box flexDirection="row" alignItems="center">
                      <Box
                        width={8}
                        height={8}
                        borderRadius={4}
                        style={{
                          backgroundColor: getStatusColor(actualStatus).bg,
                        }}
                        marginRight="s"
                      />
                      <CustomText
                        fontSize={14}
                        style={{ color: getStatusColor(actualStatus).text }}
                      >
                        {actualStatus?.charAt(0).toUpperCase()}
                        {actualStatus?.slice(1).toLowerCase()}
                      </CustomText>
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <Box alignItems="center" justifyContent="center" flex={1}>
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="disabledTextColor"
                >
                  No transaction selected
                </CustomText>
              </Box>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ApprovedBottomSheet.displayName = "ApprovedBottomSheet";

export default ApprovedBottomSheet;

import { ThemedArrowDiagonalIcon } from "@/assets/svg/wallet-icons-components";
import { Box, CustomText } from "@/components/general";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { BlockchainTransaction } from "@zap/blockchain-sdk";
import { ArrowLeftRightIcon, ArrowRight, Check } from "lucide-react-native";
import { Pressable } from "react-native";

const TokenHistoryCard = ({
  transaction,
  finalSelectedToken,
  index,
  onPress,
}: {
  transaction: BlockchainTransaction;
  finalSelectedToken: ProcessedAsset | null;
  index: number;
  onPress?: (transaction: BlockchainTransaction) => void;
}) => {


  const handlePress = () => {
    console.log("🎯 TokenHistoryCard pressed:", transaction.hash);
    onPress?.(transaction);
  };

  return (
    <Pressable
      key={index}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        marginBottom: 8,
      })}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        <Box
          backgroundColor="modalBackgroundColor"
          borderRadius={16}
          padding="m"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left side - Icon and transaction type */}
            <Box flexDirection="row" alignItems="center" flex={1}>
              {/* Transaction Icon */}
              <Box
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="secondaryBackgroundColor"
                alignItems="center"
                justifyContent="center"
                marginRight="m"
              >
                <CustomText fontSize={16} color="white">
                  {transaction.direction === "OUT" ? (
                    <ArrowRight color="white" />
                  ) : transaction.direction === "IN" ? (
                    <ThemedArrowDiagonalIcon />
                  ) : transaction.direction === "SELF" ? (
                    <ArrowLeftRightIcon color="white" />
                  ) : (
                    <Check />
                  )}
                </CustomText>
              </Box>

              {/* Transaction Details */}
              <Box flex={1}>
                <CustomText
                  color="headerTextColor"
                  fontSize={16}
                  marginBottom="s"
                >
                  {transaction.direction === "OUT"
                    ? "Sent"
                    : transaction.direction === "IN"
                    ? "Received"
                    : transaction.direction === "SWAP"
                    ? "Swapped"
                    : "Approved"}
                </CustomText>

                <CustomText
                  color="placeholderTextColor"
                  fontSize={12}
                  numberOfLines={1}
                >
                  {transaction.direction === "OUT" ||
                  transaction.direction === "IN"
                    ? `${
                        transaction.direction === "OUT" ? "To:" : "From:"
                      } ${transaction.to?.slice(
                        0,
                        6
                      )}...${transaction.to?.slice(-4)}`
                    : transaction.direction === "SWAP"
                    ? `${transaction.tokenSymbol} > ${transaction.tokenSymbol}`
                    : "To 0xd5321...de32"}
                </CustomText>
              </Box>
            </Box>

            {/* Right side - Amount and USD value */}
            <Box alignItems="flex-end">
              <CustomText
                color={
                  transaction.direction === "OUT"
                    ? "error"
                    : transaction.direction === "IN"
                    ? "success"
                    : "headerTextColor"
                }
                fontSize={16}
                fontWeight="bold"
                marginBottom="s"
              >
                {transaction.direction === "OUT"
                  ? "-"
                  : transaction.direction === "IN"
                  ? "+"
                  : ""}
                {PortfolioService.formatBalance(transaction.amount)}{" "}
                {transaction.tokenSymbol}
              </CustomText>

              <CustomText color="placeholderTextColor" fontSize={12}>
                {PortfolioService.formatCurrency(
                  transaction.amount * (finalSelectedToken?.price || 0)
                )}
              </CustomText>
            </Box>
          </Box>
        </Box>
    </Pressable>
  );
};

export default TokenHistoryCard;
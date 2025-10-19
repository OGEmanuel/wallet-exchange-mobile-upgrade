import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import Box from "../general/Box";
import SkeletonLoader from "../general/SkeletonLoader";

const TransactionCardSkeleton = () => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width="100%"
      height={80}
      borderRadius={16}
      style={{ 
        backgroundColor: theme.colors.modalBackgroundColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      mb="s"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="m"
      paddingVertical="m"
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        {/* Transaction Icon Skeleton */}
        <SkeletonLoader
          width={40}
          height={40}
          borderRadius={20}
          style={{ marginRight: 12 }}
          isLoading={true}
        />

        <Box flex={1}>
          {/* Transaction Type */}
          <SkeletonLoader
            width={80}
            height={16}
            borderRadius={4}
            style={{ marginBottom: 4 }}
            isLoading={true}
          />
          
          {/* Transaction Details */}
          <SkeletonLoader
            width={120}
            height={12}
            borderRadius={4}
            isLoading={true}
          />
        </Box>
      </Box>

      {/* Right side - Amount and Status */}
      <Box alignItems="flex-end">
        <SkeletonLoader
          width={70}
          height={16}
          borderRadius={4}
          style={{ marginBottom: 4 }}
          isLoading={true}
        />
        <SkeletonLoader
          width={50}
          height={12}
          borderRadius={4}
          isLoading={true}
        />
      </Box>
    </Box>
  );
};

export default TransactionCardSkeleton;

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import Box from "../general/Box";
import SkeletonLoader from "../general/SkeletonLoader";

const TokenCardSkeleton = () => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width="100%"
      height={70}
      borderRadius={12}
      style={{ backgroundColor: theme.colors.secondaryBackgroundColor }}
      mb="s"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="m"
      paddingVertical="m"
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        {/* Token Icon Skeleton */}
        <SkeletonLoader
          width={40}
          height={40}
          borderRadius={20}
          style={{ marginRight: 12 }}
          isLoading={true}
        />

        <Box flex={1}>
          {/* Token Symbol and Name */}
          <Box flexDirection="row" alignItems="center" mb="s">
            <SkeletonLoader
              width={60}
              height={16}
              borderRadius={4}
              style={{ marginRight: 8 }}
              isLoading={true}
            />
            <SkeletonLoader
              width={80}
              height={14}
              borderRadius={4}
              isLoading={true}
            />
          </Box>
          
          {/* Chain Name */}
          <SkeletonLoader
            width={100}
            height={12}
            borderRadius={4}
            isLoading={true}
          />
        </Box>
      </Box>

      {/* Right side - Balance and Value */}
      <Box alignItems="flex-end">
        <SkeletonLoader
          width={80}
          height={16}
          borderRadius={4}
          style={{ marginBottom: 4 }}
          isLoading={true}
        />
        <SkeletonLoader
          width={60}
          height={12}
          borderRadius={4}
          isLoading={true}
        />
      </Box>
    </Box>
  );
};

export default TokenCardSkeleton;

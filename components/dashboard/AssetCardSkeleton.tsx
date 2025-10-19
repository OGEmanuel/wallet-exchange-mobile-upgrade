import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import Box from "../general/Box";
import SkeletonLoader from "../general/SkeletonLoader";

const AssetCardSkeleton: React.FC = () => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width="100%"
      height={60}
      borderRadius={12}
      style={{ backgroundColor: "#1F232D" }}
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
          width={25}
          height={25}
          borderRadius={20}
          style={{ marginRight: 12 }}
          isLoading={true}
        />

        <Box flex={1}>
          {/* Token Symbol and Chain */}
          <Box flexDirection="row" alignItems="center" mb="s">
            <SkeletonLoader
              width={40}
              height={14}
              borderRadius={4}
              style={{ marginRight: 8 }}
              isLoading={true}
            />
            <SkeletonLoader width={60} height={20} borderRadius={8} isLoading={true} />
          </Box>

          {/* Price and Change */}
          <Box flexDirection="row" alignItems="center">
            <SkeletonLoader
              width={80}
              height={12}
              borderRadius={4}
              style={{ marginRight: 8 }}
              isLoading={true}
            />
            <SkeletonLoader width={50} height={12} borderRadius={4} isLoading={true} />
          </Box>
        </Box>
      </Box>

      {/* Right side - Amount and Balance */}
      <Box alignItems="flex-end">
        <SkeletonLoader
          width={100}
          height={14}
          borderRadius={4}
          style={{ marginBottom: 4 }}
          isLoading={true}
        />
        <SkeletonLoader width={80} height={12} borderRadius={4} isLoading={true} />
      </Box>
    </Box>
  );
};

export default AssetCardSkeleton;

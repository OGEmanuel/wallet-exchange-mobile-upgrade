import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioService } from '@/services/portfolio.service';
import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Box from '../general/Box';
import CustomButton from '../general/CustomButton';
import CustomText from '../general/CustomText';

/**
 * Example component showing how to use the portfolio functionality
 * This demonstrates the complete integration with the SDK portfolio data
 */
export default function PortfolioExample() {
  const { 
    portfolio, 
    isLoading, 
    error, 
    refresh, 
    hasAssets, 
    totalValue, 
    enabledAssets 
  } = usePortfolio();

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p="m">
        <ActivityIndicator size="large" />
        <CustomText variant="body" mt="m">Loading portfolio...</CustomText>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p="m">
        <CustomText variant="body" color="error" textAlign="center" mb="m">
          {error}
        </CustomText>
        <CustomButton
          onPress={refresh}
          text="Retry"
          width={100}
          height={40}
        />
      </Box>
    );
  }

  if (!hasAssets) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p="m">
        <CustomText variant="body" color="disabledTextColor" textAlign="center">
          No assets found
        </CustomText>
        <CustomButton
          onPress={refresh}
          text="Refresh"
          width={100}
          height={40}
          mt="m"
        />
      </Box>
    );
  }

  return (
    <Box flex={1} p="m">
      {/* Portfolio Summary */}
      <Box 
        backgroundColor="mainBackgroundColor" 
        borderRadius={12} 
        p="m" 
        mb="m"
      >
        <CustomText variant="subheader" mb="s">
          Portfolio Summary
        </CustomText>
        <CustomText variant="bodyBold" fontSize={24} color="primaryColor">
          {PortfolioService.formatCurrency(totalValue)}
        </CustomText>
        <CustomText variant="body" color="disabledTextColor">
          {enabledAssets.length} assets
        </CustomText>
      </Box>

      {/* Assets List */}
      <Box>
        <CustomText variant="subheader" mb="m">
          Your Assets
        </CustomText>
        
        {enabledAssets.map((asset) => (
          <Pressable key={asset.id} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Box
              backgroundColor="mainBackgroundColor"
              borderRadius={12}
              p="m"
              mb="s"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flexDirection="row" alignItems="center" flex={1}>
                <Box
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={PortfolioService.getAssetIconColor(asset.symbol)}
                  justifyContent="center"
                  alignItems="center"
                  mr="m"
                >
                  <CustomText style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                    {asset.symbol}
                  </CustomText>
                </Box>
                
                <Box flex={1}>
                  <CustomText variant="bodyBold" fontSize={16}>
                    {asset.symbol}
                  </CustomText>
                  <CustomText variant="body" fontSize={12} color="disabledTextColor">
                    {asset.name}
                  </CustomText>
                </Box>
              </Box>

              <Box alignItems="flex-end">
                <CustomText variant="bodyBold" fontSize={16}>
                  {PortfolioService.formatCurrency(asset.totalUsdValue)}
                </CustomText>
                <CustomText variant="body" fontSize={12} color="disabledTextColor">
                  {PortfolioService.formatBalance(asset.balance, asset.decimals)} {asset.symbol}
                </CustomText>
              </Box>
            </Box>
          </Pressable>
        ))}
      </Box>

      {/* Refresh Button */}
      <Box mt="m">
        <CustomButton
          onPress={refresh}
          text="Refresh Portfolio"
          width="100%"
          height={50}
        />
      </Box>
    </Box>
  );
}

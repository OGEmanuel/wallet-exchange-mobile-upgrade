import { useZapSDK } from '@/src/core/sdk/useZapSDK';
import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { CustomText } from '../general';
import Box from '../general/Box';

interface PortfolioWithSDKProps {
  onAssetPress?: (asset: any) => void;
}

export default function PortfolioWithSDK({ onAssetPress }: PortfolioWithSDKProps) {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme<Theme>();
  const { sdk, isInitialized } = useZapSDK();

  useEffect(() => {
    if (isInitialized && sdk) {
      loadPortfolio();
    }
  }, [isInitialized, sdk]);

  const loadPortfolio = async () => {
    if (!sdk || !isInitialized) {
      setError('SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const portfolioData = await sdk.portfolio.getPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setError('Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <CustomText variant="body">Loading portfolio...</CustomText>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <CustomText variant="body" color="alertColor">{error}</CustomText>
        <CustomText 
          variant="body" 
          style={{ marginTop: 8, textAlign: 'center' }}
          onPress={loadPortfolio}
        >
          Tap to retry
        </CustomText>
      </Box>
    );
  }

  if (!portfolio) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <CustomText variant="body">No portfolio data available</CustomText>
      </Box>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Total Balance */}
      <Box
        width="100%"
        height={120}
        alignItems="center"
        justifyContent="center"
        backgroundColor="mainBackgroundColor"
        padding="m"
      >
        <CustomText fontSize={12} variant="body" color="bodyTextColor">
          Your portfolio value
        </CustomText>

        <CustomText variant="header" marginVertical="s" fontSize={28}>
          {formatCurrency(portfolio.totalValueUSD || 0)}
        </CustomText>

        {portfolio.performance && (
          <Box
            width={126}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            height={24}
            borderRadius={24}
            paddingHorizontal="s"
            backgroundColor="secondaryBackgroundColor"
          >
            <CustomText fontSize={10} color={portfolio.performance.dailyReturn >= 0 ? 'success' : 'pendingColor'}>
              {formatCurrency(portfolio.performance.dailyReturnUSD || 0)}
            </CustomText>
            <CustomText fontSize={10} marginLeft="s">
              <CustomText 
                fontSize={10} 
                color={portfolio.performance.dailyReturn >= 0 ? 'success' : 'pendingColor'}
              >
                {formatPercentage(portfolio.performance.dailyReturn || 0)}
              </CustomText> in 24H
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Performance Overview */}
      {portfolio.performance && (
        <Box backgroundColor="mainBackgroundColor" margin="m" padding="m" borderRadius={12}>
          <CustomText variant="subheader" marginBottom="m">
            Performance
          </CustomText>
          
          <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
            <CustomText variant="body" color="bodyTextColor">Total Return</CustomText>
            <CustomText 
              variant="body" 
              color={portfolio.performance.totalReturn >= 0 ? 'success' : 'pendingColor'}
            >
              {formatPercentage(portfolio.performance.totalReturn || 0)}
            </CustomText>
          </Box>
          
          <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
            <CustomText variant="body" color="bodyTextColor">Daily</CustomText>
            <CustomText 
              variant="body" 
              color={portfolio.performance.dailyReturn >= 0 ? 'success' : 'pendingColor'}
            >
              {formatPercentage(portfolio.performance.dailyReturn || 0)}
            </CustomText>
          </Box>
          
          <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
            <CustomText variant="body" color="bodyTextColor">Weekly</CustomText>
            <CustomText 
              variant="body" 
              color={portfolio.performance.weeklyReturn >= 0 ? 'success' : 'pendingColor'}
            >
              {formatPercentage(portfolio.performance.weeklyReturn || 0)}
            </CustomText>
          </Box>
          
          <Box flexDirection="row" justifyContent="space-between">
            <CustomText variant="body" color="bodyTextColor">Monthly</CustomText>
            <CustomText 
              variant="body" 
              color={portfolio.performance.monthlyReturn >= 0 ? 'success' : 'pendingColor'}
            >
              {formatPercentage(portfolio.performance.monthlyReturn || 0)}
            </CustomText>
          </Box>
        </Box>
      )}

      {/* Assets */}
      {portfolio.assets && portfolio.assets.length > 0 && (
        <Box backgroundColor="mainBackgroundColor" margin="m" padding="m" borderRadius={12}>
          <CustomText variant="subheader" marginBottom="m">
            Assets ({portfolio.assets.length})
          </CustomText>
          
          {portfolio.assets.map((asset: any, index: number) => (
            <Box
              key={index}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="s"
              borderBottomWidth={index < portfolio.assets.length - 1 ? 1 : 0}
              borderBottomColor="borderColor"
              onPress={() => onAssetPress?.(asset)}
            >
              <Box flex={1}>
                <CustomText variant="body" fontWeight="600">
                  {asset.symbol}
                </CustomText>
                <CustomText variant="caption" color="bodyTextColor">
                  {asset.name}
                </CustomText>
              </Box>
              
              <Box alignItems="flex-end">
                <CustomText variant="body" fontWeight="600">
                  {formatCurrency(asset.valueUSD || 0)}
                </CustomText>
                <CustomText variant="caption" color="bodyTextColor">
                  {asset.balance} {asset.symbol}
                </CustomText>
              </Box>
              
              <Box alignItems="flex-end" marginLeft="s">
                <CustomText 
                  variant="bodyMedium" 
                  color={asset.change24h >= 0 ? 'success' : 'pendingColor'}
                >
                  {formatPercentage(asset.change24h || 0)}
                </CustomText>
                <CustomText variant="bodySubheader" color="bodyTextColor">
                  {asset.percentage?.toFixed(1)}%
                </CustomText>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Allocation */}
      {portfolio.allocation && (
        <Box backgroundColor="mainBackgroundColor" margin="m" padding="m" borderRadius={12}>
          <CustomText variant="subheader" marginBottom="m">
            Allocation
          </CustomText>
          
          {Object.entries(portfolio.allocation.byAsset || {}).map(([asset, percentage]: [string, any]) => (
            <Box key={asset} flexDirection="row" justifyContent="space-between" marginBottom="s">
              <CustomText variant="body">{asset}</CustomText>
              <CustomText variant="body">{percentage.toFixed(1)}%</CustomText>
            </Box>
          ))}
        </Box>
      )}
    </ScrollView>
  );
}

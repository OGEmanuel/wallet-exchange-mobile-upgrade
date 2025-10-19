import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput } from 'react-native';
import { useSelector } from 'react-redux';

import Box from '@/components/general/Box';
import CustomButton from '@/components/general/CustomButton';
import CustomText from '@/components/general/CustomText';
import PageWrapper from '@/components/general/PageWrapper';
import ZapLoader from '@/components/general/ZapLoader';
import useTokenList from '@/hooks/useTokenList';
import { ProcessedAsset } from '@/interfaces/portfolio.interface';
import { AppRootState } from '@/state';
import { selectTokensBySearch } from '@/state/selectors/portfolio.selectors';
import { Theme } from '@/theme';
import { ArrowLeft, Search } from 'lucide-react-native';

const TokenListScreen = () => {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redux state
  const allSupportedTokens = useSelector((state: AppRootState) => 
    selectTokensBySearch(state, searchTerm)
  );
  
  // Token list hook
  const { isLoading, error, refetch } = useTokenList();

  const handleTokenPress = (token: ProcessedAsset) => {
    // Navigate to token details
    router.push(`/dashboard/home/token-details/${token.id}`);
  };

  const handleBack = () => {
    router.back();
  };

  const renderTokenItem = (token: ProcessedAsset) => (
    <Pressable
      key={token.id}
      onPress={() => handleTokenPress(token)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        padding="m"
        backgroundColor="mainBackgroundColor"
        borderRadius={12}
        marginBottom="s"
        style={{
          borderWidth: 1,
          borderColor: theme.colors.borderColor,
        }}
      >
        {/* Token Image */}
        <Box
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          {token.image ? (
            <CustomText fontSize={16}>🪙</CustomText>
          ) : (
            <CustomText fontSize={16}>{token.symbol.charAt(0)}</CustomText>
          )}
        </Box>

        {/* Token Info */}
        <Box flex={1}>
          <CustomText variant="bodyBold" fontSize={16} color="headerTextColor">
            {token.name}
          </CustomText>
          <CustomText variant="body" fontSize={14} color="bodyTextColor">
            {token.symbol}
          </CustomText>
          <CustomText variant="light" fontSize={12} color="disabledTextColor">
            {token.chainName}
          </CustomText>
        </Box>

        {/* Status Badge */}
        <Box
          backgroundColor={token.status === 'ENABLED' ? 'success' : 'disabledTextColor'}
          paddingHorizontal="s"
          paddingVertical="xs"
          borderRadius={8}
        >
          <CustomText 
            fontSize={10} 
            color="white" 
            fontWeight="bold"
          >
            {token.status}
          </CustomText>
        </Box>
      </Box>
    </Pressable>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader size={100} showText={false} />
          <CustomText variant="body" fontSize={16} color="bodyTextColor" marginTop="m">
            Loading tokens...
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center" padding="xl">
          <CustomText variant="bodyBold" fontSize={18} color="error" marginBottom="m">
            Failed to load tokens
          </CustomText>
          <CustomText variant="body" fontSize={14} color="bodyTextColor" marginBottom="l" textAlign="center">
            {error}
          </CustomText>
          <CustomButton
            text="Retry"
            onPress={refetch}
            width={120}
            height={40}
            borderRadius={20}
          />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="m"
        paddingVertical="s"
        backgroundColor="mainBackgroundColor"
      >
        <Pressable onPress={handleBack}>
          <ArrowLeft size={24} color={theme.colors.headerTextColor} />
        </Pressable>
        
        <CustomText variant="header" fontSize={18} color="headerTextColor">
          All Tokens
        </CustomText>
        
        <Box width={24} />
      </Box>

      {/* Search Bar */}
      <Box padding="m">
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          paddingHorizontal="m"
          paddingVertical="s"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
          }}
        >
          <Search size={20} color={theme.colors.bodyTextColor} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search tokens..."
            placeholderTextColor={theme.colors.bodyTextColor}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: theme.colors.headerTextColor,
            }}
          />
        </Box>
      </Box>

      {/* Token List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {allSupportedTokens.length === 0 ? (
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="xl"
          >
            <CustomText variant="bodyBold" fontSize={16} color="headerTextColor" marginBottom="s">
              No tokens found
            </CustomText>
            <CustomText variant="body" fontSize={14} color="bodyTextColor" textAlign="center">
              {searchTerm ? 'Try a different search term' : 'No tokens available'}
            </CustomText>
          </Box>
        ) : (
          <>
            <CustomText variant="body" fontSize={14} color="bodyTextColor" marginBottom="m">
              {allSupportedTokens.length} token{allSupportedTokens.length !== 1 ? 's' : ''} found
            </CustomText>
            {allSupportedTokens.map(renderTokenItem)}
          </>
        )}
      </ScrollView>
    </PageWrapper>
  );
};

export default TokenListScreen;

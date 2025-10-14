import SearchIcon from "@/assets/svg/wallet-icons-components/SearchIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { ProcessedAsset, ProcessedPortfolio } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { useChains } from "@/src/core/chains/chains-context";
import { formatCurrency, formatNumber } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { setStage } from "@/state/reducers/recievePage.reducer";
import theme, { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { MoreHorizontalIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import { SvgUri } from "react-native-svg";
import { useDispatch } from "react-redux";
import SelectChainBottomSheet from "../SelectChainBottomSheet";

const CryptoIcon = React.memo(({ image }: { image?: string }) => {
  return (
    <Box
      width={40}
      height={40}
      borderRadius={20}
      marginRight="m"
      overflow="hidden"
      backgroundColor="secondaryBackgroundColor"
      justifyContent="center"
      alignItems="center"
    >
      {image ? (
        <SvgUri
          uri={image}
          width={35}
          height={35}
          onError={() => {
            console.log("Failed to load token image:", image);
          }}
          style={{
            borderRadius: 20,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
        />
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
});

CryptoIcon.displayName = 'CryptoIcon';

interface ReceiveTokensProps {
  onTokenSelect: (token: ProcessedAsset) => void;
}

const ReceiveTokens: React.FC<ReceiveTokensProps> = ({ onTokenSelect }) => {
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");
  const { portfolio } = useWallet();
  const [processedPortfolio, setProcessedPortfolio] = useState<ProcessedPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { walletChains } = useChains();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const chainBottomSheetRef = useRef<BottomSheet>(null);

  // Process portfolio data when portfolio changes
  useEffect(() => {
    const processPortfolio = async () => {
      if (!portfolio) {
        setProcessedPortfolio(null);
        return;
      }

      try {
        setIsLoading(true);
        const processed = await PortfolioService.processPortfolioData(portfolio);
        setProcessedPortfolio(processed);
      } catch (error) {
        console.error("❌ ReceiveTokens - Failed to process portfolio data:", error);
        setProcessedPortfolio(null);
      } finally {
        setIsLoading(false);
      }
    };

    processPortfolio();
  }, [portfolio]);

  // Get unique chains from all tokens
  const availableChains = useMemo(() => {
    const topChains = ["ETH", "BTC", "SOL", "TRX"];
    const chains = walletChains
      .filter((chain) => topChains.includes(chain.symbol))
      .map((chain) => ({
        symbol: chain.symbol,
        name: chain.name,
        image: chain.nativeCurrencyId.logo,
        chainImage: chain.nativeCurrencyId.logo,
        chainSymbol: chain.symbol,
        chainName: chain.name,
      }));

    return [...chains.sort((a, b) => a.name.localeCompare(b.name))];
  }, [walletChains]);

  // Get enabled tokens from processed portfolio
  const enabledTokens = useMemo(() => {
    if (!processedPortfolio?.assets) {
      return [];
    }

    return processedPortfolio.assets.filter((asset: ProcessedAsset) => asset.status === 'ENABLED');
  }, [processedPortfolio]);

  // Filter tokens based on search and chain
  const filteredTokens = useMemo(() => {
    let filtered = enabledTokens;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (token: ProcessedAsset) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query)
      );
    }

    // Filter by chain
    if (selectedChain && selectedChain !== "ALL") {
      filtered = filtered.filter((token) => token.chainSymbol === selectedChain);
    }

    return filtered;
  }, [enabledTokens, searchQuery, selectedChain]);



  const handleTokenPress = (token: ProcessedAsset) => {
    onTokenSelect(token);
    // Navigate to QR code stage
    dispatch(setStage("qrcode"));
  };

  return (
    <Box flex={1}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="l">
        <CustomText variant="header" fontSize={20} color="headerTextColor">
          Receive Tokens
        </CustomText>
        <Pressable onPress={() => dispatch(setStage("import"))}>
          <CustomText color="secondaryColor" fontSize={14}>
            Import Token
          </CustomText>
        </Pressable>
      </Box>

      {/* Search Bar */}
      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor="secondaryBackgroundColor"
        borderRadius={12}
        paddingHorizontal="m"
        paddingVertical="s"
        marginBottom="l"
      >
        <SearchIcon width={20} height={20} color={theme.colors.disabledTextColor} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: theme.colors.headerTextColor,
          }}
          placeholder="Search tokens"
          placeholderTextColor={theme.colors.disabledTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Box>

      {/* Chain Filter */}
      <Box marginBottom="l">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <CustomText variant="body" fontSize={16} color="headerTextColor">
            All Chains
          </CustomText>

          {/* Stacked chain icons on the right */}
          <Pressable
            onPress={() => chainBottomSheetRef.current?.snapToIndex(0)}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Box flexDirection="row" alignItems="center">
              {/* Chain icons stacked from right to left */}
              {availableChains
                .slice(0, 4)
                .reverse()
                .map((chain, index) => (
                  <Box
                    key={chain.symbol}
                    width={32}
                    height={32}
                    borderRadius={16}
                    backgroundColor="secondaryBackgroundColor"
                    borderWidth={0}
                    justifyContent="center"
                    alignItems="center"
                    style={{ marginLeft: index === 0 ? 0 : -10 }}
                    zIndex={index + 1}
                    overflow="hidden"
                  >
                    {chain.chainImage ? (
                      <SvgUri
                        uri={chain.chainImage}
                        width={28}
                        height={28}
                        onError={() => {
                          console.log(
                            "Failed to load chain image:",
                            chain.chainSymbol
                          );
                        }}
                      />
                    ) : (
                      <CustomText
                        variant="bodyBold"
                        fontSize={10}
                        color="headerTextColor"
                      >
                        {chain.symbol}
                      </CustomText>
                    )}
                  </Box>
                ))}

              {/* More indicator */}
              <Box
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="black"
                justifyContent="center"
                alignItems="center"
                style={{ marginLeft: -10 }}
                zIndex={10}
                mr="s"
              >
                <MoreHorizontalIcon width={20} height={20} color="white" />
              </Box>
              <Box>
                <ArrowRight2 width={20} height={20} color="white" />
              </Box>
            </Box>
          </Pressable>
        </Box>
      </Box>

      {/* Tokens List */}
      <Box flex={1}>
        <CustomText variant="body" fontSize={14} color="disabledTextColor" marginBottom="s">
          Your tokens ({filteredTokens.length})
        </CustomText>
        
        <ScrollView
          style={{
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderRadius: 12,
            flex: 1,
          }}
          contentContainerStyle={{
            padding: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <Box alignItems="center" justifyContent="center" paddingVertical="xl">
              <CustomText color="disabledTextColor" textAlign="center">
                Loading tokens...
              </CustomText>
            </Box>
          ) : filteredTokens.length === 0 ? (
            <Box alignItems="center" justifyContent="center" paddingVertical="xl">
              <CustomText color="disabledTextColor" textAlign="center">
                {searchQuery ? "No tokens found" : "No enabled tokens"}
              </CustomText>
            </Box>
          ) : (
            filteredTokens.map((token: ProcessedAsset, index: number) => (
              <Pressable
                key={`${token.symbol}-${token.chainSymbol}-${index}`}
                onPress={() => handleTokenPress(token)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  marginBottom: 4,
                })}
              >
                <CryptoIcon image={token.image} />
                
                <Box flex={1}>
                  <Box flexDirection="row" alignItems="center" marginBottom="s">
                    <CustomText variant="body" fontSize={16} color="headerTextColor">
                      {token.symbol}
                    </CustomText>
                    {token.chainSymbol && (
                      <Box
                        backgroundColor="secondaryBackgroundColor"
                        borderRadius={8}
                        paddingHorizontal="s"
                        paddingVertical="s"
                        marginLeft="s"
                      >
                        <CustomText variant="body" fontSize={10} color="disabledTextColor">
                          {token.chainSymbol}
                        </CustomText>
                      </Box>
                    )}
                  </Box>
                  <CustomText variant="body" fontSize={12} color="disabledTextColor">
                    {token.name}
                  </CustomText>
                </Box>

                <Box alignItems="flex-end">
                  <CustomText variant="body" fontSize={14} color="headerTextColor">
                    {formatNumber(token.balance, 4)} {token.symbol}
                  </CustomText>
                  <CustomText variant="body" fontSize={12} color="disabledTextColor">
                    {formatCurrency(token.totalUsdValue)}
                  </CustomText>
                </Box>

                <Box marginLeft="s">
                  <ArrowRight2 size={16} color={theme.colors.disabledTextColor} />
                </Box>
              </Pressable>
            ))
          )}
        </ScrollView>
      </Box>

      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={setSelectedChain}
      />
    </Box>
  );
};

export default ReceiveTokens;

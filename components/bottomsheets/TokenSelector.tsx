import SearchIcon from "@/assets/svg/wallet-icons-components/SearchIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import TokenCardSkeleton from "@/components/dashboard/TokenCardSkeleton";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import SmartImage from "@/components/general/SmartImage";
import ImportTokenModal from "@/components/Modals/ImportTokenModal";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { useChains } from "@/src/core/chains/chains-context";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { formatCurrency, formatNumber } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import { selectStage, setStage } from "@/state/reducers/recievePage.reducer";
import { selectAllSupportedTokens } from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { shortenChainName } from "@/utils/chainFiltering";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import { ICurrency } from "@zap/blockchain-sdk";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { MoreHorizontalIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChainLogo from "../general/ChainLogo";
import ReceiveQRCode from "./recieve/ReceiveQRCode";
import SelectChainBottomSheet from "./SelectChainBottomSheet";

const CryptoIcon = React.memo(({ image }: { image?: string }) => {
  return (
    <Box
      width={30}
      height={30}
      borderRadius={17.5}
      marginRight="m"
      overflow="hidden"
      backgroundColor="secondaryBackgroundColor"
      justifyContent="center"
      alignItems="center"
    >
      {image ? (
        <SmartImage
          source={{ uri: image }}
          width={30}
          height={30}
          borderRadius={20}
          onError={() => {
            console.log("Failed to load token image:", image);
          }}
        />
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
});

CryptoIcon.displayName = "CryptoIcon";

interface TokenSelectorProps {
  mode: "send" | "receive" | "swap" | "sell" | "buy";
  onTokenSelect: (token: ProcessedAsset | any) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  mode,
  onTokenSelect,
}) => {
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");
  const { mainUserWalletGroup, refreshPortfolio } = useWallet();

  // Redux state
  const allTokens = useSelector(selectAllSupportedTokens);
  const { isPortfolioLoading } = useSelector(
    (state: AppRootState) => state.portfolio
  );
  const { walletChains, getChainImage } = useChains();

  // Supported currencies for swap mode
  const {
    supportedCurrenciesForSwap,
    isLoading: isSupportedCurrenciesLoading,
    searchSupportedCurrenciesForSwap,
  } = useSupportedCurrencies();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const chainBottomSheetRef = useRef<BottomSheetMethods>(null);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ProcessedAsset | null>(
    null
  );

  // For receive mode, get the current stage
  const stage = useSelector(selectStage);
  const dispatch = useDispatch();

  // Portfolio data now comes from Redux selectors

  // Get unique chains from all tokens
  const availableChains = useMemo(() => {
    const topChains = ["ETH", "BTC", "SOL", "TRX"];
    const chains = walletChains
      .filter((chain) => topChains.includes(chain.symbol))
      .map((chain) => ({
        symbol: chain.symbol,
        name: chain.name,
        image: getChainImage(chain._id || ""),
        chainImage: getChainImage(chain._id || ""),
        chainSymbol: chain.symbol,
        chainName: chain.name,
      }));

    return [...chains.sort((a, b) => a.name.localeCompare(b.name))];
  }, [walletChains]);

  // Filter tokens based on search and chain
  const filteredTokens = useMemo(() => {
    let filtered: any[] = [];

    // Use different data source based on mode
    if (mode === "swap") {
      filtered =
        supportedCurrenciesForSwap
          .filter(
            (token) => (token.currencyId as Partial<ICurrency>)?.symbol
          )
          .sort((a, b) => {
            // Sort by balance (highest first), then by crypto status
            const aBalance = (a as any).balance || 0;
            const bBalance = (b as any).balance || 0;
            if (bBalance !== aBalance) {
              return bBalance - aBalance; // Higher balance first
            }
            // If balances are equal, prioritize crypto
            const aIsCrypto = (a.currencyId as Partial<ICurrency>)?.isCrypto;
            const bIsCrypto = (b.currencyId as Partial<ICurrency>)?.isCrypto;
            return aIsCrypto ? 1 : -1;
          }) || [];
    } else if (mode === "buy" || mode === "sell") {
      // For buy and sell modes, use supported currencies for swap but filter for crypto tokens only
      filtered =
        supportedCurrenciesForSwap
          .filter((token) => {
            const currency = token.currencyId as Partial<ICurrency>;
            return currency?.isCrypto && currency?.symbol;
          })
          .sort((a, b) => {
            // Sort by balance (highest first), then alphabetically by symbol
            const aBalance = (a as any).balance || 0;
            const bBalance = (b as any).balance || 0;
            if (bBalance !== aBalance) {
              return bBalance - aBalance; // Higher balance first
            }
            // If balances are equal, sort alphabetically
            const aSymbol = (a.currencyId as Partial<ICurrency>)?.symbol || "";
            const bSymbol = (b.currencyId as Partial<ICurrency>)?.symbol || "";
            return aSymbol.localeCompare(bSymbol);
          }) || [];
    } else {
      // For send and receive modes, use processed portfolio data (already sorted by USD value)
      filtered = allTokens || [];
    }

    // Ensure filtered is always an array
    if (!Array.isArray(filtered)) {
      filtered = [];
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (mode === "swap") {
        const searchResults = searchSupportedCurrenciesForSwap(query);
        // Re-sort search results by balance
        filtered = searchResults.sort((a, b) => {
          const aBalance = (a as any).balance || 0;
          const bBalance = (b as any).balance || 0;
          if (bBalance !== aBalance) {
            return bBalance - aBalance;
          }
          const aIsCrypto = (a.currencyId as Partial<ICurrency>)?.isCrypto;
          const bIsCrypto = (b.currencyId as Partial<ICurrency>)?.isCrypto;
          return aIsCrypto ? 1 : -1;
        });
      } else if (mode === "buy" || mode === "sell") {
        // For buy/sell, filter from supported currencies
        filtered = filtered.filter((token: any) => {
          const currency = token.currencyId as Partial<ICurrency>;
          const symbol = currency?.symbol || "";
          const name = currency?.name || "";
          return (
            symbol.toLowerCase().includes(query) ||
            name.toLowerCase().includes(query)
          );
        });
      } else {
        filtered = filtered.filter((token: any) => {
          const symbol = token.symbol;
          const name = token.name;
          return name.includes(query) || symbol.includes(query);
        });
      }
    }

    // Filter by chain
    if (selectedChain && selectedChain !== "ALL") {
      filtered = filtered.filter((token: any) => {
        if (mode === "swap" || mode === "buy" || mode === "sell") {
          return token.chainId?.symbol === selectedChain;
        } else {
          return token.chainSymbol === selectedChain;
        }
      });
    }

    // Re-sort after filtering to maintain balance-based sorting for buy/sell/swap modes
    if (mode === "swap" || mode === "buy" || mode === "sell") {
      filtered = filtered.sort((a, b) => {
        // Sort by balance (highest first)
        const aBalance = (a as any).balance || 0;
        const bBalance = (b as any).balance || 0;
        if (bBalance !== aBalance) {
          return bBalance - aBalance; // Higher balance first
        }
        // If balances are equal, sort alphabetically by symbol
        const aSymbol = (a.currencyId as Partial<ICurrency>)?.symbol || "";
        const bSymbol = (b.currencyId as Partial<ICurrency>)?.symbol || "";
        return aSymbol.localeCompare(bSymbol);
      });
    }

    return filtered;
  }, [mode, allTokens, supportedCurrenciesForSwap, searchQuery, selectedChain]);

  const handleTokenPress = (token: ProcessedAsset) => {
    if (mode === "receive") {
      setSelectedToken(token);
    }

    onTokenSelect(token);
  };

  const handleImportToken = async (tokenData: {
    chain: string;
    contractAddress: string;
    symbol: string;
    decimals: string;
    tokenAddress: string;
  }) => {
    try {
      console.log("🔄 Importing token:", tokenData);

      // Use the SDK service to add the token
      await zapSDKService.addToken({
        userWalletGroupId: mainUserWalletGroup?._id || "",
        tokenAddress: tokenData.contractAddress,
        chainId: tokenData.chain,
      });

      console.log("✅ Token imported successfully");

      // Refresh the portfolio to show the new token
      await refreshPortfolio(mainUserWalletGroup?._id);

      // Close the modal
      setShowImportModal(false);
    } catch (error) {
      console.error("❌ Failed to import token:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleBack = useCallback(() => {
    setSelectedToken(null);
    dispatch(setStage("token"));
  }, [dispatch]);

  const title =
    mode === "send"
      ? "Send Tokens"
      : mode === "receive"
      ? "Receive Tokens"
      : mode === "sell"
      ? "Sell Tokens"
      : mode === "buy"
      ? "Buy Tokens"
      : "Select Currency";

  // For receive mode, show QR code when stage is "qrcode"
  if (mode === "receive" && stage === "qrcode" && selectedToken) {
    return <ReceiveQRCode selectedToken={selectedToken} onBack={handleBack} />;
  }

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb="l"
      >
        <CustomText variant="header" fontSize={20} color="headerTextColor">
          {title}
        </CustomText>
        {(mode === "send" || mode === "receive") && (
          <Pressable onPress={() => setShowImportModal(true)}>
            <CustomText color="secondaryColor" fontSize={14}>
              Import Token
            </CustomText>
          </Pressable>
        )}
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
        <SearchIcon
          width={20}
          height={20}
          color={theme.colors.disabledTextColor}
        />
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
            onPress={() => {
              setShowChainSelector(true);
            }}
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
                    width={28}
                    height={28}
                    borderRadius={14}
                    backgroundColor="secondaryBackgroundColor"
                    borderWidth={0}
                    justifyContent="center"
                    alignItems="center"
                    style={{ marginLeft: index === 0 ? 0 : -10 }}
                    zIndex={index + 1}
                    overflow="hidden"
                  >
                    {chain.chainImage ? (
                      <ChainLogo
                        symbol={chain.symbol}
                        name={chain.name}
                        logoUrl={chain.chainImage}
                        width={28}
                        height={28}
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
      <Box flex={1} style={{ minHeight: 0 }}>
        <CustomText
          variant="body"
          fontSize={14}
          color="disabledTextColor"
          marginBottom="s"
        >
          Your tokens ({(filteredTokens || []).length})
        </CustomText>

        <ScrollView
          style={{
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderRadius: 12,
            flex: 1,
          }}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: 100, // Add bottom padding to account for tab bar
          }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {(
            mode === "swap" || mode === "buy" || mode === "sell"
              ? isSupportedCurrenciesLoading
              : isPortfolioLoading
          ) ? (
            <Box>
              {/* Skeleton loaders for token cards */}
              {Array.from({ length: 5 }).map((_, index) => (
                <TokenCardSkeleton key={index} />
              ))}
            </Box>
          ) : (filteredTokens || []).length === 0 ? (
            <Box
              alignItems="center"
              justifyContent="center"
              paddingVertical="xl"
            >
              <CustomText color="disabledTextColor" textAlign="center">
                {searchQuery ? "No tokens found" : "No enabled tokens"}
              </CustomText>
            </Box>
          ) : (
            (filteredTokens || []).map((token: any, index: number) => {
              const isSwap = mode === "swap";
              const isBuyOrSell = mode === "buy" || mode === "sell";
              const isSupportedCurrencyMode = isSwap || isBuyOrSell;
              const isCrypto = isSupportedCurrencyMode
                ? token.currencyId?.isCrypto
                : true;
              const alpha3 = isSupportedCurrencyMode
                ? token.currencyId?.code
                : null;
              const tokenSymbol = isSupportedCurrencyMode
                ? isCrypto
                  ? token.currencyId?.symbol
                  : alpha3
                : token.symbol;
              const tokenName = token.currencyId?.name || token.name;
              const tokenImage = isSupportedCurrencyMode
                ? token.image || token.currencyId?.logo
                : token.image;
              const rawChainName = isSupportedCurrencyMode
                ? token.chainId?.name
                : token.chainName;
              const chainName = rawChainName
                ? shortenChainName(rawChainName)
                : rawChainName;
              // For buy/sell/swap modes, use balance from enriched supportedCurrenciesForSwap
              // For send/receive modes, use balance from processed portfolio
              const balance = isSupportedCurrencyMode 
                ? (token as any).balance || 0 
                : token.balance || 0;
              const usdValue = isSupportedCurrencyMode
                ? (token as any).totalUsdValue || 0
                : token.totalUsdValue || 0;

              return (
                <Pressable
                  key={`${tokenSymbol}-${token._id || index}-${index}`}
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
                  <CryptoIcon image={tokenImage} />

                  <Box flex={1}>
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      marginBottom="s"
                    >
                      <CustomText
                        variant="body"
                        fontSize={16}
                        color="headerTextColor"
                      >
                        {tokenSymbol}
                      </CustomText>
                      {chainName && (
                        <Box
                          backgroundColor="modalBackgroundColor"
                          borderRadius={8}
                          paddingHorizontal="s"
                          paddingVertical="s"
                          marginLeft="s"
                        >
                          <CustomText
                            variant="body"
                            fontSize={10}
                            color="disabledTextColor"
                          >
                            {chainName}
                          </CustomText>
                        </Box>
                      )}
                    </Box>
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="placeholderTextColor"
                    >
                      {tokenName}
                    </CustomText>
                  </Box>

                  <Box alignItems="flex-end">
                    {isSupportedCurrencyMode ? (
                      // For buy/sell/swap modes, show balance if available
                      balance > 0 ? (
                        <>
                          <CustomText
                            variant="body"
                            fontSize={14}
                            color="headerTextColor"
                          >
                            {formatNumber(balance, 6)} {tokenSymbol}
                          </CustomText>
                          {usdValue > 0 && (
                            <CustomText
                              variant="body"
                              fontSize={12}
                              color="disabledTextColor"
                              mt="s"
                            >
                              {formatCurrency(usdValue, "USD")}
                            </CustomText>
                          )}
                        </>
                      ) : (
                        <CustomText
                          variant="body"
                          fontSize={14}
                          color="placeholderTextColor"
                        >
                          {mode === "swap" ? "Available" : "0"}
                        </CustomText>
                      )
                    ) : (
                      // For send/receive modes, always show balance
                      <>
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="headerTextColor"
                    >
                          {formatNumber(balance, 4)} {tokenSymbol}
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                      mt="s"
                    >
                          {formatCurrency(usdValue, "USD")}
                    </CustomText>
                      </>
                    )}
                  </Box>

                  <Box marginLeft="s">
                    <ArrowRight2 size={16} color={theme.colors.white} />
                  </Box>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </Box>

      {/* Import Token Modal - Self-contained */}
      <ImportTokenModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportToken={handleImportToken}
        allChains={walletChains}
        mainUserWalletGroup={mainUserWalletGroup}
      />

      {/* Chain Selection Bottom Sheet - Only render when needed */}
      {showChainSelector && (
        <SelectChainBottomSheet
          ref={chainBottomSheetRef}
          onChainSelect={(chainSymbol) => {
            setSelectedChain(chainSymbol);
            chainBottomSheetRef.current?.close();
            // Close after a short delay to allow animation
            setTimeout(() => {
              setShowChainSelector(false);
            }, 300);
          }}
          onClose={() => {
            // Handle close when user swipes down or taps backdrop
            setShowChainSelector(false);
          }}
        />
      )}
    </Box>
  );
};

export default TokenSelector;

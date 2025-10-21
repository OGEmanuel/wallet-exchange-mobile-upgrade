import SearchIcon from "@/assets/svg/wallet-icons-components/SearchIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import TokenCardSkeleton from "@/components/dashboard/TokenCardSkeleton";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
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
import theme, { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ICurrency } from "@zap/blockchain-sdk";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { MoreHorizontalIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import { SvgUri } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
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
        <SvgUri
          uri={image}
          width={30}
          height={30}
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

CryptoIcon.displayName = "CryptoIcon";

interface TokenSelectorProps {
  mode: "send" | "receive" | "swap";
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
  const { walletChains } = useChains();

  // Supported currencies for swap mode
  const { supportedCurrencies, isLoading: isSupportedCurrenciesLoading, searchSupportedCurrencies } =
    useSupportedCurrencies();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const chainBottomSheetRef = useRef<BottomSheet>(null);
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
        image: chain.nativeCurrencyId.logo,
        chainImage: chain.nativeCurrencyId.logo,
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
        supportedCurrencies
          .sort((a, b) =>
            (a.currencyId as Partial<ICurrency>)?.isCrypto ? 1 : -1
          )
          .filter(
            (token) => (token.currencyId as Partial<ICurrency>)?.symbol
          ) || [];
    } else {
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
        filtered = searchSupportedCurrencies(query);
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
        if (mode === "swap") {
          return token.chainId?.symbol === selectedChain;
        } else {
          return token.chainSymbol === selectedChain;
        }
      });
    }

    return filtered;
  }, [mode, allTokens, supportedCurrencies, searchQuery, selectedChain]);

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
      await refreshPortfolio();

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
      : "Select Currency";

  // For receive mode, show QR code when stage is "qrcode"
  if (mode === "receive" && stage === "qrcode" && selectedToken) {
    return <ReceiveQRCode selectedToken={selectedToken} onBack={handleBack} />;
  }

  return (
    <Box flex={1}>
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
        {mode !== "swap" && (
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
        >
          {(
            mode === "swap" ? isSupportedCurrenciesLoading : isPortfolioLoading
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
              const isCrypto =
                mode === "swap" ? token.currencyId?.isCrypto : true;
              const alpha3 = mode === "swap" ? token.currencyId?.code : null;
              const tokenSymbol = isCrypto ? token.currencyId?.symbol : alpha3;
              const tokenName = token.currencyId?.name;
              const tokenImage =
                mode === "swap"
                  ? token.image || token.currencyId?.logo
                  : token.image;
              const chainName =
                mode === "swap" ? token.chainId?.name : token.chainName;
              const balance = mode === "swap" ? 0 : token.balance || 0;
              const usdValue = mode === "swap" ? 0 : token.totalUsdValue || 0;

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
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="headerTextColor"
                    >
                      {mode === "swap"
                        ? "Available"
                        : `${formatNumber(balance, 4)} ${tokenSymbol}`}
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                      mt="s"
                    >
                      {mode === "swap" ? "Exchange" : formatCurrency(usdValue)}
                    </CustomText>
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

      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={(chainSymbol) => {
          setSelectedChain(chainSymbol);
          chainBottomSheetRef.current?.close();
        }}
      />

      {/* Import Token Modal - Self-contained */}
      <ImportTokenModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportToken={handleImportToken}
        allChains={walletChains}
        mainUserWalletGroup={mainUserWalletGroup}
      />
    </Box>
  );
};

export default TokenSelector;

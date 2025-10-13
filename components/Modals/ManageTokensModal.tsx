import SearchIcon from "@/assets/svg/wallet-icons-components/SearchIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput } from "react-native";
import { SvgUri } from "react-native-svg";
// import zapSDKService from '@/src/core/sdk/zap-sdk.service';
import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { useChains } from "@/src/core/chains/chains-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { MoreHorizontalIcon } from "lucide-react-native";
import { Switch } from "react-native-gesture-handler";
import ImportTokenModal from "./ImportTokenModal";
import SuccessModal from "./SuccessModal";

const CryptoIcon = ({ image }: { image?: string }) => {
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
          }}
        />
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
};

interface ManageTokensModalProps {
  visible: boolean;
  onClose: () => void;
  allTokens: ProcessedAsset[]; // All tokens including disabled/hidden
  onToggleToken: (assetId: string, enabled: boolean) => Promise<void>;
  onImportToken?: () => void;
  mainUserWalletGroup: any;
}

const ManageTokensModal: React.FC<ManageTokensModalProps> = ({
  visible,
  onClose,
  allTokens,
  onToggleToken,
  onImportToken,
  mainUserWalletGroup,
}) => {
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");
  const { walletChains } = useChains();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importedTokenData, setImportedTokenData] = useState<any>(null);
  const [togglingTokens, setTogglingTokens] = useState<Set<string>>(new Set());
  const [optimisticTokenStates, setOptimisticTokenStates] = useState<Map<string, string>>(new Map());
  const chainBottomSheetRef = useRef<BottomSheet>(null);

  // Clear optimistic states when modal closes
  useEffect(() => {
    if (!visible) {
      setOptimisticTokenStates(new Map());
      setTogglingTokens(new Set());
    }
  }, [visible]);
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
    let filtered = allTokens;

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
  }, [allTokens, searchQuery, selectedChain]);

  const handleToggleToken = async (assetId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ENABLED" ? "DISABLED" : "ENABLED";
    
    // Add to toggling set for loading state
    setTogglingTokens(prev => new Set(prev).add(assetId));
    
    // Optimistic update - immediately update the UI
    setOptimisticTokenStates(prev => new Map(prev).set(assetId, newStatus));
    
    try {
      await onToggleToken(assetId, newStatus === "ENABLED");
      console.log(`Token ${newStatus.toLowerCase()} successfully:`, assetId);
    } catch (error) {
      console.error("Failed to toggle token:", error);
      // Revert optimistic update on error
      setOptimisticTokenStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(assetId);
        return newMap;
      });
    } finally {
      // Remove from toggling set
      setTogglingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  };

  const handleImportToken = () => {
    setShowImportModal(true);
  };

  const handleImportTokenSubmit = (tokenData: {
    chain: string;
    contractAddress: string;
    symbol: string;
    decimals: string;
    tokenAddress: string;
  }) => {
    console.log("Import token data:", tokenData);
    setImportedTokenData(tokenData);
    setShowImportModal(false);
    setShowSuccessModal(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Box flex={1} backgroundColor="mainBackgroundColor">
        {/* Header */}
        <Pressable onPress={onClose}>
            <Box
              width={60}
              alignSelf="center"
              height={4}
              backgroundColor="white"
              borderRadius={2}
              marginTop="s"
            />
          </Pressable>
        <Box
          paddingTop="l"
          paddingBottom="m"
          alignItems="center"
          borderBottomColor="borderColor"
        >
          <Box width={24} />
          <CustomText variant="bodyBold" fontSize={18} color="headerTextColor">
            Edit Token List
          </CustomText>
          
        </Box>

        {/* Search Bar */}
        <Box paddingHorizontal="m" paddingVertical="m">
          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            paddingHorizontal="m"
            paddingVertical="s"
          >
            <SearchIcon
              width={20}
              height={20}
              color={theme.colors.placeholderTextColor}
            />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: theme.colors.headerTextColor,
                paddingVertical: 3,
              }}
              placeholder="Search token"
              placeholderTextColor={theme.colors.placeholderTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Box>
        </Box>

        {/* Chain Filter */}
        <Box paddingHorizontal="m" paddingBottom="m">
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
        <Box flex={1} paddingHorizontal="m">
          <CustomText
            variant="body"
            fontSize={14}
            color="headerTextColor"
            mb="s"
          >
            Tokens
          </CustomText>
          <Box
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            paddingHorizontal="m"
            flex={1}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredTokens.map((token, index) => (
                <Box
                  key={token.id}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical="m"
                  zIndex={99}
                >
                  <Box flexDirection="row" alignItems="center" flex={1}>
                    <CryptoIcon image={token.image} />
                    <Box flex={1} marginLeft="s">
                      <CustomText
                        variant="bodyBold"
                        fontSize={16}
                        color="headerTextColor"
                        mb="s"
                      >
                        {token.symbol}
                      </CustomText>
                      <Box flexDirection="row" alignItems="center">
                        <CustomText
                          variant="light"
                          fontSize={13}
                          color="disabledTextColor"
                          mr="s"
                        >
                          {token.balance} {token.symbol}
                        </CustomText>
                        <CustomText
                          variant="light"
                          fontSize={13}
                          color="headerTextColor"
                        >
                          ${token.totalUsdValue}
                        </CustomText>
                      </Box>
                    </Box>
                  </Box>

                  <Pressable
                    onPress={() => {
                      if (!togglingTokens.has(token.id)) {
                        handleToggleToken(token.id, token.status);
                      }
                    }}
                    style={({ pressed }) => ({ 
                      opacity: pressed || togglingTokens.has(token.id) ? 0.5 : 1 
                    })}
                    disabled={togglingTokens.has(token.id)}
                  >
                    <Switch
                      value={
                        optimisticTokenStates.has(token.id) 
                          ? optimisticTokenStates.get(token.id) === "ENABLED"
                          : token.status === "ENABLED"
                      }
                      trackColor={{
                        false: "disabledTextColor",
                        true: "success",
                      }}
                      onValueChange={() => {
                        if (!togglingTokens.has(token.id)) {
                          const currentStatus = optimisticTokenStates.has(token.id) 
                            ? optimisticTokenStates.get(token.id)!
                            : token.status;
                          handleToggleToken(token.id, currentStatus);
                        }
                      }}
                      disabled={togglingTokens.has(token.id)}
                    />
                  </Pressable>
                </Box>
              ))}
            </ScrollView>
          </Box>
        </Box>

        {/* Import Token Button */}
        {onImportToken && (
          <Box paddingHorizontal="m" paddingVertical="m" mb="m">
            <CustomText
              variant="body"
              fontSize={15}
              color="disabledTextColor"
              textAlign="center"
            >
              You cannot find a token?{" "}
                <CustomText
                  variant="body"
                  fontSize={15}
                  color="secondaryColor"
                  onPress={handleImportToken}
                >
                  Import token
                </CustomText>
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={(chainSymbol) => {
          setSelectedChain(chainSymbol);
          chainBottomSheetRef.current?.close();
        }}
      />

      {/* Import Token Modal */}
      <ImportTokenModal
        allChains={walletChains}
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportToken={handleImportTokenSubmit}
        mainUserWalletGroup={mainUserWalletGroup}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Token Imported Successfully!"
        message={`${importedTokenData?.symbol || 'Token'} has been added to your portfolio and is now available for trading.`}
        buttonText="Continue"
        onButtonPress={() => {
          setShowSuccessModal(false);
          onClose();
          if (onImportToken) {
            onImportToken();
          }
        }}
      />
    </Modal>
  );
};

export default ManageTokensModal;
